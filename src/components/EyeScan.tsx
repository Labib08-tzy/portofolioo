import { useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  FRAME_HEIGHT,
  FRAME_WIDTH,
  SCAN_END_FRAME,
  frameSrc,
  profileHud,
} from "../data/site";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { PillButton } from "./ui/PillButton";

interface EyeScanProps {
  frames: HTMLImageElement[];
}

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

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}

function HudPanelContent({
  item1Opacity,
  item2Opacity,
  item3Opacity,
  item4Opacity,
  reducedMotion,
}: {
  item1Opacity?: MotionValue<number>;
  item2Opacity?: MotionValue<number>;
  item3Opacity?: MotionValue<number>;
  item4Opacity?: MotionValue<number>;
  reducedMotion: boolean;
}) {
  return (
    <div className="border border-forest-600 bg-forest-900/90 p-5 shadow-[6px_6px_0_0_var(--c-forest-600)] backdrop-blur-sm sm:p-6">
      <div className="flex items-center justify-between border-b border-forest-600/80 pb-3 font-mono text-xs uppercase tracking-[0.18em] text-sage">
        <span>IDENTITY_HUD</span>
        <span className="rounded-full border border-brass/60 bg-ink px-2.5 py-0.5 text-brass">
          VERIFIED
        </span>
      </div>

      <motion.div
        style={reducedMotion ? undefined : { opacity: item1Opacity }}
        className="mt-4"
      >
        <h2 className="font-display text-2xl font-bold tracking-tight text-sand sm:text-3xl">
          {profileHud.name}
        </h2>
        <p className="mt-1 font-mono text-xs text-brass">{profileHud.role}</p>
        <p className="mt-1 font-mono text-xs text-sage">{profileHud.school}</p>
      </motion.div>

      <motion.div
        style={reducedMotion ? undefined : { opacity: item2Opacity }}
        className="mt-4 border-t border-forest-600/60 pt-4"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-sage">
          Pencapaian Utama
        </p>
        <p className="mt-1.5 inline-flex items-center rounded-full border border-forest-600 bg-ink px-3 py-1 font-mono text-xs text-sand">
          {profileHud.achievement}
        </p>
      </motion.div>

      <motion.div
        style={reducedMotion ? undefined : { opacity: item3Opacity }}
        className="mt-4 border-t border-forest-600/60 pt-4"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-sage">
          Skill Utama
        </p>
        <ul className="mt-2 flex flex-wrap gap-2" aria-label="Skill utama">
          {profileHud.skills.map((skill) => (
            <li
              key={skill}
              className="rounded-full border border-forest-600 bg-ink px-3 py-1 font-mono text-xs text-sand"
            >
              {skill}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm leading-relaxed text-sage">
          {profileHud.bio}
        </p>
      </motion.div>

      <motion.div
        style={reducedMotion ? undefined : { opacity: item4Opacity }}
        className="mt-5 flex flex-wrap gap-3 border-t border-forest-600/60 pt-4"
      >
        <PillButton href="#contact" variant="primary" size="sm">
          Hubungi
        </PillButton>
        <PillButton href="#projects" variant="outline" size="sm">
          Lihat Project
        </PillButton>
      </motion.div>
    </div>
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

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
          <div className="flex justify-center lg:col-span-7">
            <div
              className="relative w-[min(90vw,720px)] overflow-hidden border border-forest-600 bg-forest-900 shadow-[8px_8px_0_0_var(--c-forest-600)]"
              style={{ aspectRatio: `${FRAME_WIDTH} / ${FRAME_HEIGHT}` }}
            >
              <img
                src={frameSrc(SCAN_END_FRAME)}
                alt=""
                aria-hidden="true"
                className="h-full w-full object-cover"
              />
              <span className="absolute bottom-3 left-3 rounded-full border border-forest-600 bg-ink/90 px-3 py-1 font-mono text-[11px] tracking-widest text-brass">
                SCAN COMPLETE
              </span>
            </div>
          </div>

          <div className="lg:col-span-5">
            <HudPanelContent reducedMotion={true} />
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

  const frameScale = useTransform(smoothProgress, [0.65, 0.75], [1, 1.03]);
  const scanBadgeOpacity = useTransform(smoothProgress, [0.63, 0.68], [0, 1]);

  const panelOpacity = useTransform(smoothProgress, [0.75, 0.84], [0, 1]);
  const panelY = useTransform(smoothProgress, [0.75, 0.84], [24, 0]);
  const item1Opacity = useTransform(smoothProgress, [0.77, 0.85], [0, 1]);
  const item2Opacity = useTransform(smoothProgress, [0.81, 0.89], [0, 1]);
  const item3Opacity = useTransform(smoothProgress, [0.85, 0.93], [0, 1]);
  const item4Opacity = useTransform(smoothProgress, [0.89, 0.97], [0, 1]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Draw initial frame 0
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
        }
      });
    };

    const unsubscribe = frameIndex.on("change", (latest) => {
      scheduleDraw(latest);
    });

    const onResize = () => {
      if (canvasRef.current) {
        const current = Math.max(0, lastDrawnRef.current);
        drawFrameToCanvas(canvasRef.current, frames[current]);
      }
    };

    window.addEventListener("resize", onResize);
    return () => {
      unsubscribe();
      window.removeEventListener("resize", onResize);
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [frames, frameIndex]);

  return (
    <section
      ref={containerRef}
      id="eye-scan"
      aria-label="Profil visual dan ringkasan identitas"
      className="relative h-[280vh] border-b border-forest-600 bg-ink md:h-[400vh]"
    >
      <div className="sticky top-0 flex h-screen w-full items-center overflow-hidden">
        {/* Ambient glows & subtle noise */}
        <div
          aria-hidden="true"
          className="ambient-glow-brass pointer-events-none absolute -bottom-24 -left-24 h-[420px] w-[420px] rounded-full blur-3xl"
        />
        <div
          aria-hidden="true"
          className="ambient-glow-emerald pointer-events-none absolute -top-24 -right-24 h-[420px] w-[420px] rounded-full blur-3xl"
        />
        <div
          aria-hidden="true"
          className="bg-noise-subtle pointer-events-none absolute inset-0"
        />

        <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-6 px-4 py-6 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8">
          {/* Center / Left Frame */}
          <div className="flex flex-col items-center justify-center lg:col-span-7">
            <motion.div
              style={{
                scale: frameScale,
                aspectRatio: `${FRAME_WIDTH} / ${FRAME_HEIGHT}`,
              }}
              className="relative w-[min(90vw,720px)] max-w-full overflow-hidden border border-forest-600 bg-forest-900 shadow-[8px_8px_0_0_var(--c-forest-600)]"
            >
              <canvas
                ref={canvasRef}
                aria-hidden="true"
                className="block h-full w-full"
              />
              <motion.span
                style={{ opacity: scanBadgeOpacity }}
                className="pointer-events-none absolute bottom-3 left-3 rounded-full border border-forest-600 bg-ink/90 px-3 py-1 font-mono text-[11px] tracking-widest text-brass"
              >
                SCAN COMPLETE
              </motion.span>
            </motion.div>
          </div>

          {/* Right (desktop) / Bottom (mobile) HUD Info Panel */}
          <motion.div
            style={{ opacity: panelOpacity, y: panelY }}
            className="lg:col-span-5"
          >
            <HudPanelContent
              item1Opacity={item1Opacity}
              item2Opacity={item2Opacity}
              item3Opacity={item3Opacity}
              item4Opacity={item4Opacity}
              reducedMotion={false}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
