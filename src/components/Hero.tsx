import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion } from "framer-motion";
import type { IntroPhase } from "../canvas/SwarmCanvas";
import { PillButton } from "./ui/PillButton";
import { useReducedMotion } from "../hooks/useReducedMotion";

const SwarmCanvas = lazy(() =>
  import("../canvas/SwarmCanvas").then((m) => ({ default: m.SwarmCanvas }))
);

const HERO_MARQUEE_STACK = [
  "React",
  "TypeScript",
  "Tailwind CSS",
  "Laravel",
  "PHP",
  "MySQL",
  "Flutter",
  "GSAP",
  "Framer Motion",
];

function Crosshair({ className }: { className: string }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute h-3.5 w-3.5 ${className}`}
    >
      <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-forest-600" />
      <span className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-forest-600" />
    </span>
  );
}

export function Hero() {
  const reducedMotion = useReducedMotion();
  const coordsRef = useRef<HTMLSpanElement | null>(null);
  const clockRef = useRef<HTMLSpanElement | null>(null);
  const countRef = useRef<HTMLSpanElement | null>(null);

  const line0Ref = useRef<HTMLSpanElement | null>(null);
  const line1Ref = useRef<HTMLSpanElement | null>(null);
  const line2Ref = useRef<HTMLSpanElement | null>(null);
  const lineRefs = useMemo(() => [line0Ref, line1Ref, line2Ref], []);

  const [introPhase, setIntroPhase] = useState<IntroPhase>(
    reducedMotion ? "ambient" : "gather"
  );

  const isHeadlineVisible =
    reducedMotion || introPhase === "melt" || introPhase === "ambient";

  const handlePointerReadout = useCallback((x: number, y: number) => {
    if (coordsRef.current) {
      coordsRef.current.textContent = `X:${String(x).padStart(4, "0")} // Y:${String(y).padStart(4, "0")}`;
    }
  }, []);

  const handleCountChange = useCallback((count: number) => {
    if (countRef.current) {
      countRef.current.textContent = `SWARM: ${count} UNITS`;
    }
  }, []);

  useEffect(() => {
    const updateClock = () => {
      if (!clockRef.current) return;
      const formatted = new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(new Date());
      clockRef.current.textContent = `${formatted} WIB`;
    };

    updateClock();
    const timer = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section
      id="home"
      className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden border-b border-forest-600 bg-ink bg-grid-pattern"
    >
      {/* Full-bleed Cursor Swarm Canvas (including behind fixed navbar) */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={null}>
          <SwarmCanvas
            reducedMotion={reducedMotion}
            lineRefs={lineRefs}
            onIntroPhase={setIntroPhase}
            onPointerReadout={handlePointerReadout}
            onCountChange={handleCountChange}
          />
        </Suspense>
      </div>

      {/* Ambient glows & subtle noise (hidden on mobile to reduce GPU/fillrate load) */}
      <div
        aria-hidden="true"
        className="ambient-glow-brass pointer-events-none absolute -bottom-36 -left-36 z-0 hidden h-[520px] w-[520px] rounded-full blur-3xl md:block"
      />
      <div
        aria-hidden="true"
        className="ambient-glow-emerald pointer-events-none absolute -top-32 -right-32 z-0 hidden h-[520px] w-[520px] rounded-full blur-3xl md:block"
      />
      <div
        aria-hidden="true"
        className="bg-noise-subtle pointer-events-none absolute inset-0 z-0 hidden md:block"
      />

      {/* Corner registration crosshairs (desktop/tablet) */}
      <Crosshair className="top-16 left-4 hidden sm:block sm:left-6" />
      <Crosshair className="top-16 right-4 hidden sm:block sm:right-6" />
      <Crosshair className="bottom-4 left-4 hidden sm:block sm:left-6" />
      <Crosshair className="right-4 bottom-4 hidden sm:block sm:right-6" />

      {/* Foreground Content */}
      <div className="pointer-events-none relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-between px-[clamp(14px,3.2vw,32px)] pt-[clamp(76px,12vw,96px)] pb-[clamp(16px,3vw,32px)]">
        {/* Top HUD strip */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.45 }}
          className="flex flex-wrap items-center justify-between gap-2 font-mono text-[clamp(10px,1.8vw,12px)] uppercase tracking-[0.16em] text-sage"
        >
          <div className="flex flex-wrap items-center gap-[clamp(6px,1.5vw,12px)]">
            <span className="rounded-full border border-forest-600 bg-forest-900/80 px-[clamp(8px,1.6vw,12px)] py-1 text-brass">
              01 / 07
            </span>
            <span ref={countRef} aria-hidden="true">
              SWARM: -- UNITS
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span
              ref={clockRef}
              aria-hidden="true"
              className="rounded-full border border-forest-600 bg-forest-900/80 px-[clamp(8px,1.6vw,12px)] py-1 text-sand"
            >
              --:--:-- WIB
            </span>
          </div>
        </motion.div>

        {/* Center Stacked Display Headline + CTAs */}
        <div className="my-auto flex flex-col justify-center gap-[clamp(16px,3.5vw,32px)] py-[clamp(12px,2.5vw,24px)]">
          <motion.h1
            initial={false}
            animate={{ opacity: isHeadlineVisible ? 1 : 0 }}
            transition={{
              duration: reducedMotion ? 0 : 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="font-display text-[clamp(2.25rem,8.4vw,7.25rem)] font-bold uppercase leading-[0.94] tracking-tighter"
          >
            <span
              ref={line0Ref}
              className="pointer-events-auto block w-fit text-sand"
            >
              <span className={reducedMotion ? "block" : "hero-float-a block"}>
                CREATIVE
              </span>
            </span>

            <span
              ref={line1Ref}
              className="pointer-events-auto block w-fit text-outline-sand"
            >
              <span
                className={`block ${reducedMotion ? "" : "hero-parallax-x"}`}
              >
                FULL-STACK
              </span>
            </span>

            <span
              ref={line2Ref}
              className="pointer-events-auto block w-fit text-sand"
            >
              <span className={reducedMotion ? "block" : "hero-float-b block"}>
                DEVELOPER<span className="text-brass">.</span>
              </span>
            </span>
          </motion.h1>

          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 14 }}
            animate={
              isHeadlineVisible
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 14 }
            }
            transition={{
              duration: reducedMotion ? 0 : 0.5,
              delay: isHeadlineVisible && !reducedMotion ? 0.15 : 0,
            }}
            className="pointer-events-auto flex flex-wrap items-center gap-3"
          >
            <PillButton href="#projects" variant="primary">
              Lihat Project
            </PillButton>
            <PillButton href="#contact" variant="outline">
              Hubungi Saya
            </PillButton>
          </motion.div>
        </div>

        {/* Bottom HUD + Marquee */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: isHeadlineVisible ? 1 : 0.45 }}
          transition={{ duration: reducedMotion ? 0 : 0.45 }}
          className="space-y-4"
        >
          <div className="flex items-end justify-between font-mono text-[11px] uppercase tracking-[0.18em] text-sage">
            <span ref={coordsRef} aria-hidden="true" className="hidden md:inline">
              X:0000 // Y:0000
            </span>

            <div aria-hidden="true" className="ml-auto flex items-center gap-2.5">
              <span className="[writing-mode:vertical-rl]">SCROLL</span>
              <span className="relative h-10 w-px overflow-hidden bg-forest-600">
                {reducedMotion ? (
                  <span className="block h-full w-full bg-brass" />
                ) : (
                  <motion.span
                    animate={{ y: ["-100%", "100%"] }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.6,
                      ease: "easeInOut",
                    }}
                    className="block h-1/2 w-full bg-brass"
                  />
                )}
              </span>
            </div>
          </div>

          {/* Endless Stack Marquee (proportionally scaled across all viewports) */}
          <div
            aria-label="Teknologi utama"
            className="pointer-events-auto overflow-hidden border-y border-forest-600/80 bg-forest-900/75 py-[clamp(6px,1.2vw,10px)] backdrop-blur-sm"
          >
            <div className="animate-marquee flex w-max items-center gap-[clamp(14px,2.5vw,24px)] whitespace-nowrap font-mono text-[clamp(10px,1.8vw,12px)] uppercase tracking-[0.18em] text-sand">
              {[...HERO_MARQUEE_STACK, ...HERO_MARQUEE_STACK].map((item, idx) => (
                <span
                  key={`${item}-${idx}`}
                  className="inline-flex items-center gap-6"
                >
                  <span>{item}</span>
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-brass"
                    aria-hidden="true"
                  />
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
