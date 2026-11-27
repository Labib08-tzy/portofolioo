import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Achievement } from "../../data/achievements";
import { PROJECTS, type Project } from "../../data/projects";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import {
  AWARD_ITEMS,
  CERTIFICATE_ITEMS,
  PORTFOLIO_CATEGORIES,
  type PortfolioCategory,
} from "./portfolioData";

function clean(text?: string): string {
  if (!text) return "";
  return text.replace(/\s*\(?TODO(?::[^)\n.]*)?\)?\.?/gi, "").trim();
}

/** Ikon folder SVG dengan flap depan dan lembar dalam untuk efek preview terbuka. */
function FolderPeekIcon() {
  return (
    <span
      aria-hidden="true"
      className="folder-icon-wrap relative inline-flex h-10 w-11 shrink-0 items-center justify-center"
    >
      <svg viewBox="0 0 44 36" fill="none" className="h-9 w-11 overflow-visible">
        {/* Back tab */}
        <path
          d="M3 7C3 4.79086 4.79086 3 7 3H15.5C16.8 3 18.02 3.63 18.77 4.69L20.5 7H37C39.2091 7 41 8.79086 41 11V29C41 31.2091 39.2091 33 37 33H7C4.79086 33 3 31.2091 3 29V7Z"
          fill="var(--c-forest-900)"
        />
        {/* Inner paper sheet */}
        <rect
          x="7"
          y="9.5"
          width="30"
          height="18"
          rx="2.5"
          fill="#efe4cb"
          stroke="rgba(11,15,13,0.14)"
          strokeWidth="1"
          className="folder-paper"
        />
        {/* Front flap */}
        <rect
          x="3"
          y="12"
          width="38"
          height="21"
          rx="4"
          fill="var(--c-forest-600)"
          className="folder-flap"
        />
        <line
          x1="10"
          y1="17"
          x2="22"
          y2="17"
          stroke="#efe4cb"
          strokeOpacity="0.45"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="folder-flap"
        />
      </svg>
    </span>
  );
}

function MobileProjectCard({ project }: { project: Project }) {
  const image = project.caseStudy?.images?.[0];
  const description = clean(project.description);
  const problem = clean(project.caseStudy?.problem);
  const role = clean(project.caseStudy?.role);

  return (
    <article className="w-full overflow-hidden rounded-2xl border border-ink/12 bg-white/50 p-4 shadow-[0_10px_28px_-14px_rgba(11,15,13,0.28)] backdrop-blur-md">
      {image ? (
        <div className="mb-3.5 aspect-[16/10] w-full overflow-hidden rounded-xl border border-ink/10 bg-ink/5">
          <img
            src={image}
            alt={`Preview ${project.title}`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover object-top"
          />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="rounded-full border border-ink/15 bg-white/60 px-2.5 py-0.5 font-ui text-[11px] font-semibold text-ink">
          {project.type}
        </span>
        <span className="rounded-full border border-forest-600/30 bg-forest-600/10 px-2.5 py-0.5 font-ui text-[11px] font-semibold text-forest-900">
          {project.status === "done" ? "Selesai" : "Dalam pengembangan"}
        </span>
      </div>

      <h4 className="mt-2.5 break-words font-display text-xl font-bold leading-snug text-ink">
        {project.title}
      </h4>

      {description ? (
        <p className="mt-1.5 line-clamp-3 break-words font-ui text-sm leading-relaxed text-ink/80">
          {description}
        </p>
      ) : null}

      {problem || role ? (
        <dl className="mt-3 space-y-2 border-t border-ink/10 pt-3">
          {problem ? (
            <div>
              <dt className="font-ui text-[11px] font-semibold uppercase tracking-[0.06em] text-forest-900">
                Masalah
              </dt>
              <dd className="mt-0.5 line-clamp-3 break-words font-ui text-xs leading-relaxed text-ink/80">
                {problem}
              </dd>
            </div>
          ) : null}
          {role ? (
            <div>
              <dt className="font-ui text-[11px] font-semibold uppercase tracking-[0.06em] text-forest-900">
                Peran
              </dt>
              <dd className="mt-0.5 break-words font-ui text-xs font-medium text-ink/85">
                {role}
              </dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      {project.demoUrl || project.repoUrl ? (
        <div className="mt-3.5 flex flex-wrap gap-2 border-t border-ink/10 pt-3">
          {project.demoUrl ? (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex min-h-[44px] items-center rounded-full bg-forest-900 px-4 py-2 font-ui text-xs font-semibold text-sand"
            >
              Lihat Demo ↗
            </a>
          ) : null}
          {project.repoUrl ? (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex min-h-[44px] items-center rounded-full border border-ink/20 bg-white/50 px-4 py-2 font-ui text-xs font-semibold text-ink"
            >
              Kode Sumber ↗
            </a>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function MobileCertificateCard({ item }: { item: Achievement }) {
  const title = clean(item.title);
  const issuer = clean(item.issuer);
  const year = clean(item.year);

  return (
    <article className="w-full overflow-hidden rounded-2xl border border-ink/12 bg-white/50 p-4 shadow-[0_10px_28px_-14px_rgba(11,15,13,0.28)] backdrop-blur-md">
      {item.image ? (
        <div className="aspect-[16/10] w-full overflow-hidden rounded-xl border border-ink/10 bg-ink/5">
          <img
            src={item.image}
            alt={title || "Sertifikat"}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}

      <div className={item.image ? "mt-3" : ""}>
        <span className="inline-block rounded-full border border-forest-600/30 bg-forest-600/10 px-2.5 py-0.5 font-ui text-[11px] font-semibold text-forest-900">
          Sertifikat
        </span>
        {title ? (
          <h4 className="mt-2 break-words font-display text-lg font-bold text-ink">
            {title}
          </h4>
        ) : null}
        {issuer || year ? (
          <p className="mt-1 break-words font-ui text-xs text-ink/75">
            {[issuer, year].filter(Boolean).join(" · ")}
          </p>
        ) : null}
      </div>
    </article>
  );
}

function MobileAwardCard({ item }: { item: Achievement }) {
  const title = clean(item.title);
  const issuer = clean(item.issuer);
  const year = clean(item.year);

  return (
    <article className="w-full overflow-hidden rounded-2xl border border-ink/12 bg-white/50 p-4 shadow-[0_10px_28px_-14px_rgba(11,15,13,0.28)] backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-full border border-forest-600/30 bg-forest-600/10 px-2.5 py-0.5 font-ui text-[11px] font-semibold text-forest-900">
          Penghargaan
        </span>
        {year ? (
          <span className="font-ui text-xs font-medium text-ink/70">{year}</span>
        ) : null}
      </div>

      <h4 className="mt-2.5 break-words font-display text-lg font-bold leading-snug text-ink">
        {title || "Penghargaan"}
      </h4>

      {issuer ? (
        <p className="mt-1.5 line-clamp-3 break-words font-ui text-sm leading-relaxed text-ink/80">
          {issuer}
        </p>
      ) : null}

      {item.link ? (
        <a
          href={item.link}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-3 inline-flex min-h-[44px] items-center font-ui text-xs font-semibold text-forest-900 underline underline-offset-4"
        >
          Lihat Detail ↗
        </a>
      ) : null}
    </article>
  );
}

export function MobilePortfolioFolders() {
  const [openCategory, setOpenCategory] = useState<PortfolioCategory | null>(null);
  const reducedMotion = useReducedMotion();

  const toggle = (id: PortfolioCategory) => {
    setOpenCategory((prev) => (prev === id ? null : id));
  };

  return (
    <div className="portal-surface overflow-x-clip px-4 py-14 sm:px-6">
      <div className="relative z-10 mx-auto max-w-xl">
        <div className="mb-7">
          <p className="font-ui text-xs font-semibold uppercase tracking-[0.14em] text-forest-900">
            Portofolio
          </p>
          <h2 className="mt-1.5 font-display text-3xl font-bold leading-tight text-ink">
            Karya &amp; Pencapaian
          </h2>
          <p className="mt-2 font-ui text-sm leading-relaxed text-ink/80">
            Ketuk folder untuk melihat daftar {PROJECTS.length} project,{" "}
            {CERTIFICATE_ITEMS.length} sertifikat, dan {AWARD_ITEMS.length}{" "}
            penghargaan.
          </p>
        </div>

        <div className="flex flex-col gap-3.5">
          {PORTFOLIO_CATEGORIES.map((category) => {
            const isOpen = openCategory === category.id;
            const panelId = `mobile-folder-panel-${category.id}`;

            return (
              <div key={category.id} className="w-full">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggle(category.id)}
                  className="folder-trigger flex min-h-[68px] w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border border-ink/14 bg-white/50 px-4 py-3 text-left backdrop-blur-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-900"
                >
                  <div className="flex min-w-0 items-center gap-3.5">
                    <FolderPeekIcon />
                    <div className="min-w-0">
                      <span className="block truncate font-display text-lg font-bold text-ink">
                        {category.label}
                      </span>
                      <span className="block truncate font-ui text-xs text-ink/70">
                        {category.subtitle}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2.5">
                    <span className="inline-flex min-w-[28px] items-center justify-center rounded-full bg-forest-900 px-2.5 py-0.5 font-ui text-xs font-semibold text-sand">
                      {category.count}
                    </span>
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      aria-hidden="true"
                      className="folder-chevron h-5 w-5 text-ink/70"
                    >
                      <path
                        d="M5 7.5L10 12.5L15 7.5"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      id={panelId}
                      initial={
                        reducedMotion
                          ? { opacity: 1, height: "auto" }
                          : { opacity: 0, height: 0, y: -6 }
                      }
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={
                        reducedMotion
                          ? { opacity: 0, height: 0 }
                          : { opacity: 0, height: 0, y: -6 }
                      }
                      transition={{
                        duration: reducedMotion ? 0 : 0.28,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col gap-3.5 pt-3 pb-1">
                        {category.id === "projects"
                          ? PROJECTS.map((project) => (
                              <MobileProjectCard
                                key={project.id}
                                project={project}
                              />
                            ))
                          : null}

                        {category.id === "certificates"
                          ? CERTIFICATE_ITEMS.map((cert) => (
                              <MobileCertificateCard
                                key={cert.id}
                                item={cert}
                              />
                            ))
                          : null}

                        {category.id === "awards"
                          ? AWARD_ITEMS.map((award) => (
                              <MobileAwardCard key={award.id} item={award} />
                            ))
                          : null}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
