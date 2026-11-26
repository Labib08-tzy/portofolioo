import { Suspense, lazy } from "react";
import { motion } from "framer-motion";
import { Hero } from "./components/Hero";
import { Nav } from "./components/Nav";
import { Preloader } from "./components/Preloader";
import { SITE_INFO } from "./data/site";
import { useFramePreloader } from "./hooks/useFramePreloader";
import { useReducedMotion } from "./hooks/useReducedMotion";

const EyeScan = lazy(() =>
  import("./components/EyeScan").then((m) => ({ default: m.EyeScan }))
);
const About = lazy(() =>
  import("./components/About").then((m) => ({ default: m.About }))
);
const Skills = lazy(() =>
  import("./components/Skills").then((m) => ({ default: m.Skills }))
);
const FolderShowcase = lazy(() =>
  import("./components/FolderShowcase").then((m) => ({
    default: m.FolderShowcase,
  }))
);
const Experience = lazy(() =>
  import("./components/Experience").then((m) => ({ default: m.Experience }))
);
const Contact = lazy(() =>
  import("./components/Contact").then((m) => ({ default: m.Contact }))
);

export function App() {
  const reducedMotion = useReducedMotion();
  const {
    frames,
    progress,
    status,
    bgProgress,
    allLoaded,
    failedCount,
    setPriorityFrame,
    dismissError,
  } = useFramePreloader(reducedMotion);

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
            <Suspense fallback={null}>
              <EyeScan
                frames={frames}
                allLoaded={allLoaded}
                bgProgress={bgProgress}
                onFrameFocus={setPriorityFrame}
              />
              <About />
              <Skills />
              <FolderShowcase />
              <Experience />
              <Contact />
            </Suspense>
          </main>
        </>
      ) : null}
    </div>
  );
}

export default App;
