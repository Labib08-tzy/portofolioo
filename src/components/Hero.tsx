import { motion } from "framer-motion";
import { PillButton } from "./ui/PillButton";
import { LanyardCard } from "./hero/LanyardCard";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { SITE_INFO } from "../data/site";
import "../styles/hero-lanyard.css";

const LINES = ["CREATIVE", "FULL-STACK", "DEVELOPER"];

export function Hero() {
  const reducedMotion = useReducedMotion();

  const reveal = (i: number) =>
    reducedMotion
      ? { initial: false as const }
      : {
          initial: { opacity: 0, y: 28, filter: "blur(10px)" },
          animate: { opacity: 1, y: 0, filter: "blur(0px)" },
          transition: {
            duration: 0.8,
            delay: 0.25 + i * 0.12,
            ease: [0.22, 1, 0.36, 1] as const,
          },
        };

  return (
    <section
      id="home"
      className="relative flex min-h-[100svh] flex-col overflow-hidden border-b border-forest-600 bg-ink lg:block"
    >
      {/* Latar blur */}
      <div aria-hidden="true" className="hero-blur-bg">
        <span className="hero-blob hero-blob--brass" />
        <span className="hero-blob hero-blob--emerald" />
        <span className="hero-blob hero-blob--forest" />
        <span className="hero-blob hero-blob--sage" />
        <span className="hero-bokeh hero-bokeh--1" />
        <span className="hero-bokeh hero-bokeh--2" />
        <span className="hero-bokeh hero-bokeh--3" />
        <span className="hero-bokeh hero-bokeh--4" />
        <span className="hero-vignette" />
      </div>
      <div
        aria-hidden="true"
        className="bg-noise-subtle pointer-events-none absolute inset-0 z-0"
      />

      {/* Kartu ID */}
      <div className="relative z-10 h-[min(62svh,520px)] min-h-[380px] shrink-0 lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[48%]">
        <LanyardCard
          reducedMotion={reducedMotion}
          photoSrc={SITE_INFO.aboutPhoto}
          name={SITE_INFO.fullName}
          role={SITE_INFO.role}
          brand={SITE_INFO.brand}
        />
      </div>

      {/* Teks */}
      <div className="pointer-events-none relative z-20 mx-auto flex w-full max-w-7xl flex-1 items-center px-4 pb-12 sm:px-6 lg:min-h-[100svh] lg:px-8 lg:pt-24">
        <div className="flex w-full flex-col gap-6 lg:w-[56%]">
          <motion.p
            {...reveal(0)}
            className="font-mono text-xs uppercase tracking-[0.22em] text-brass"
          >
            {SITE_INFO.nickname} // {SITE_INFO.brand} Portfolio
          </motion.p>

          <h1 className="font-display text-[clamp(2.6rem,10.5vw,4.6rem)] font-bold uppercase leading-[0.94] tracking-tighter lg:text-[clamp(3.6rem,6.2vw,6.6rem)]">
            {LINES.map((line, i) => (
              <motion.span
                key={line}
                {...reveal(i + 1)}
                className={`block w-fit ${i === 1 ? "text-outline-sand" : "text-sand"}`}
              >
                {line}
                {i === 2 ? <span className="text-brass">.</span> : null}
              </motion.span>
            ))}
          </h1>

          <motion.div
            {...reveal(4)}
            className="pointer-events-auto flex flex-wrap items-center gap-3"
          >
            <PillButton href="#portfolio" variant="primary">
              Lihat Project
            </PillButton>
            <PillButton href="#contact" variant="outline">
              Hubungi Saya
            </PillButton>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
