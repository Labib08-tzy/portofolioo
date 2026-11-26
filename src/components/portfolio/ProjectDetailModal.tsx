import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Project } from "../../data/projects";

interface ProjectDetailModalProps {
  project: Project | null;
  reducedMotion: boolean;
  onClose: () => void;
}

export function ProjectDetailModal({
  project,
  reducedMotion,
  onClose,
}: ProjectDetailModalProps) {
  useEffect(() => {
    if (!project) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project ? (
        <motion.div
          key="project-modal-backdrop"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reducedMotion ? undefined : { opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/85 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-modal-title"
        >
          <motion.div
            key={project.id}
            initial={reducedMotion ? false : { opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: reducedMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="brutal-card-lg max-h-[88svh] w-full max-w-2xl overflow-y-auto p-5 text-sand sm:p-8"
          >
            <div className="flex items-start justify-between gap-4 border-b border-forest-600 pb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 font-ui text-xs font-semibold uppercase tracking-[0.06em]">
                  <span className="rounded-full border border-brass bg-ink px-2.5 py-0.5 text-brass">
                    {project.type}
                  </span>
                  <span className="rounded-full border border-forest-600 bg-ink px-2.5 py-0.5 text-sage">
                    {project.status === "done" ? "Selesai" : "Dalam Pengembangan"}
                  </span>
                </div>
                <h3
                  id="project-modal-title"
                  className="mt-2 font-display text-2xl font-bold text-sand"
                >
                  {project.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup detail project"
                className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-forest-600 bg-ink text-sand transition-colors hover:border-brass hover:text-brass focus-visible:outline-2 focus-visible:outline-brass"
              >
                <span aria-hidden="true" className="text-lg leading-none">
                  ×
                </span>
              </button>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-sand/90 sm:text-base">
              {project.description}
            </p>

            {/* Tech stack */}
            <div className="mt-5 flex flex-wrap gap-2">
              {project.stack.map((tech) => (
                <span
                  key={tech}
                  className="border border-forest-600 bg-ink px-2.5 py-1 font-ui text-xs font-medium text-sage"
                >
                  {tech}
                </span>
              ))}
            </div>

            {/* Case study details */}
            {project.caseStudy ? (
              <div className="mt-6 grid gap-4 border border-forest-600 bg-ink p-4 sm:grid-cols-2">
                <div>
                  <h4 className="font-ui text-[11px] font-semibold uppercase tracking-[0.07em] text-brass">
                    Masalah
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-sand/90 sm:text-sm">
                    {project.caseStudy.problem}
                  </p>
                </div>
                <div>
                  <h4 className="font-ui text-[11px] font-semibold uppercase tracking-[0.07em] text-brass">
                    Peran
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-sand/90 sm:text-sm">
                    {project.caseStudy.role}
                  </p>
                </div>
                <div>
                  <h4 className="font-ui text-[11px] font-semibold uppercase tracking-[0.07em] text-brass">
                    Solusi
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-sand/90 sm:text-sm">
                    {project.caseStudy.solution}
                  </p>
                </div>
                <div>
                  <h4 className="font-ui text-[11px] font-semibold uppercase tracking-[0.07em] text-brass">
                    Hasil
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-sand/90 sm:text-sm">
                    {project.caseStudy.result}
                  </p>
                </div>
              </div>
            ) : null}

            {/* External links if available */}
            {project.demoUrl || project.repoUrl ? (
              <div className="mt-6 flex flex-wrap gap-3 border-t border-forest-600 pt-4">
                {project.demoUrl ? (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex min-h-[44px] items-center rounded-full border border-brass bg-brass px-5 py-2 font-ui text-xs font-semibold text-ink transition-colors hover:bg-sand"
                  >
                    Live Demo ↗
                  </a>
                ) : null}
                {project.repoUrl ? (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex min-h-[44px] items-center rounded-full border border-forest-600 bg-ink px-5 py-2 font-ui text-xs font-semibold text-sand transition-colors hover:border-brass hover:text-brass"
                  >
                    Repository ↗
                  </a>
                ) : null}
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
