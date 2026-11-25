import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PROJECTS, type Project } from "../data/projects";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { PillButton } from "./ui/PillButton";
import { SectionHeading } from "./ui/SectionHeading";

gsap.registerPlugin(ScrollTrigger);

function statusLabel(status: Project["status"]): string {
  return status === "done" ? "Selesai" : "Dalam pengembangan";
}

function ProjectWindowCard({
  project,
  onSelect,
}: {
  project: Project;
  onSelect: (project: Project) => void;
}) {
  const isDone = project.status === "done";
  const fakeUrl = `${project.id}.labib.local`;

  return (
    <article className="project-card brutal-card group flex flex-col overflow-hidden transition-transform duration-200 hover:-translate-y-1.5">
      {/* Browser title bar */}
      <div className="flex items-center justify-between border-b border-forest-600 bg-ink px-4 py-2.5">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full border border-forest-600 bg-forest-900" />
          <span className="h-2.5 w-2.5 rounded-full border border-forest-600 bg-forest-900" />
          <span className="h-2.5 w-2.5 rounded-full bg-brass" />
        </div>
        <span className="truncate px-3 font-mono text-[11px] text-sage">
          {fakeUrl}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-sage">
          {project.type}
        </span>
      </div>

      {/* Preview area */}
      <div className="relative flex aspect-[16/9] flex-col justify-between border-b border-forest-600 bg-ink/60 bg-grid-pattern p-5">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 font-mono text-[11px] font-medium ${
              isDone
                ? "border-brass bg-brass/15 text-brass"
                : "border-forest-600 bg-forest-900 text-sage"
            }`}
          >
            {statusLabel(project.status)}
          </span>
          {project.featured ? (
            <span className="rounded-full border border-forest-600 bg-forest-900 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-sand">
              Featured
            </span>
          ) : null}
        </div>

        <div>
          <h3 className="font-display text-2xl font-bold tracking-tight text-sand sm:text-3xl">
            {project.title}
          </h3>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <p className="text-sm leading-relaxed text-sage">
            {project.description}
          </p>

          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Teknologi">
            {project.stack.map((tech) => (
              <li
                key={tech}
                className="rounded-full border border-forest-600 bg-ink px-3 py-1 font-mono text-[11px] text-sand"
              >
                {tech}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-forest-600/60 pt-4">
          <PillButton
            onClick={() => onSelect(project)}
            variant={isDone ? "primary" : "outline"}
            size="sm"
          >
            {isDone ? "Buka Studi Kasus" : "Lihat Ringkasan"}
          </PillButton>
        </div>
      </div>
    </article>
  );
}

function ProjectModal({
  project,
  reducedMotion,
  onClose,
}: {
  project: Project | null;
  reducedMotion: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!project) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project ? (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-modal-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/85 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
            transition={{ duration: reducedMotion ? 0 : 0.22 }}
            onClick={(e) => e.stopPropagation()}
            className="brutal-card-lg max-h-[88vh] w-full max-w-2xl overflow-y-auto p-6 sm:p-8"
          >
            <div className="flex items-start justify-between gap-4 border-b border-forest-600 pb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                  <span className="rounded-full border border-forest-600 bg-ink px-3 py-0.5 text-sage">
                    {project.type}
                  </span>
                  <span className="rounded-full border border-brass/70 bg-ink px-3 py-0.5 text-brass">
                    {statusLabel(project.status)}
                  </span>
                </div>
                <h3
                  id="project-modal-title"
                  className="mt-3 font-display text-2xl font-bold text-sand sm:text-3xl"
                >
                  {project.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup detail project"
                className="rounded-full border border-forest-600 bg-ink px-3 py-1 font-mono text-xs text-sand hover:border-brass"
              >
                TUTUP
              </button>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-sand/90 sm:text-base">
              {project.description}
            </p>

            {project.caseStudy ? (
              <div className="mt-6 space-y-4 border-t border-forest-600/70 pt-5">
                <div>
                  <h4 className="font-mono text-xs uppercase tracking-wider text-brass">
                    Masalah
                  </h4>
                  <p className="mt-1 text-sm text-sage">
                    {project.caseStudy.problem}
                  </p>
                </div>
                <div>
                  <h4 className="font-mono text-xs uppercase tracking-wider text-brass">
                    Peran
                  </h4>
                  <p className="mt-1 text-sm text-sage">
                    {project.caseStudy.role}
                  </p>
                </div>
                <div>
                  <h4 className="font-mono text-xs uppercase tracking-wider text-brass">
                    Solusi
                  </h4>
                  <p className="mt-1 text-sm text-sage">
                    {project.caseStudy.solution}
                  </p>
                </div>
                <div>
                  <h4 className="font-mono text-xs uppercase tracking-wider text-brass">
                    Hasil & Pembelajaran
                  </h4>
                  <p className="mt-1 text-sm text-sage">
                    {project.caseStudy.result}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-6 border border-forest-600 bg-ink p-4 font-mono text-xs text-sage">
                Project ini masih dalam tahap pengembangan. Studi kasus lengkap akan
                ditambahkan setelah selesai.
              </div>
            )}

            <div className="mt-6 border-t border-forest-600/70 pt-4">
              <p className="font-mono text-xs uppercase tracking-wider text-sage">
                Stack
              </p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {project.stack.map((tech) => (
                  <li
                    key={tech}
                    className="rounded-full border border-forest-600 bg-ink px-3 py-1 font-mono text-xs text-sand"
                  >
                    {tech}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 border-t border-forest-600/70 pt-4">
              {project.demoUrl ? (
                <PillButton
                  href={project.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  variant="primary"
                  size="sm"
                >
                  Buka Demo
                </PillButton>
              ) : (
                <span className="rounded-full border border-forest-600 bg-ink px-3 py-1 font-mono text-xs text-sage">
                  Demo: TODO
                </span>
              )}
              {project.repoUrl ? (
                <PillButton
                  href={project.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  variant="outline"
                  size="sm"
                >
                  Lihat Repository
                </PillButton>
              ) : (
                <span className="rounded-full border border-forest-600 bg-ink px-3 py-1 font-mono text-xs text-sage">
                  Repo: TODO
                </span>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function Projects() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || reducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.from(".project-card", {
        y: 28,
        opacity: 0,
        duration: 0.65,
        stagger: 0.12,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          once: true,
        },
      });
    }, el);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="border-b border-forest-600 bg-ink py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          index="03"
          eyebrow="Karya"
          title="Project Terpilih"
          subtitle="Setiap project ditampilkan dengan status jujur dan studi kasus terstruktur."
        />

        <div className="grid gap-6 md:grid-cols-2">
          {PROJECTS.map((project) => (
            <ProjectWindowCard
              key={project.id}
              project={project}
              onSelect={setSelectedProject}
            />
          ))}
        </div>
      </div>

      <ProjectModal
        project={selectedProject}
        reducedMotion={reducedMotion}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
}

