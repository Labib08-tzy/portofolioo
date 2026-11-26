import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { SKILL_GROUPS } from "../data/skills";
import {
  FRAME_HEIGHT,
  FRAME_WIDTH,
  IS_MOBILE_FRAMES,
  SCAN_END_FRAME,
  TOTAL_FRAMES,
  frameSrc,
  profileHud,
} from "../data/site";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { PillButton } from "./ui/PillButton";

interface EyeScanProps {
  frames: Array<CanvasImageSource | undefined>;
  allLoaded?: boolean;
  bgProgress?: number;
  onFrameFocus?: (frameIndex: number) => void;
}

interface SharpRect {
  x: number;
  y: number;
  w: number;
  h: number;
  vw: number;
  vh: number;
}

const ARC_BAR_INDICES = Array.from({ length: 24 }, (_, i) => i);

const SKILL_CALLOUTS = [
  {
    id: "frontend",
    label: "FRONTEND",
    items:
      SKILL_GROUPS.find((g) => g.category === "Frontend")
        ?.items.slice(0, 3)
        .join(" · ") ?? "React · TypeScript · Tailwind CSS",
    // Normalized coordinates inside sharp figure box (0..1)
    anchorX: 0.34,
    anchorY: 0.34,
    // Target anchor in viewport % (outside center 40%)
    targetXRatio: 0.16,
    targetYRatio: 0.24,
    posClass: "lg:top-[20%] lg:left-6 xl:left-10",
  },
  {
    id: "backend",
    label: "BACKEND",
    items:
      SKILL_GROUPS.find((g) => g.category === "Backend")?.items.join(" · ") ??
      "PHP · Laravel · MySQL",
    anchorX: 0.31,
    anchorY: 0.7,
    targetXRatio: 0.16,
    targetYRatio: 0.74,
    posClass: "lg:bottom-[20%] lg:left-6 xl:left-10",
  },
  {
    id: "mobile",
    label: "MOBILE",
    items:
      SKILL_GROUPS.find((g) => g.category === "Mobile")?.items.join(" · ") ??
      "Flutter",
    anchorX: 0.66,
    anchorY: 0.33,
    targetXRatio: 0.84,
    targetYRatio: 0.22,
    posClass: "lg:top-[18%] lg:right-6 xl:right-10",
  },
] as const;

function computeSharpRect(vw: number, vh: number): SharpRect {
  const aspect = FRAME_WIDTH / FRAME_HEIGHT;
  const isPortraitMobile = vw < vh && vw < 1024;

  if (isPortraitMobile) {
    const w = vw;
    const h = vw / aspect;
    return { x: 0, y: 0, w, h, vw, vh };
  }

  const h = vh;
  const w = h * aspect;
  const x = (vw - w) / 2;
  return { x, y: 0, w, h, vw, vh };
}

function readInkColor(): string {
  if (typeof window === "undefined") return "black";
  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue("--c-ink")
      .trim() || "black"
  );
}

interface CanvasScratch {
  blurA: HTMLCanvasElement;
  blurB: HTMLCanvasElement;
  sharp: HTMLCanvasElement;
  inkColor: string;
}

function createScratch(): CanvasScratch {
  return {
    blurA: document.createElement("canvas"),
    blurB: document.createElement("canvas"),
    sharp: document.createElement("canvas"),
    inkColor: readInkColor(),
  };
}

function getSourceSize(img: CanvasImageSource): { w: number; h: number } {
  if (img instanceof HTMLImageElement) {
    return { w: img.naturalWidth, h: img.naturalHeight };
  }
  if ("width" in img && "height" in img) {
    return {
      w: typeof img.width === "number" ? img.width : 0,
      h: typeof img.height === "number" ? img.height : 0,
    };
  }
  return { w: 0, h: 0 };
}

function findNearestFrame(
  frames: Array<CanvasImageSource | undefined>,
  targetIdx: number
): CanvasImageSource | undefined {
  if (frames[targetIdx]) return frames[targetIdx];
  for (let offset = 1; offset < frames.length; offset++) {
    if (targetIdx - offset >= 0 && frames[targetIdx - offset]) {
      return frames[targetIdx - offset];
    }
    if (targetIdx + offset < frames.length && frames[targetIdx + offset]) {
      return frames[targetIdx + offset];
    }
  }
  return undefined;
}

function renderEyeScanFrame(
  canvas: HTMLCanvasElement,
  img: CanvasImageSource | undefined,
  scratch: CanvasScratch
): SharpRect | null {
  if (!img) return null;
  const { w: srcW, h: srcH } = getSourceSize(img);
  if (!srcW || !srcH) return null;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const rect = canvas.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return null;

  const vw = rect.width;
  const vh = rect.height;
  const maxDpr = vw < 768 || IS_MOBILE_FRAMES ? 1.5 : 2;
  const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
  const targetW = Math.round(vw * dpr);
  const targetH = Math.round(vh * dpr);

  if (canvas.width !== targetW || canvas.height !== targetH) {
    canvas.width = targetW;
    canvas.height = targetH;
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(0, 0, targetW, targetH);

  // 1) Blurred + darkened cover backdrop (two-pass downscale-upscale, Safari-safe)
  const imgAspect = srcW / srcH;
  const viewAspect = vw / vh;
  let coverW = targetW;
  let coverH = targetH;
  let coverX = 0;
  let coverY = 0;

  if (viewAspect > imgAspect) {
    coverW = targetW;
    coverH = targetW / imgAspect;
    coverY = (targetH - coverH) / 2;
  } else {
    coverH = targetH;
    coverW = targetH * imgAspect;
    coverX = (targetW - coverW) / 2;
  }

  const blurW1 = 64;
  const blurH1 = Math.max(1, Math.round((blurW1 * vh) / vw));
  const blurW2 = 28;
  const blurH2 = Math.max(1, Math.round((blurW2 * vh) / vw));

  scratch.blurA.width = blurW1;
  scratch.blurA.height = blurH1;
  scratch.blurB.width = blurW2;
  scratch.blurB.height = blurH2;

  const bCtxA = scratch.blurA.getContext("2d");
  const bCtxB = scratch.blurB.getContext("2d");
  if (bCtxA && bCtxB) {
    bCtxA.imageSmoothingEnabled = true;
    bCtxA.imageSmoothingQuality = "high";
    bCtxB.imageSmoothingEnabled = true;
    bCtxB.imageSmoothingQuality = "high";

    const scaleRatioX = blurW1 / targetW;
    const scaleRatioY = blurH1 / targetH;
    bCtxA.clearRect(0, 0, blurW1, blurH1);
    bCtxA.drawImage(
      img,
      coverX * scaleRatioX,
      coverY * scaleRatioY,
      coverW * scaleRatioX,
      coverH * scaleRatioY
    );

    bCtxB.clearRect(0, 0, blurW2, blurH2);
    bCtxB.drawImage(scratch.blurA, 0, 0, blurW2, blurH2);

    ctx.drawImage(scratch.blurB, 0, 0, targetW, targetH);
  }

  // Darken backdrop with --c-ink at ~0.55 alpha
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = scratch.inkColor;
  ctx.fillRect(0, 0, targetW, targetH);
  ctx.restore();

  // 2) Sharp figure (contain by height on landscape; 100vw top-center on portrait)
  const sharpRect = computeSharpRect(vw, vh);
  const sw = Math.max(1, Math.round(sharpRect.w * dpr));
  const sh = Math.max(1, Math.round(sharpRect.h * dpr));

  if (scratch.sharp.width !== sw || scratch.sharp.height !== sh) {
    scratch.sharp.width = sw;
    scratch.sharp.height = sh;
  }

  const sCtx = scratch.sharp.getContext("2d");
  if (sCtx) {
    sCtx.globalCompositeOperation = "source-over";
    sCtx.imageSmoothingEnabled = true;
    sCtx.imageSmoothingQuality = "high";
    sCtx.clearRect(0, 0, sw, sh);
    sCtx.drawImage(img, 0, 0, sw, sh);

    // 3) Multi-directional mask blending via destination-in
    sCtx.globalCompositeOperation = "destination-in";

    // (a) Horizontal linear fade: 0% -> 22% -> 78% -> 100%
    const hGrad = sCtx.createLinearGradient(0, 0, sw, 0);
    hGrad.addColorStop(0, "rgba(0,0,0,0)");
    hGrad.addColorStop(0.22, "rgba(0,0,0,1)");
    hGrad.addColorStop(0.78, "rgba(0,0,0,1)");
    hGrad.addColorStop(1, "rgba(0,0,0,0)");
    sCtx.fillStyle = hGrad;
    sCtx.fillRect(0, 0, sw, sh);

    // (b) Vertical linear fade: 0% -> 12% -> 85% -> 100%
    const vGrad = sCtx.createLinearGradient(0, 0, 0, sh);
    vGrad.addColorStop(0, "rgba(0,0,0,0)");
    vGrad.addColorStop(0.12, "rgba(0,0,0,1)");
    vGrad.addColorStop(0.85, "rgba(0,0,0,1)");
    vGrad.addColorStop(1, "rgba(0,0,0,0)");
    sCtx.fillStyle = vGrad;
    sCtx.fillRect(0, 0, sw, sh);

    // (c) Radial ellipse mask at center
    sCtx.save();
    sCtx.translate(sw * 0.5, sh * 0.46);
    sCtx.scale(1, sh / sw);
    const r = sw * 0.54;
    const rGrad = sCtx.createRadialGradient(0, 0, r * 0.25, 0, 0, r);
    rGrad.addColorStop(0, "rgba(0,0,0,1)");
    rGrad.addColorStop(0.68, "rgba(0,0,0,0.9)");
    rGrad.addColorStop(1, "rgba(0,0,0,0)");
    sCtx.fillStyle = rGrad;
    sCtx.fillRect(-sw, -sw, sw * 2, sw * 2);
    sCtx.restore();

    sCtx.globalCompositeOperation = "source-over";

    ctx.drawImage(
      scratch.sharp,
      sharpRect.x * dpr,
      sharpRect.y * dpr,
      sw,
      sh
    );
  }

  return sharpRect;
}

function CornerBrackets() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-4 z-20 sm:inset-6"
    >
      <span className="absolute top-0 left-0 h-5 w-5 border-t border-l border-forest-600" />
      <span className="absolute top-0 right-0 h-5 w-5 border-t border-r border-forest-600" />
      <span className="absolute bottom-0 left-0 h-5 w-5 border-b border-l border-forest-600" />
      <span className="absolute right-0 bottom-0 h-5 w-5 border-b border-r border-forest-600" />
      <span className="absolute top-1/2 left-0 hidden h-8 w-px -translate-y-1/2 bg-forest-600/80 sm:block" />
      <span className="absolute top-1/2 right-0 hidden h-8 w-px -translate-y-1/2 bg-forest-600/80 sm:block" />
    </div>
  );
}

function SectionEdgeBlends() {
  return (
    <>
      {/* 20vh top & bottom fades for seamless Hero -> EyeScan -> About transition */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[20vh] bg-gradient-to-b from-ink via-ink/60 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[20vh] bg-gradient-to-t from-ink via-ink/60 to-transparent"
      />
      {/* Subtle vignette, scanlines, and film grain (heavy overlays desktop-only) */}
      <div
        aria-hidden="true"
        className="eye-scan-vignette pointer-events-none absolute inset-0 z-10"
      />
      <div
        aria-hidden="true"
        className="bg-scanlines-subtle pointer-events-none absolute inset-0 z-10 hidden opacity-30 md:block"
      />
      <div
        aria-hidden="true"
        className="bg-noise-subtle pointer-events-none absolute inset-0 z-10 hidden md:block"
      />
    </>
  );
}

function IdentityHudCard({
  opacity,
  y,
  reducedMotion,
}: {
  opacity?: MotionValue<number>;
  y?: MotionValue<number>;
  reducedMotion: boolean;
}) {
  return (
    <motion.div
      style={reducedMotion ? undefined : { opacity, y }}
      className="w-full border border-forest-600 bg-forest-900/80 p-5 backdrop-blur-md sm:p-6"
    >
      <div className="flex items-center justify-between border-b border-forest-600/80 pb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-sage">
        <span>IDENTITY_HUD</span>
        <span className="rounded-full border border-brass/70 bg-ink/80 px-2.5 py-0.5 text-brass">
          VERIFIED
        </span>
      </div>

      <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-sand sm:text-3xl">
        {profileHud.name}
      </h2>
      <p className="mt-1 font-mono text-xs text-brass">{profileHud.role}</p>
      <p className="mt-1 font-mono text-xs text-sage">{profileHud.school}</p>

      <div className="mt-4 border-t border-forest-600/60 pt-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-sage">
          Pencapaian
        </p>
        <p className="mt-1.5 inline-flex rounded-full border border-forest-600 bg-ink/85 px-3 py-1 font-mono text-xs text-sand">
          {profileHud.achievement}
        </p>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-sage">{profileHud.bio}</p>

      <div className="mt-5 flex flex-wrap gap-3 border-t border-forest-600/60 pt-4">
        <PillButton href="#contact" variant="primary" size="sm">
          Hubungi
        </PillButton>
        <PillButton href="#projects" variant="outline" size="sm">
          Lihat Project
        </PillButton>
      </div>
    </motion.div>
  );
}

function CalloutConnectorSvg({
  sharpRect,
  lineDraw,
  reducedMotion,
}: {
  sharpRect: SharpRect | null;
  lineDraw?: MotionValue<number>;
  reducedMotion: boolean;
}) {
  if (!sharpRect || sharpRect.vw < 1024) return null;

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${sharpRect.vw} ${sharpRect.vh}`}
      className="pointer-events-none absolute inset-0 z-20 hidden h-full w-full lg:block"
    >
      {SKILL_CALLOUTS.map((c) => {
        const ax = sharpRect.x + sharpRect.w * c.anchorX;
        const ay = sharpRect.y + sharpRect.h * c.anchorY;
        const tx = sharpRect.vw * c.targetXRatio;
        const ty = sharpRect.vh * c.targetYRatio;
        const elbowX = ax + (tx - ax) * 0.55;
        const d = `M ${ax.toFixed(1)} ${ay.toFixed(1)} L ${elbowX.toFixed(
          1
        )} ${ty.toFixed(1)} L ${tx.toFixed(1)} ${ty.toFixed(1)}`;

        return (
          <g key={c.id}>
            <motion.path
              d={d}
              fill="none"
              stroke="var(--c-forest-600)"
              strokeWidth="1.5"
              style={reducedMotion ? undefined : { pathLength: lineDraw }}
            />
            <motion.circle
              cx={ax}
              cy={ay}
              r="4.5"
              fill="var(--c-brass)"
              style={reducedMotion ? undefined : { opacity: lineDraw }}
            />
          </g>
        );
      })}
    </svg>
  );
}

export function EyeScan({
  frames,
  allLoaded = true,
  bgProgress = 100,
  onFrameFocus,
}: EyeScanProps) {
  const reducedMotion = useReducedMotion();
  const hasAnyFrame = frames.some(Boolean);

  if (reducedMotion || !hasAnyFrame) {
    return <EyeScanStatic frames={frames} />;
  }

  return (
    <EyeScanInteractive
      frames={frames}
      allLoaded={allLoaded}
      bgProgress={bgProgress}
      onFrameFocus={onFrameFocus}
    />
  );
}

function EyeScanStatic({
  frames,
}: {
  frames: Array<CanvasImageSource | undefined>;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [sharpRect, setSharpRect] = useState<SharpRect | null>(null);

  useEffect(() => {
    const scratch = createScratch();
    let img = findNearestFrame(frames, SCAN_END_FRAME - 1);

    const draw = () => {
      if (!canvasRef.current || !img) return;
      const rect = renderEyeScanFrame(canvasRef.current, img, scratch);
      if (rect) setSharpRect(rect);
    };

    if (!img) {
      const fallbackImg = new Image();
      fallbackImg.src = frameSrc(SCAN_END_FRAME);
      fallbackImg.onload = () => {
        img = fallbackImg;
        draw();
      };
    } else {
      draw();
    }

    const onResize = () => draw();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [frames]);

  return (
    <section
      id="eye-scan"
      aria-label="Profil visual dan ringkasan identitas"
      className="relative h-[100svh] w-full overflow-hidden bg-ink"
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 block h-full w-full"
      />
      <SectionEdgeBlends />
      <CornerBrackets />

      <div
        aria-hidden="true"
        className="pointer-events-none relative z-20 flex items-center justify-between px-6 pt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-sage sm:px-10 sm:pt-8"
      >
        <span>SYS.SCAN // 001</span>
        <div className="flex items-center gap-4">
          <span className="text-sand">
            FRAME {String(SCAN_END_FRAME).padStart(3, "0")}/
            {String(TOTAL_FRAMES).padStart(3, "0")}
          </span>
          <span className="text-brass">100%</span>
        </div>
      </div>

      <CalloutConnectorSvg sharpRect={sharpRect} reducedMotion={true} />

      {/* Callouts & Identity HUD */}
      <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-end p-4 pb-8 sm:p-6 lg:block">
        <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3 lg:contents">
          {SKILL_CALLOUTS.map((callout) => (
            <div
              key={callout.id}
              className={`pointer-events-auto rounded-full border border-forest-600 bg-forest-900/85 px-3.5 py-1.5 font-mono text-[11px] backdrop-blur-sm lg:absolute lg:max-w-[270px] ${callout.posClass}`}
            >
              <span className="font-bold text-brass">{callout.label}</span>
              <span className="mx-1.5 text-forest-600">//</span>
              <span className="text-sand">{callout.items}</span>
            </div>
          ))}
        </div>

        <div className="pointer-events-auto mx-auto w-full max-w-xl lg:absolute lg:top-1/2 lg:right-8 lg:w-[320px] lg:-translate-y-1/2 xl:right-12 xl:w-[360px]">
          <IdentityHudCard reducedMotion={true} />
        </div>
      </div>
    </section>
  );
}

function EyeScanInteractive({
  frames,
  allLoaded,
  bgProgress,
  onFrameFocus,
}: {
  frames: Array<CanvasImageSource | undefined>;
  allLoaded: boolean;
  bgProgress: number;
  onFrameFocus?: (frameIndex: number) => void;
}) {
  const containerRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameReadoutRef = useRef<HTMLSpanElement | null>(null);
  const pctReadoutRef = useRef<HTMLSpanElement | null>(null);
  const scanPctRef = useRef<HTMLSpanElement | null>(null);
  const lastDrawnRef = useRef<number>(-1);
  const pendingFrameRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const [sharpRect, setSharpRect] = useState<SharpRect | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 32,
    mass: 0.25,
  });

  const frameIndex = useTransform(
    smoothProgress,
    [0, 0.65],
    [0, SCAN_END_FRAME - 1]
  );

  // Decorative curved data bars behind head
  const arcScale = useTransform(smoothProgress, [0.08, 0.65], [0.18, 1]);
  const arcOpacity = useTransform(smoothProgress, [0.04, 0.2], [0.15, 0.9]);

  // Single horizontal scan beam (50% -> 68%)
  const scanTop = useTransform(smoothProgress, [0.5, 0.68], ["14%", "82%"]);
  const scanBeamOpacity = useTransform(
    smoothProgress,
    [0.49, 0.52, 0.66, 0.69],
    [0, 1, 1, 0]
  );
  const verifiedOpacity = useTransform(smoothProgress, [0.68, 0.74], [0, 1]);

  // Callout lines & labels (70% -> 90%)
  const lineDraw = useTransform(smoothProgress, [0.7, 0.86], [0, 1]);
  const callout1Opacity = useTransform(smoothProgress, [0.74, 0.81], [0, 1]);
  const callout2Opacity = useTransform(smoothProgress, [0.78, 0.85], [0, 1]);
  const callout3Opacity = useTransform(smoothProgress, [0.82, 0.89], [0, 1]);

  // Identity HUD card (80% -> 100%)
  const panelOpacity = useTransform(smoothProgress, [0.8, 0.92], [0, 1]);
  const panelY = useTransform(smoothProgress, [0.8, 0.92], [24, 0]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const scratch = createScratch();

    const initialImg = findNearestFrame(frames, 0);
    const initialRect = renderEyeScanFrame(canvas, initialImg, scratch);
    if (initialRect) setSharpRect(initialRect);
    lastDrawnRef.current = 0;

    const scheduleDraw = (idx: number) => {
      pendingFrameRef.current = idx;
      if (rafRef.current) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = 0;
        const clamped = Math.max(
          0,
          Math.min(SCAN_END_FRAME - 1, Math.round(pendingFrameRef.current))
        );
        onFrameFocus?.(clamped);
        if (clamped !== lastDrawnRef.current && canvasRef.current) {
          const source = findNearestFrame(frames, clamped);
          renderEyeScanFrame(canvasRef.current, source, scratch);
          lastDrawnRef.current = clamped;
          if (frameReadoutRef.current) {
            frameReadoutRef.current.textContent = `FRAME ${String(
              clamped + 1
            ).padStart(3, "0")}/${String(TOTAL_FRAMES).padStart(3, "0")}`;
          }
        }
      });
    };

    const unsubFrame = frameIndex.on("change", (latest) => {
      scheduleDraw(latest);
    });

    const unsubProgress = smoothProgress.on("change", (p) => {
      if (pctReadoutRef.current) {
        pctReadoutRef.current.textContent = `${String(
          Math.round(Math.max(0, Math.min(1, p)) * 100)
        ).padStart(3, "0")}%`;
      }
      if (scanPctRef.current) {
        const scanNorm = Math.max(0, Math.min(1, (p - 0.5) / 0.18));
        scanPctRef.current.textContent = `SCANNING... ${Math.round(
          scanNorm * 100
        )}%`;
      }
    });

    const onResize = () => {
      if (!canvasRef.current) return;
      const current = Math.max(0, lastDrawnRef.current);
      const updated = renderEyeScanFrame(
        canvasRef.current,
        frames[current],
        scratch
      );
      if (updated) setSharpRect(updated);
    };

    window.addEventListener("resize", onResize);
    return () => {
      unsubFrame();
      unsubProgress();
      window.removeEventListener("resize", onResize);
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [frames, frameIndex, smoothProgress]);

  const calloutOpacities = [callout1Opacity, callout2Opacity, callout3Opacity];

  return (
    <section
      ref={containerRef}
      id="eye-scan"
      aria-label="Profil visual dan ringkasan identitas"
      className="relative h-[290vh] bg-ink md:h-[400vh]"
    >
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden bg-ink">
        {/* Full-viewport 3-layer canvas (blurred backdrop + sharp figure + mask fade) */}
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 block h-full w-full"
        />

        <SectionEdgeBlends />
        <CornerBrackets />

        {/* Top Frame Readout */}
        <div
          aria-hidden="true"
          className="pointer-events-none relative z-20 flex items-center justify-between px-6 pt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-sage sm:px-10 sm:pt-8"
        >
          <div className="flex items-center gap-3">
            <span>SYS.SCAN // 001</span>
            {!allLoaded ? (
              <span className="rounded-full border border-forest-600 bg-forest-900/90 px-2.5 py-0.5 text-[10px] text-brass">
                MEMUAT ANIMASI {bgProgress}%
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-4">
            <span ref={frameReadoutRef} className="text-sand">
              FRAME 001/{String(TOTAL_FRAMES).padStart(3, "0")}
            </span>
            <span ref={pctReadoutRef} className="text-brass">
              000%
            </span>
          </div>
        </div>

        {/* Curved Decorative Data Bar Arc behind head */}
        <motion.div
          aria-hidden="true"
          style={{ opacity: arcOpacity }}
          className="pointer-events-none absolute top-[10%] left-1/2 z-20 hidden -translate-x-1/2 items-end gap-1.5 sm:flex"
        >
          {ARC_BAR_INDICES.map((idx) => {
            const norm = (idx - 11.5) / 11.5;
            const archHeight = Math.round(62 - norm * norm * 36);
            const archDrop = Math.round(norm * norm * 28);
            const colorClass =
              idx % 5 === 0
                ? "bg-brass/75"
                : idx % 2 === 0
                  ? "bg-sage/50"
                  : "bg-forest-600/80";
            return (
              <motion.span
                key={idx}
                style={{
                  height: `${archHeight}px`,
                  transform: `translateY(${archDrop}px)`,
                  scaleY: arcScale,
                }}
                className={`w-1 origin-bottom rounded-full ${colorClass}`}
              />
            );
          })}
        </motion.div>

        {/* Single Horizontal Scan Beam (50% -> 68%) */}
        <motion.div
          aria-hidden="true"
          style={{ top: scanTop, opacity: scanBeamOpacity }}
          className="pointer-events-none absolute inset-x-[15%] z-20 flex flex-col items-center"
        >
          <div className="h-[2px] w-full max-w-xl bg-gradient-to-r from-transparent via-brass to-transparent shadow-[0_0_18px_2px_var(--c-glow-emerald)]" />
          <span
            ref={scanPctRef}
            className="mt-1.5 rounded-full border border-forest-600 bg-ink/90 px-2.5 py-0.5 font-mono text-[10px] tracking-[0.2em] text-brass"
          >
            SCANNING... 0%
          </span>
        </motion.div>

        {/* Identity Verified Badge (after 68%) */}
        <motion.span
          aria-hidden="true"
          style={{ opacity: verifiedOpacity }}
          className="pointer-events-none absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 rounded-full border border-brass/80 bg-ink/90 px-3.5 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-brass lg:inline-flex"
        >
          IDENTITY VERIFIED
        </motion.span>

        {/* Callout Connector SVG computed from sharp figure box */}
        <CalloutConnectorSvg
          sharpRect={sharpRect}
          lineDraw={lineDraw}
          reducedMotion={false}
        />

        {/* Callouts & Identity HUD Card (outside center 40% on desktop; bottom stack on mobile) */}
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-end p-4 pb-8 sm:p-6 lg:block">
          <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3 lg:contents">
            {SKILL_CALLOUTS.map((callout, idx) => (
              <motion.div
                key={callout.id}
                style={{ opacity: calloutOpacities[idx] }}
                className={`pointer-events-auto rounded-full border border-forest-600 bg-forest-900/85 px-3.5 py-1.5 font-mono text-[11px] backdrop-blur-sm lg:absolute lg:max-w-[260px] ${callout.posClass}`}
              >
                <span className="font-bold text-brass">{callout.label}</span>
                <span className="mx-1.5 text-forest-600">//</span>
                <span className="text-sand">{callout.items}</span>
              </motion.div>
            ))}
          </div>

          <div className="pointer-events-auto mx-auto w-full max-w-xl lg:absolute lg:top-1/2 lg:right-8 lg:w-[320px] lg:-translate-y-1/2 xl:right-12 xl:w-[360px]">
            <IdentityHudCard
              opacity={panelOpacity}
              y={panelY}
              reducedMotion={false}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
