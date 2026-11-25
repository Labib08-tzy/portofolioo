import { motion } from "framer-motion";
import { About } from "./components/About";
import { Achievements } from "./components/Achievements";
import { Contact } from "./components/Contact";
import { Experience } from "./components/Experience";
import { EyeScan } from "./components/EyeScan";
import { Hero } from "./components/Hero";
import { Nav } from "./components/Nav";
import { Preloader } from "./components/Preloader";
import { Projects } from "./components/Projects";
import { Skills } from "./components/Skills";
import { SITE_INFO } from "./data/site";
import { useFramePreloader } from "./hooks/useFramePreloader";
import { useReducedMotion } from "./hooks/useReducedMotion";

export function App() {
  const reducedMotion = useReducedMotion();
  const { frames, progress, status, failedCount, dismissError } =
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
            <Hero />
            <EyeScan frames={frames} />
            <About />
            <Skills />
            <Projects />
            <Achievements />
            <Experience />
            <Contact />
          </main>
        </>
      ) : null}
    </div>
  );
}

export default App;
