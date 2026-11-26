import { useCallback, useEffect, useRef, useState } from "react";
import { IS_MOBILE_FRAMES, SCAN_END_FRAME, frameSrc } from "../data/site";

export type PreloadStatus = "loading" | "ready" | "error";

export interface FramePreloadResult {
  frames: Array<CanvasImageSource | undefined>;
  progress: number;
  status: PreloadStatus;
  bgProgress: number;
  allLoaded: boolean;
  failedCount: number;
  setPriorityFrame: (frameIndex: number) => void;
  dismissError: () => void;
}

const SESSION_KEY = "labib_frames_preloaded";
const CRITICAL_INITIAL_COUNT = Math.min(12, SCAN_END_FRAME);
const MAX_PRELOAD_WAIT_MS = 4000;
const BG_CONCURRENCY = 4;
const CRITICAL_CONCURRENCY = IS_MOBILE_FRAMES ? 4 : 6;
const ESTIMATED_FRAME_BYTES = IS_MOBILE_FRAMES ? 20_000 : 42_000;

async function decodeWithImage(src: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.decoding = "async";
  img.src = src;

  if (typeof img.decode === "function") {
    try {
      await img.decode();
      return img;
    } catch {
      // Fallback to onload/onerror
    }
  }

  return new Promise<HTMLImageElement>((resolve, reject) => {
    if (img.complete && img.naturalWidth > 0) {
      resolve(img);
      return;
    }
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
  });
}

async function fetchAndDecodeFrame(
  src: string,
  onBytes: (deltaBytes: number, knownTotalBytes?: number) => void
): Promise<CanvasImageSource> {
  if (typeof fetch !== "function") {
    const img = await decodeWithImage(src);
    onBytes(ESTIMATED_FRAME_BYTES, ESTIMATED_FRAME_BYTES);
    return img;
  }

  const res = await fetch(src, { cache: "force-cache" });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${src}`);
  }

  const contentLengthHeader = res.headers.get("content-length");
  const knownTotal = contentLengthHeader
    ? parseInt(contentLengthHeader, 10)
    : undefined;

  let blob: Blob;
  if (res.body && typeof res.body.getReader === "function") {
    const reader = res.body.getReader();
    const chunks: Uint8Array<ArrayBuffer>[] = [];
    let received = 0;
    let announcedTotal = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(new Uint8Array(value));
        received += value.byteLength;
        onBytes(
          value.byteLength,
          !announcedTotal && knownTotal ? knownTotal : undefined
        );
        announcedTotal = true;
      }
    }
    if (!announcedTotal) {
      onBytes(received, knownTotal ?? received);
    }
    blob = new Blob(chunks, {
      type: res.headers.get("content-type") || "image/webp",
    });
  } else {
    blob = await res.blob();
    onBytes(blob.size, knownTotal ?? blob.size);
  }

  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(blob);
    } catch {
      // Fallback to Image element via object URL
    }
  }

  const objectUrl = URL.createObjectURL(blob);
  try {
    return await decodeWithImage(objectUrl);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function useFramePreloader(
  reducedMotion: boolean
): FramePreloadResult {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<PreloadStatus>("loading");
  const [bgProgress, setBgProgress] = useState(0);
  const [allLoaded, setAllLoaded] = useState(false);
  const [failedCount, setFailedCount] = useState(0);

  const framesRef = useRef<Array<CanvasImageSource | undefined>>(
    new Array(SCAN_END_FRAME)
  );
  const priorityFrameRef = useRef(0);
  const dismissedRef = useRef(false);

  const setPriorityFrame = useCallback((frameIndex: number) => {
    priorityFrameRef.current = Math.max(
      0,
      Math.min(SCAN_END_FRAME - 1, Math.round(frameIndex))
    );
  }, []);

  const dismissError = useCallback(() => {
    dismissedRef.current = true;
    setStatus("ready");
  }, []);

  useEffect(() => {
    let cancelled = false;
    const isRepeatVisit =
      typeof window !== "undefined" &&
      window.sessionStorage.getItem(SESSION_KEY) === "1";

    // Build critical frame indices (1..12 + SCAN_END_FRAME)
    const criticalSet = new Set<number>();
    for (let i = 1; i <= CRITICAL_INITIAL_COUNT; i++) criticalSet.add(i);
    criticalSet.add(SCAN_END_FRAME);
    const criticalIndices = Array.from(criticalSet);

    // Remaining frames for background loading
    const remainingSet = new Set<number>();
    for (let i = 1; i <= SCAN_END_FRAME; i++) {
      if (!criticalSet.has(i)) remainingSet.add(i);
    }

    let criticalReceivedBytes = 0;
    let criticalExpectedBytes = criticalIndices.length * ESTIMATED_FRAME_BYTES;
    let criticalFailures = 0;
    let criticalNextPos = 0;
    let readyTriggered = false;

    const finishPreloader = () => {
      if (cancelled || readyTriggered || dismissedRef.current) return;
      readyTriggered = true;

      const loadedCount = framesRef.current.filter(Boolean).length;
      setFailedCount(criticalFailures);

      if (criticalFailures > 0 && loadedCount === 0) {
        setStatus("error");
      } else {
        try {
          window.sessionStorage.setItem(SESSION_KEY, "1");
        } catch {
          // Ignore storage errors
        }
        setProgress(100);
        setStatus("ready");
      }
    };

    const startBackgroundLoad = () => {
      if (remainingSet.size === 0) {
        setBgProgress(100);
        setAllLoaded(true);
        return;
      }

      const totalBg = remainingSet.size;
      let bgCompleted = 0;

      const pickNearestFrame = (): number | null => {
        if (remainingSet.size === 0) return null;
        const target1Based = priorityFrameRef.current + 1;
        let best = -1;
        let bestDist = Infinity;
        for (const candidate of remainingSet) {
          const dist = Math.abs(candidate - target1Based);
          if (dist < bestDist) {
            bestDist = dist;
            best = candidate;
          }
        }
        if (best !== -1) {
          remainingSet.delete(best);
          return best;
        }
        return null;
      };

      async function bgWorker() {
        while (!cancelled) {
          const frameNum = pickNearestFrame();
          if (frameNum === null) return;
          try {
            const source = await fetchAndDecodeFrame(
              frameSrc(frameNum),
              () => {}
            );
            if (!cancelled) {
              framesRef.current[frameNum - 1] = source;
            }
          } catch {
            // Keep going on background error
          } finally {
            if (!cancelled) {
              bgCompleted += 1;
              setBgProgress(Math.round((bgCompleted / totalBg) * 100));
            }
          }
        }
      }

      Promise.all(
        Array.from({ length: Math.min(BG_CONCURRENCY, totalBg) }, () =>
          bgWorker()
        )
      ).then(() => {
        if (!cancelled) {
          setBgProgress(100);
          setAllLoaded(true);
        }
      });
    };

    // Max 4s timeout on slow networks so content appears promptly
    const timeoutId = window.setTimeout(() => {
      finishPreloader();
      startBackgroundLoad();
    }, MAX_PRELOAD_WAIT_MS);

    async function criticalWorker() {
      while (!cancelled) {
        const pos = criticalNextPos;
        if (pos >= criticalIndices.length) return;
        criticalNextPos += 1;
        const frameNum = criticalIndices[pos];

        try {
          let adjusted = false;
          const source = await fetchAndDecodeFrame(
            frameSrc(frameNum),
            (delta, knownTotal) => {
              if (cancelled) return;
              if (!adjusted && knownTotal) {
                criticalExpectedBytes += knownTotal - ESTIMATED_FRAME_BYTES;
                adjusted = true;
              }
              criticalReceivedBytes += delta;
              const pct = Math.min(
                99,
                Math.round(
                  (criticalReceivedBytes / Math.max(1, criticalExpectedBytes)) *
                    100
                )
              );
              setProgress((prev) => Math.max(prev, pct));
            }
          );
          if (!cancelled) {
            framesRef.current[frameNum - 1] = source;
          }
        } catch {
          criticalFailures += 1;
        }
      }
    }

    const startTime = performance.now();
    const minDuration = reducedMotion ? 100 : isRepeatVisit ? 180 : 300;

    Promise.all(
      Array.from(
        { length: Math.min(CRITICAL_CONCURRENCY, criticalIndices.length) },
        () => criticalWorker()
      )
    ).then(() => {
      if (cancelled) return;
      window.clearTimeout(timeoutId);
      const elapsed = performance.now() - startTime;
      const remaining = Math.max(0, minDuration - elapsed);

      window.setTimeout(() => {
        finishPreloader();
        startBackgroundLoad();
      }, remaining);
    });

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [reducedMotion]);

  return {
    frames: framesRef.current,
    progress,
    status,
    bgProgress,
    allLoaded,
    failedCount,
    setPriorityFrame,
    dismissError,
  };
}
