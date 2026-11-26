import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { IntroPhase } from "../canvas/SwarmCanvas";
import { PillButton } from "./ui/PillButton";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useMediaQuery } from "../hooks/useMediaQuery";

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

/* ------------------------------------------------------------------ */
/*  Animated Headline                                                  */
/* ------------------------------------------------------------------ */

interface HeadlineLineConfig {
  text: string;
  variant: "fill" | "outline" | "fill-dot";
}

const HEADLINE_LINES: HeadlineLineConfig[] = [
  { text: "CREATIVE", variant: "fill" },
  { text: "FULL-STACK", variant: "outline" },
  { text: "DEVELOPER.", variant: "fill-dot" },
];

/** Split text into individual letter spans for pointer‑reactive effect. */
function LetterSpans({
  text,
  variant,
  containerRef,
}: {
  text: string;
  variant: HeadlineLineConfig["variant"];
  containerRef: React.RefObject<HTMLElement | null>;
}) {
  const spanRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const rafId = useRef(0);
  const isTouch = useMediaQuery("(hover: none)");

  useEffect(() => {
    if (isTouch) return;
    const container = containerRef.current;
    if (!container) return;

    let mx = -9999;
    let my = -9999;

    const onMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      mx = e.clientX - rect.left;
      my = e.clientY - rect.top;
    };

    const onLeave = () => {
      mx = -9999;
      my = -9999;
    };

    const tick = () => {
      const spans = spanRefs.current;
      for (let i = 0; i < spans.length; i++) {
        const el = spans[i];
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2 - (containerRef.current?.getBoundingClientRect().left ?? 0);
        const cy = rect.top + rect.height / 2 - (containerRef.current?.getBoundingClientRect().top ?? 0);
        const dist = Math.hypot(mx - cx, my - cy);
        const radius = 90;
        if (dist < radius) {
          const strength = 1 - dist / radius;
          const lift = -strength * 8;
          el.style.transform = `translateY(${lift}px)`;
          if (variant === "outline") {
            el.style.webkitTextStroke = "0px";
            el.style.color = "var(--c-sand)";
          }
        } else {
          el.style.transform = "";
          if (variant === "outline") {
            el.style.webkitTextStroke = "";
            el.style.color = "";
          }
        }
      }
      rafId.current = requestAnimationFrame(tick);
    };

    container.addEventListener("pointermove", onMove, { passive: true });
    container.addEventListener("pointerleave", onLeave);
    rafId.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId.current);
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerleave", onLeave);
    };
  }, [isTouch, variant, containerRef]);

  const letters = text.split("");
  const hasDot = variant === "fill-dot";
  const mainText = hasDot ? letters.slice(0, -1) : letters;
  const dot = hasDot ? letters[letters.length - 1] : null;

  return (
    <>
      {mainText.map((ch, i) => (
        <span
          key={i}
          ref={(el) => { spanRefs.current[i] = el; }}
          className={`inline-block transition-[color,-webkit-text-stroke] duration-150 ${
            variant === "outline" ? "text-outline-sand" : "text-sand"
          }`}
          style={{ willChange: "transform" }}
        >
          {ch === " " ? "\u00A0" : ch}
        </span>
      ))}
      {dot && (
        <span
          ref={(el) => { spanRefs.current[mainText.length] = el; }}
          className="inline-block text-brass hero-dot-pulse"
          style={{ willChange: "transform" }}
        >
          {dot}
        </span>
      )}
    </>
  );
}

function AnimatedHeadline({
  isVisible,
  reducedMotion,
  lineRefs,
}: {
  isVisible: boolean;
  reducedMotion: boolean;
  lineRefs: React.RefObject<HTMLSpanElement | null>[];
}) {
  const h1Ref = useRef<HTMLHeadingElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  // Find the hero section for scroll-based parallax
  useEffect(() => {
    sectionRef.current = document.getElementById("home");
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const y0 = useTransform(scrollYProgress, [0, 1], [0, -30]);
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -55]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const yValues = [y0, y1, y2];

  const maskRevealVariants = {
    hidden: { y: "110%" },
    visible: (i: number) => ({
      y: "0%",
      transition: {
        duration: 0.7,
        delay: i * 0.12,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    }),
  };

  if (reducedMotion) {
    return (
      <h1
        ref={h1Ref}
        aria-label="Creative Full-Stack Developer"
        className="font-display text-[clamp(2.25rem,8.4vw,7.25rem)] font-bold uppercase leading-[0.94] tracking-tighter"
        style={{ opacity: isVisible ? 1 : 0 }}
      >
        <span ref={lineRefs[0]} className="pointer-events-auto block w-fit text-sand">CREATIVE</span>
        <span ref={lineRefs[1]} className="pointer-events-auto block w-fit text-outline-sand">FULL-STACK</span>
        <span ref={lineRefs[2]} className="pointer-events-auto block w-fit text-sand">
          DEVELOPER<span className="text-brass">.</span>
        </span>
      </h1>
    );
  }

  return (
    <motion.h1
      ref={h1Ref}
      aria-label="Creative Full-Stack Developer"
      initial={false}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="font-display text-[clamp(2.25rem,8.4vw,7.25rem)] font-bold uppercase leading-[0.94] tracking-tighter"
    >
      {HEADLINE_LINES.map((line, i) => (
        <motion.span
          key={line.text}
          ref={lineRefs[i]}
          className={`pointer-events-auto block w-fit ${
            line.variant === "outline" ? "hero-gradient-sweep" : ""
          }`}
          style={{ y: yValues[i] }}
        >
          {/* overflow-hidden mask for reveal */}
          <span className="block overflow-hidden">
            <motion.span
              className="block"
              custom={i}
              initial="hidden"
              animate={isVisible ? "visible" : "hidden"}
              variants={maskRevealVariants}
            >
              <LetterSpans
                text={line.text}
                variant={line.variant}
                containerRef={h1Ref}
              />
            </motion.span>
          </span>
        </motion.span>
      ))}
    </motion.h1>
  );
}


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
  const spotlightRef = useRef<HTMLDivElement | null>(null);

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

  // Spotlight grid: track pointer and update CSS custom properties
  useEffect(() => {
    const el = spotlightRef.current;
    if (!el) return;
    const isTouch = window.matchMedia("(hover: none)").matches;
    if (isTouch) return;

    let rafId = 0;
    let targetX = -9999;
    let targetY = -9999;

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const onLeave = () => {
      targetX = -9999;
      targetY = -9999;
    };

    const tick = () => {
      if (targetX > -1000) {
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${targetX - rect.left}px`);
        el.style.setProperty("--my", `${targetY - rect.top}px`);
        el.style.opacity = "1";
      } else {
        el.style.opacity = "0";
      }
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
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

      {/* Ambient glows, floating blobs, spotlight & noise */}
      <div
        aria-hidden="true"
        className="ambient-glow-brass pointer-events-none absolute -bottom-36 -left-36 z-0 hidden h-[520px] w-[520px] rounded-full blur-3xl md:block"
      />
      <div
        aria-hidden="true"
        className="ambient-glow-emerald pointer-events-none absolute -top-32 -right-32 z-0 hidden h-[520px] w-[520px] rounded-full blur-3xl md:block"
      />
      {/* Floating glow blobs (desktop: 3, mobile: 1) */}
      <div
        aria-hidden="true"
        className="glow-blob glow-blob-emerald-1 pointer-events-none absolute z-0"
      />
      <div
        aria-hidden="true"
        className="glow-blob glow-blob-brass-1 pointer-events-none absolute z-0 hidden md:block"
      />
      <div
        aria-hidden="true"
        className="glow-blob glow-blob-emerald-2 pointer-events-none absolute z-0 hidden md:block"
      />
      {/* Spotlight grid overlay (desktop only) */}
      <div
        ref={spotlightRef}
        aria-hidden="true"
        className="bg-spotlight pointer-events-none absolute inset-0 z-[1] hidden md:block"
      />
      {/* Noise grain (always on) */}
      <div
        aria-hidden="true"
        className="bg-grain pointer-events-none absolute inset-0 z-[1]"
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
          <AnimatedHeadline
            isVisible={isHeadlineVisible}
            reducedMotion={reducedMotion}
            lineRefs={lineRefs}
          />

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
