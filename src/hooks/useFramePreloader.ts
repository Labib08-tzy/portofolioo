import { useCallback, useEffect, useRef, useState } from "react";
import { TOTAL_FRAMES, frameSrc } from "../data/site";

export type PreloadStatus = "loading" | "ready" | "error";

export interface FramePreloadResult {
  frames: HTMLImageElement[];
  progress: number;
  status: PreloadStatus;
  failedCount: number;
  dismissError: () => void;
}

const SESSION_KEY = "labib_frames_preloaded";
const CONCURRENCY = 8;

async function loadSingleFrame(src: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.decoding = "async";
  img.src = src;

  if (typeof img.decode === "function") {
    try {
      await img.decode();
      return img;
    } catch {
      // Fallback to onload/onerror if decode rejects before load
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

export function useFramePreloader(
  reducedMotion: boolean
): FramePreloadResult {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<PreloadStatus>("loading");
  const [failedCount, setFailedCount] = useState(0);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const dismissedRef = useRef(false);

  const dismissError = useCallback(() => {
    dismissedRef.current = true;
    setStatus("ready");
  }, []);

  useEffect(() => {
    let cancelled = false;
    const isRepeatVisit =
      typeof window !== "undefined" &&
      window.sessionStorage.getItem(SESSION_KEY) === "1";

    const total = TOTAL_FRAMES;
    const loadedFrames: HTMLImageElement[] = new Array(total);
    let completed = 0;
    let failures = 0;
    let nextIndex = 1;

    async function worker() {
      while (!cancelled) {
        const current = nextIndex;
        if (current > total) return;
        nextIndex += 1;

        try {
          const img = await loadSingleFrame(frameSrc(current));
          if (!cancelled) {
            loadedFrames[current - 1] = img;
          }
        } catch {
          failures += 1;
        } finally {
          if (!cancelled) {
            completed += 1;
            const pct = Math.round((completed / total) * 100);
            setProgress(pct);
          }
        }
      }
    }

    const startTime = performance.now();
    const minDuration = reducedMotion ? 150 : isRepeatVisit ? 250 : 500;

    Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, total) }, () => worker())
    ).then(() => {
      if (cancelled) return;
      framesRef.current = loadedFrames.filter(Boolean);
      setFailedCount(failures);

      const elapsed = performance.now() - startTime;
      const remaining = Math.max(0, minDuration - elapsed);

      window.setTimeout(() => {
        if (cancelled || dismissedRef.current) return;
        if (failures > 0 && framesRef.current.length === 0) {
          setStatus("error");
        } else {
          try {
            window.sessionStorage.setItem(SESSION_KEY, "1");
          } catch {
            // Ignore storage errors
          }
          setStatus("ready");
        }
      }, remaining);
    });

    return () => {
      cancelled = true;
    };
  }, [reducedMotion]);

  return {
    frames: framesRef.current,
    progress,
    status,
    failedCount,
    dismissError,
  };
}

