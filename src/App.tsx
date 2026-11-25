import { motion } from "framer-motion";
import { Nav } from "./components/Nav";
import { Preloader } from "./components/Preloader";
import { PillButton } from "./components/ui/PillButton";
import { SITE_INFO } from "./data/site";
import { useFramePreloader } from "./hooks/useFramePreloader";
import { useReducedMotion } from "./hooks/useReducedMotion";

export function App() {
  const reducedMotion = useReducedMotion();
  const { progress, status, failedCount, dismissError } =
    useFramePreloader(reducedMotion);

  const isReady = status === "ready";

  return (
    <div className="min-h-screen bg-ink text-sand">
      <a href="#main-content" className="skip-link">
        Lewati ke konten utama
      </a>

      <Preloader
        progress={progress}
        status={status}
        failedCount={failedCount}
        reducedMotion={reducedMotion}
        onDismissError={dismissError}
      />

      {isReady ? (
        <>
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.45, ease: "easeOut" }}
          >
            <Nav brand={SITE_INFO.brand} cvUrl={SITE_INFO.cvUrl} />
          </motion.div>

          <main id="main-content" tabIndex={-1}>
            <section
              id="home"
              className="relative mx-auto flex min-h-[calc(100vh-57px)] max-w-7xl flex-col justify-center px-4 py-20 sm:px-6 lg:px-8"
            >
              <motion.p
                initial={reducedMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.5, delay: 0.1 }}
                className="font-mono text-xs uppercase tracking-[0.2em] text-sage"
              >
                {SITE_INFO.fullName} — {SITE_INFO.school}
              </motion.p>

              <motion.h1
                initial={reducedMotion ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.55, delay: 0.2 }}
                className="mt-4 font-display text-6xl font-bold tracking-tight text-sand sm:text-8xl"
              >
                {SITE_INFO.brand}
              </motion.h1>

              <motion.p
                initial={reducedMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.5, delay: 0.32 }}
                className="mt-4 font-mono text-sm text-brass sm:text-base"
              >
                {SITE_INFO.role}
              </motion.p>

              <motion.p
                initial={reducedMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.5, delay: 0.42 }}
                className="mt-4 max-w-xl text-base text-sage"
              >
                {SITE_INFO.positioning}
              </motion.p>

              <motion.div
                initial={reducedMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.5, delay: 0.52 }}
                className="mt-8 flex flex-wrap items-center gap-4"
              >
                <PillButton href="#projects" variant="primary">
                  Lihat Project
                </PillButton>
                <PillButton href="#contact" variant="outline">
                  Hubungi Saya
                </PillButton>
              </motion.div>
            </section>
          </main>
        </>
      ) : null}
    </div>
  );
}

export default App;
