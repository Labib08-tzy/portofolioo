import { AnimatePresence, motion, type Variants } from "framer-motion";
import type { Achievement } from "../../data/achievements";
import { PROJECTS, type Project } from "../../data/projects";
import {
  AWARD_ITEMS,
  CERTIFICATE_ITEMS,
  type PortfolioCategory,
} from "./portfolioData";

interface PortfolioGridProps {
  activeCategory: PortfolioCategory;
  reducedMotion: boolean;
  onSelectProject: (project: Project) => void;
}

const gridVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: { duration: 0.16, ease: "easeIn" },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
  },
};

function ProjectThumbnail({ project }: { project: Project }) {
  const imageSrc = project.caseStudy?.images?.[0];

  if (imageSrc) {
    return (
      <img
        src={imageSrc}
        alt={`Preview ${project.title}`}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
      />
    );
  }

  // Wireframe preview styled strictly in the forest/ink/brass palette
  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-gradient-to-br from-forest-900 via-ink to-ink p-[clamp(10px,2vw,16px)] transition-transform duration-500 ease-out group-hover:scale-105">
      <div
        aria-hidden="true"
        className="ambient-glow-emerald pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full opacity-50 blur-2xl"
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-forest-600" />
          <span className="h-2 w-2 rounded-full bg-sage/50" />
          <span className="h-2 w-2 rounded-full bg-brass" />
        </div>
        <span className="border border-forest-600 bg-ink px-2 py-0.5 font-ui text-[10px] font-semibold uppercase tracking-[0.06em] text-brass">
          {project.type}
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="h-1.5 w-2/3 bg-sand/20" />
        <div className="h-1 w-1/2 bg-brass/35" />
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          <div className="h-5 border border-forest-600/60 bg-forest-900/60 sm:h-7" />
          <div className="h-5 border border-forest-600/60 bg-forest-900/60 sm:h-7" />
          <div className="h-5 border border-brass/50 bg-ink/80 sm:h-7" />
        </div>
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  reducedMotion,
  onSelect,
}: {
  project: Project;
  reducedMotion: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.article
      variants={reducedMotion ? undefined : cardVariants}
      whileHover={
        reducedMotion
          ? undefined
          : {
              y: -4,
              scale: 1.01,
              transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
            }
      }
      className="brutal-card group flex flex-col overflow-hidden transition-colors duration-200 hover:border-brass"
    >
      {/* Thumbnail */}
      <div className="aspect-video w-full overflow-hidden border-b border-forest-600 bg-ink">
        <ProjectThumbnail project={project} />
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col justify-between p-[clamp(12px,2.5vw,20px)]">
        <div>
          <div className="flex items-center justify-between gap-2 font-ui text-[clamp(10px,1.8vw,11px)] font-semibold uppercase tracking-[0.06em]">
            <span className="text-brass">{project.type}</span>
            <span className="text-sage">
              {project.status === "done" ? "Selesai" : "In Progress"}
            </span>
          </div>

          <h3 className="mt-1.5 font-display text-[clamp(0.95rem,2.4vw,1.125rem)] font-bold text-sand">
            {project.title}
          </h3>

          <p className="mt-1.5 line-clamp-3 text-[clamp(0.75rem,2vw,0.875rem)] leading-relaxed text-sage">
            {project.description}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-forest-600/70 pt-3">
          <div className="flex flex-wrap gap-1">
            {project.stack.slice(0, 2).map((tech) => (
              <span
                key={tech}
                className="border border-forest-600 bg-ink px-1.5 py-0.5 font-ui text-[10px] font-medium text-sage sm:px-2 sm:text-[11px]"
              >
                {tech}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={onSelect}
            className="inline-flex min-h-[40px] shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-brass bg-ink px-3.5 py-1.5 font-ui text-xs font-semibold tracking-[0.02em] text-brass transition-colors hover:bg-brass hover:text-ink focus-visible:outline-2 focus-visible:outline-brass sm:min-h-[44px] sm:px-4"
          >
            Detail
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </motion.article>
  );
}

function CertificateCard({
  item,
  reducedMotion,
}: {
  item: Achievement;
  reducedMotion: boolean;
}) {
  return (
    <motion.article
      variants={reducedMotion ? undefined : cardVariants}
      whileHover={
        reducedMotion
          ? undefined
          : {
              y: -4,
              scale: 1.01,
              transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
            }
      }
      className="brutal-card group flex flex-col overflow-hidden transition-colors duration-200 hover:border-brass"
    >
      {/* Certificate Preview Frame */}
      <div className="relative aspect-video w-full overflow-hidden border-b border-forest-600 bg-gradient-to-br from-forest-900 via-ink to-ink p-[clamp(10px,2vw,20px)]">
        <div className="flex h-full w-full flex-col justify-between border border-dashed border-forest-600 bg-ink/70 p-3 transition-transform duration-500 ease-out group-hover:scale-105 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="font-ui text-[10px] font-semibold uppercase tracking-[0.07em] text-brass">
              Certificate
            </span>
            <span className="font-ui text-[11px] font-medium text-sage">
              {item.year}
            </span>
          </div>
          <div>
            <div className="h-1.5 w-16 bg-brass/50 sm:w-20" />
            <div className="mt-2 h-1.5 w-24 bg-sage/25 sm:w-32" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col justify-between p-[clamp(12px,2.5vw,20px)]">
        <div>
          <h3 className="font-display text-[clamp(0.95rem,2.4vw,1.125rem)] font-bold text-sand">
            {item.title}
          </h3>
          <p className="mt-1.5 text-[clamp(0.75rem,2vw,0.875rem)] text-sage">
            {item.issuer}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-forest-600/70 pt-3 font-ui text-xs font-medium text-sage">
          <span>Tahun: {item.year}</span>
          {item.link ? (
            <a
              href={item.link}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex min-h-[40px] items-center text-brass hover:underline sm:min-h-[44px]"
            >
              Verifikasi ↗
            </a>
          ) : (
            <span className="text-brass">Sertifikat</span>
          )}
        </div>
      </div>
    </motion.article>
  );
}

function AwardCard({
  item,
  reducedMotion,
}: {
  item: Achievement;
  reducedMotion: boolean;
}) {
  return (
    <motion.article
      variants={reducedMotion ? undefined : cardVariants}
      whileHover={
        reducedMotion
          ? undefined
          : {
              y: -4,
              scale: 1.01,
              transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
            }
      }
      className="brutal-card group flex flex-col justify-between p-[clamp(14px,2.8vw,24px)] transition-colors duration-200 hover:border-brass"
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <div
            aria-hidden="true"
            className="inline-flex h-11 w-11 items-center justify-center border border-brass bg-ink text-brass transition-transform duration-300 group-hover:scale-105 sm:h-12 sm:w-12"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 sm:h-6 sm:w-6"
            >
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
          </div>

          <span className="rounded-full border border-forest-600 bg-ink px-3 py-1 font-ui text-xs font-semibold text-brass">
            Award
          </span>
        </div>

        <h3 className="mt-4 font-display text-[clamp(1rem,2.5vw,1.25rem)] font-bold text-sand">
          {item.title}
        </h3>
        <p className="mt-2 text-[clamp(0.75rem,2vw,0.875rem)] leading-relaxed text-sage">
          {item.issuer}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-forest-600/70 pt-3 font-ui text-xs font-medium text-sage">
        <span>Tahun: {item.year}</span>
        {item.link ? (
          <a
            href={item.link}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex min-h-[40px] items-center text-brass hover:underline sm:min-h-[44px]"
          >
            Lihat Detail ↗
          </a>
        ) : (
          <span className="text-brass">Kompetisi</span>
        )}
      </div>
    </motion.article>
  );
}

export function PortfolioGrid({
  activeCategory,
  reducedMotion,
  onSelectProject,
}: PortfolioGridProps) {
  return (
    <div id="portfolio-content-panel" className="mt-[clamp(24px,4vw,48px)]">
      <AnimatePresence mode="wait">
        {activeCategory === "projects" ? (
          <motion.div
            key="projects"
            variants={reducedMotion ? undefined : gridVariants}
            initial={reducedMotion ? false : "hidden"}
            animate="visible"
            exit={reducedMotion ? undefined : "exit"}
            className="grid grid-cols-2 gap-[clamp(10px,2.2vw,24px)] lg:grid-cols-3"
          >
            {PROJECTS.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                reducedMotion={reducedMotion}
                onSelect={() => onSelectProject(project)}
              />
            ))}
          </motion.div>
        ) : null}

        {activeCategory === "certificates" ? (
          <motion.div
            key="certificates"
            variants={reducedMotion ? undefined : gridVariants}
            initial={reducedMotion ? false : "hidden"}
            animate="visible"
            exit={reducedMotion ? undefined : "exit"}
            className="grid grid-cols-2 gap-[clamp(10px,2.2vw,24px)] lg:grid-cols-3"
          >
            {CERTIFICATE_ITEMS.map((cert) => (
              <CertificateCard
                key={cert.id}
                item={cert}
                reducedMotion={reducedMotion}
              />
            ))}
          </motion.div>
        ) : null}

        {activeCategory === "awards" ? (
          <motion.div
            key="awards"
            variants={reducedMotion ? undefined : gridVariants}
            initial={reducedMotion ? false : "hidden"}
            animate="visible"
            exit={reducedMotion ? undefined : "exit"}
            className="grid grid-cols-2 gap-[clamp(10px,2.2vw,24px)] lg:grid-cols-3"
          >
            {AWARD_ITEMS.map((award) => (
              <AwardCard
                key={award.id}
                item={award}
                reducedMotion={reducedMotion}
              />
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
