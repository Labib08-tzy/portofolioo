import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SwarmCanvas } from "../canvas/SwarmCanvas";
import { PillButton } from "./ui/PillButton";
import { SITE_INFO } from "../data/site";
import { useReducedMotion } from "../hooks/useReducedMotion";

export function Hero() {
  const reducedMotion = useReducedMotion();
  const [isLowEnd] = useState(() => {
    if (typeof navigator === "undefined") return false;
    return (
      typeof navigator.hardwareConcurrency === "number" &&
      navigator.hardwareConcurrency <= 2
    );
  });

  const useStaticHero = reducedMotion || isLowEnd;
  const [uiVisible, setUiVisible] = useState(useStaticHero);

  useEffect(() => {
    if (useStaticHero) {
      setUiVisible(true);
      return;
    }
    // Safety fallback so UI always appears even if canvas callback is delayed
    const timer = window.setTimeout(() => setUiVisible(true), 1900);
    return () => window.clearTimeout(timer);
  }, [useStaticHero]);

  const handleSwarmFormed = useCallback(() => {
    setUiVisible(true);
  }, []);

  return (
    <section
      id="home"
      className="relative flex min-h-[calc(100vh-57px)] flex-col justify-between overflow-hidden border-b border-forest-600 bg-ink bg-grid-pattern"
    >
      {/* Ambient glows (decor only) */}
      <div
        aria-hidden="true"
        className="ambient-glow-brass pointer-events-none absolute -bottom-32 -left-32 h-[420px] w-[420px] rounded-full blur-3xl"
      />
      <div
        aria-hidden="true"
        className="ambient-glow-emerald pointer-events-none absolute -top-28 -right-28 h-[420px] w-[420px] rounded-full blur-3xl"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-between px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <motion.div
          initial={useStaticHero ? false : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: useStaticHero ? 0 : 0.45 }}
          className="flex flex-wrap items-center justify-between gap-3 border-b border-forest-600/70 pb-4 font-mono text-xs uppercase tracking-[0.18em] text-sage"
        >
          <span>{SITE_INFO.fullName}</span>
          <span className="inline-flex items-center gap-2 rounded-full border border-forest-600 bg-forest-900 px-3 py-1 text-sand">
            <span className="h-2 w-2 rounded-full bg-brass" aria-hidden="true" />
            {SITE_INFO.school}
          </span>
        </motion.div>

        {/* Swarm or Static Display Title */}
        <div className="relative my-6 flex min-h-[240px] flex-1 items-center justify-center sm:min-h-[320px]">
          {useStaticHero ? (
            <h1 className="text-center font-display text-[clamp(4.25rem,16vw,12rem)] font-bold leading-none tracking-tighter text-sand">
              {SITE_INFO.brand}
            </h1>
          ) : (
            <>
              <h1 className="sr-only">{SITE_INFO.brand}</h1>
              <div className="h-[260px] w-full sm:h-[340px] lg:h-[380px]">
                <SwarmCanvas
                  text={SITE_INFO.brand}
                  active={!useStaticHero}
                  onFormed={handleSwarmFormed}
                />
              </div>
            </>
          )}
        </div>

        {/* Assembled Hero UI */}
        <motion.div
          initial={useStaticHero ? false : { opacity: 0, y: 20 }}
          animate={uiVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: useStaticHero ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="grid gap-6 border-t border-forest-600/80 pt-6 md:grid-cols-12 md:items-end"
        >
          <div className="md:col-span-7">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-brass">
              {SITE_INFO.role}
            </p>
            <p className="mt-2 max-w-xl text-base text-sage sm:text-lg">
              {SITE_INFO.positioning}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 md:col-span-5 md:justify-end">
            <PillButton href="#projects" variant="primary">
              Lihat Project
            </PillButton>
            <PillButton href="#contact" variant="outline">
              Hubungi Saya
            </PillButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
