import { useEffect, useRef } from "react";
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
  SCAN_END_FRAME,
  TOTAL_FRAMES,
  frameSrc,
  profileHud,
} from "../data/site";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { PillButton } from "./ui/PillButton";

interface EyeScanProps {
  frames: HTMLImageElement[];
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
    // Desktop anchor & callout coordinates (in % of viewport/stage)
    linePath: "M 39 34 L 28 24 L 22 24",
    dotCx: 39,
    dotCy: 34,
    posClass: "lg:top-[19%] lg:left-6 xl:left-10",
  },
  {
    id: "backend",
    label: "BACKEND",
    items:
      SKILL_GROUPS.find((g) => g.category === "Backend")?.items.join(" · ") ??
      "PHP · Laravel · MySQL",
    linePath: "M 38 68 L 28 74 L 22 74",
    dotCx: 38,
    dotCy: 68,
    posClass: "lg:bottom-[20%] lg:left-6 xl:left-10",
  },
  {
    id: "mobile",
    label: "MOBILE",
    items:
      SKILL_GROUPS.find((g) => g.category === "Mobile")?.items.join(" · ") ??
      "Flutter",
    linePath: "M 61 32 L 70 22 L 75 22",
    dotCx: 61,
    dotCy: 32,
    posClass: "lg:top-[16%] lg:right-6 xl:right-10",
  },
] as const;

function drawFrameToCanvas(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement | undefined
) {
  if (!img) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const rect = canvas.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const targetW = Math.round(rect.width * dpr);
  const targetH = Math.round(rect.height * dpr);

  if (canvas.width !== targetW || canvas.height !== targetH) {
    canvas.width = targetW;
    canvas.height = targetH;
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
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

      {/* Edge tick marks */}
      <span className="hidden sm:block absolute top-1/2 left-0 h-8 w-px -translate-y-1/2 bg-forest-600/80" />
      <span className="hidden sm:block absolute top-1/2 right-0 h-8 w-px -translate-y-1/2 bg-forest-600/80" />
    </div>
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

export function EyeScan({ frames }: EyeScanProps) {
  const reducedMotion = useReducedMotion();
  const hasFrames = frames.length >= SCAN_END_FRAME;

  if (reducedMotion || !hasFrames) {
    return (
      <section
        id="eye-scan"
        aria-label="Profil visual dan ringkasan identitas"
        className="relative overflow-hidden border-b border-forest-600 bg-ink py-16 sm:py-24"
      >
        <div
          aria-hidden="true"
          className="ambient-glow-brass pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full blur-3xl"
        />
        <div
          aria-hidden="true"
          className="ambient-glow-emerald pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full blur-3xl"
        />
        <div
          aria-hidden="true"
          className="bg-noise-subtle pointer-events-none absolute inset-0"
        />
        <CornerBrackets />

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
          <div className="relative flex justify-center lg:col-span-7">
            <div
              className="eye-scan-mask relative w-full max-w-[620px] overflow-hidden"
              style={{ aspectRatio: `${FRAME_WIDTH} / ${FRAME_HEIGHT}` }}
            >
              <img
                src={frameSrc(SCAN_END_FRAME)}
                alt=""
                aria-hidden="true"
                className="h-full w-full object-contain"
              />
            </div>
            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-brass/70 bg-ink/90 px-3 py-1 font-mono text-[11px] tracking-widest text-brass">
              IDENTITY VERIFIED
            </span>
          </div>

          <div className="space-y-4 lg:col-span-5">
            <div className="grid gap-2.5 sm:grid-cols-3 lg:grid-cols-1">
              {SKILL_CALLOUTS.map((c) => (
                <div
                  key={c.id}
                  className="rounded-full border border-forest-600 bg-forest-900/85 px-4 py-2 font-mono text-xs backdrop-blur-sm"
                >
                  <span className="text-brass">{c.label}: </span>
                  <span className="text-sand">{c.items}</span>
                </div>
              ))}
            </div>
            <IdentityHudCard reducedMotion={true} />
          </div>
        </div>
      </section>
    );
  }

  return <EyeScanInteractive frames={frames} />;
}

function EyeScanInteractive({ frames }: { frames: HTMLImageElement[] }) {
  const containerRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameReadoutRef = useRef<HTMLSpanElement | null>(null);
  const pctReadoutRef = useRef<HTMLSpanElement | null>(null);
  const scanPctRef = useRef<HTMLSpanElement | null>(null);
  const lastDrawnRef = useRef<number>(-1);
  const pendingFrameRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

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
  const scanTop = useTransform(smoothProgress, [0.5, 0.68], ["12%", "84%"]);
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

    drawFrameToCanvas(canvas, frames[0]);
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
        if (clamped !== lastDrawnRef.current && canvasRef.current) {
          drawFrameToCanvas(canvasRef.current, frames[clamped]);
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
      if (canvasRef.current) {
        const current = Math.max(0, lastDrawnRef.current);
        drawFrameToCanvas(canvasRef.current, frames[current]);
      }
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
      className="relative h-[290vh] border-b border-forest-600 bg-ink md:h-[400vh]"
    >
      <div className="sticky top-0 flex h-[100svh] w-full flex-col justify-between overflow-hidden bg-ink">
        {/* Ambient glows, noise, scanlines, vignette */}
        <div
          aria-hidden="true"
          className="ambient-glow-brass pointer-events-none absolute -bottom-32 -left-32 h-[520px] w-[520px] rounded-full blur-3xl"
        />
        <div
          aria-hidden="true"
          className="ambient-glow-emerald pointer-events-none absolute -top-32 -right-32 h-[520px] w-[520px] rounded-full blur-3xl"
        />
        <div
          aria-hidden="true"
          className="bg-noise-subtle pointer-events-none absolute inset-0"
        />
        <div
          aria-hidden="true"
          className="bg-scanlines-subtle pointer-events-none absolute inset-0 opacity-30"
        />
        <div
          aria-hidden="true"
          className="eye-scan-vignette pointer-events-none absolute inset-0"
        />

        <CornerBrackets />

        {/* Top Frame Readout */}
        <div
          aria-hidden="true"
          className="pointer-events-none relative z-20 flex items-center justify-between px-6 pt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-sage sm:px-10 sm:pt-8"
        >
          <span>SYS.SCAN // 001</span>
          <div className="flex items-center gap-4">
            <span ref={frameReadoutRef} className="text-sand">
              FRAME 001/{String(TOTAL_FRAMES).padStart(3, "0")}
            </span>
            <span ref={pctReadoutRef} className="text-brass">
              000%
            </span>
          </div>
        </div>

        {/* Center Full-Height Canvas + Curved Arc + Callouts + Identity Card */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pb-6 lg:block lg:px-0 lg:pb-0">
          {/* Curved Decorative Data Bar Arc behind head */}
          <motion.div
            aria-hidden="true"
            style={{ opacity: arcOpacity }}
            className="pointer-events-none absolute top-[10%] left-1/2 hidden -translate-x-1/2 items-end gap-1.5 sm:flex"
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

          {/* Centered Full-Height Figure Canvas with CSS Mask */}
          <div className="relative flex items-center justify-center lg:absolute lg:inset-0">
            <div
              className="eye-scan-mask relative w-full max-w-[440px] sm:max-w-[560px] lg:h-[92svh] lg:w-auto lg:max-w-[92vw]"
              style={{ aspectRatio: `${FRAME_WIDTH} / ${FRAME_HEIGHT}` }}
            >
              <canvas
                ref={canvasRef}
                aria-hidden="true"
                className="block h-full w-full"
              />
            </div>

            {/* Single Horizontal Scan Beam (50% -> 68%) */}
            <motion.div
              aria-hidden="true"
              style={{ top: scanTop, opacity: scanBeamOpacity }}
              className="pointer-events-none absolute inset-x-[12%] z-20 flex flex-col items-center"
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
              className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full border border-brass/80 bg-ink/90 px-3.5 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-brass lg:bottom-8"
            >
              IDENTITY VERIFIED
            </motion.span>
          </div>

          {/* Desktop SVG Pointer Lines for Skill Callouts (70% -> 90%) */}
          <svg
            aria-hidden="true"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 z-20 hidden h-full w-full lg:block"
          >
            {SKILL_CALLOUTS.map((callout) => (
              <g key={callout.id}>
                <motion.path
                  d={callout.linePath}
                  fill="none"
                  stroke="var(--c-forest-600)"
                  strokeWidth="0.22"
                  style={{ pathLength: lineDraw }}
                />
                <motion.circle
                  cx={callout.dotCx}
                  cy={callout.dotCy}
                  r="0.55"
                  fill="var(--c-brass)"
                  style={{ opacity: lineDraw }}
                />
              </g>
            ))}
          </svg>

          {/* Skill Callout Pills (real DOM text) */}
          <div className="mt-3 grid w-full max-w-xl grid-cols-1 gap-2 sm:grid-cols-3 lg:pointer-events-none lg:static lg:mt-0 lg:block">
            {SKILL_CALLOUTS.map((callout, idx) => (
              <motion.div
                key={callout.id}
                style={{ opacity: calloutOpacities[idx] }}
                className={`rounded-full border border-forest-600 bg-forest-900/85 px-3.5 py-1.5 font-mono text-[11px] backdrop-blur-sm lg:pointer-events-auto lg:absolute lg:z-20 lg:max-w-[270px] ${callout.posClass}`}
              >
                <span className="font-bold text-brass">{callout.label}</span>
                <span className="mx-1.5 text-forest-600">//</span>
                <span className="text-sand">{callout.items}</span>
              </motion.div>
            ))}
          </div>

          {/* Identity Glass HUD Card (80% -> 100%) */}
          <div className="mt-3 w-full max-w-xl lg:absolute lg:top-1/2 lg:right-8 lg:z-30 lg:mt-0 lg:w-[340px] lg:-translate-y-1/2 xl:right-12 xl:w-[380px]">
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
