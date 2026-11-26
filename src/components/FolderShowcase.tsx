import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ACHIEVEMENTS, type Achievement } from "../data/achievements";
import { PROJECTS, type Project } from "../data/projects";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { PillButton } from "./ui/PillButton";
import { SectionHeading } from "./ui/SectionHeading";

type FolderKind = "projects" | "achievements";

type SelectedItem =
  | { kind: "projects"; item: Project }
  | { kind: "achievements"; item: Achievement };

interface MiniCardData {
  id: string;
  title: string;
  badge: string;
  accent: boolean;
}

interface FolderConfig {
  id: FolderKind;
  title: string;
  subtitle: string;
  countLabel: string;
  cards: MiniCardData[];
}

function projectStatusLabel(status: Project["status"]): string {
  return status === "done" ? "Selesai" : "Dalam pengembangan";
}

function achievementKindLabel(item: Achievement): string {
  if (item.kind === "competition") return "Juara";
  return "Sertifikat";
}

const FOLDERS: FolderConfig[] = [
  {
    id: "projects",
    title: "PROJECTS",
    subtitle: "Aplikasi Android, web, dan eksperimen produk",
    countLabel: `${String(PROJECTS.length).padStart(2, "0")} FILE`,
    cards: PROJECTS.slice(0, 4).map((p) => ({
      id: p.id,
      title: p.title,
      badge: projectStatusLabel(p.status),
      accent: p.status === "done",
    })),
  },
  {
    id: "achievements",
    title: "SERTIFIKAT & PENCAPAIAN",
    subtitle: "Kompetisi LKS dan daftar sertifikasi",
    countLabel: `${String(ACHIEVEMENTS.length).padStart(2, "0")} FILE`,
    cards: ACHIEVEMENTS.slice(0, 4).map((a) => ({
      id: a.id,
      title: a.title,
      badge: achievementKindLabel(a),
      accent: a.kind === "competition",
    })),
  },
];

const CARD_OFFSETS = [
  { x: -24, y: -56, rot: -4 },
  { x: 18, y: -72, rot: 3.5 },
  { x: -12, y: -44, rot: -2 },
  { x: 26, y: -58, rot: 4 },
];

function FolderButton({
  folder,
  isPeeking,
  isOpen,
  reducedMotion,
  isTouch,
  buttonRef,
  onPeekStart,
  onPeekEnd,
  onOpen,
}: {
  folder: FolderConfig;
  isPeeking: boolean;
  isOpen: boolean;
  reducedMotion: boolean;
  isTouch: boolean;
  buttonRef: (el: HTMLButtonElement | null) => void;
  onPeekStart: () => void;
  onPeekEnd: () => void;
  onOpen: () => void;
}) {
  const handleClick = () => {
    if (isTouch && !isPeeking) {
      onPeekStart();
      return;
    }
    onOpen();
  };

  return (
    <div id={folder.id} className="scroll-mt-20">
      <motion.button
        ref={buttonRef}
        type="button"
        layoutId={reducedMotion ? undefined : `folder-${folder.id}`}
        aria-expanded={isOpen}
        aria-controls={`panel-${folder.id}`}
        onClick={handleClick}
        onMouseEnter={isTouch ? undefined : onPeekStart}
        onMouseLeave={isTouch ? undefined : onPeekEnd}
        onFocus={onPeekStart}
        onBlur={onPeekEnd}
        animate={
          reducedMotion
            ? undefined
            : { y: isPeeking ? -6 : 0 }
        }
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className={`group relative w-full text-left focus-visible:outline-2 focus-visible:outline-brass focus-visible:outline-offset-4`}
      >
        {/* Top-left Manila Folder Tab */}
        <div className="flex items-end">
          <div
            className={`inline-flex items-center gap-2 border border-b-0 px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] transition-colors ${
              isPeeking
                ? "border-brass bg-forest-900 text-brass"
                : "border-forest-600 bg-forest-900 text-sand"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-brass" aria-hidden="true" />
            <span>{folder.countLabel}</span>
          </div>
          <div
            className={`h-px flex-1 transition-colors ${
              isPeeking ? "bg-brass" : "bg-forest-600"
            }`}
          />
        </div>

        {/* Folder Body + Peeking Mini-Cards */}
        <div
          className={`relative mt-0 pt-14 transition-colors ${
            isPeeking ? "border-brass" : "border-forest-600"
          }`}
          style={{ perspective: "900px" }}
        >
          {/* Back Pocket */}
          <div
            aria-hidden="true"
            className={`absolute inset-x-0 top-0 bottom-0 border bg-ink transition-colors ${
              isPeeking ? "border-brass" : "border-forest-600"
            }`}
          />

          {/* Stacked Mini-Cards inside folder */}
          <div
            aria-hidden="true"
            className="relative z-10 mx-auto h-36 w-[88%] sm:h-40"
          >
            {folder.cards.map((card, idx) => {
              const offset = CARD_OFFSETS[idx % CARD_OFFSETS.length];
              const restingY = idx * 8;
              return (
                <motion.div
                  key={card.id}
                  initial={false}
                  animate={
                    reducedMotion
                      ? { opacity: isPeeking ? 1 : 0.7 }
                      : isPeeking
                        ? {
                            x: offset.x,
                            y: offset.y,
                            rotate: offset.rot,
                            opacity: 1,
                          }
                        : {
                            x: 0,
                            y: restingY,
                            rotate: (idx % 2 === 0 ? -1 : 1) * 0.8,
                            opacity: 0.92,
                          }
                  }
                  transition={
                    reducedMotion
                      ? { duration: 0.15 }
                      : {
                          type: "spring",
                          stiffness: 280,
                          damping: 23,
                          delay: isPeeking ? idx * 0.045 : 0,
                        }
                  }
                  className="absolute inset-x-0 top-0 border border-forest-600 bg-forest-900 p-3.5 shadow-[3px_3px_0_0_var(--c-forest-600)]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-display text-sm font-bold text-sand">
                      {card.title}
                    </span>
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-0.5 font-mono text-[10px] ${
                        card.accent
                          ? "border-brass text-brass"
                          : "border-forest-600 text-sage"
                      }`}
                    >
                      {card.badge}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Front Manila Flap */}
          <motion.div
            animate={
              reducedMotion
                ? undefined
                : { rotateX: isPeeking ? -14 : 0 }
            }
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            style={{ transformOrigin: "bottom center" }}
            className={`relative z-20 -mt-12 border bg-forest-900 p-6 shadow-[8px_8px_0_0_var(--c-forest-600)] transition-colors sm:p-7 ${
              isPeeking ? "border-brass" : "border-forest-600"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brass">
                  DIREKTORI // {folder.countLabel}
                </p>
                <h3 className="mt-2 font-display text-2xl font-bold tracking-tight text-sand sm:text-3xl">
                  {folder.title}
                </h3>
                <p className="mt-2 text-sm text-sage">{folder.subtitle}</p>
              </div>

              <span className="shrink-0 rounded-full border border-forest-600 bg-ink px-3 py-1 font-mono text-xs text-sand transition-colors group-hover:border-brass group-hover:text-brass">
                {isTouch && !isPeeking ? "INTIP" : "BUKA"}
              </span>
            </div>
          </motion.div>
        </div>
      </motion.button>

      {/* Screen-reader accessible list of folder contents */}
      <ul className="sr-only" aria-label={`Isi folder ${folder.title}`}>
        {folder.cards.map((card) => (
          <li key={card.id}>
            {card.title} ({card.badge})
          </li>
        ))}
      </ul>
    </div>
  );
}

function FolderOverlayPanel({
  folder,
  reducedMotion,
  onClose,
}: {
  folder: FolderConfig;
  reducedMotion: boolean;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<SelectedItem | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    closeBtnRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0.1 : 0.22 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/85 p-4 backdrop-blur-md sm:p-6"
    >
      <motion.div
        ref={dialogRef}
        id={`panel-${folder.id}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`panel-title-${folder.id}`}
        layoutId={reducedMotion ? undefined : `folder-${folder.id}`}
        onClick={(e) => e.stopPropagation()}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        className="brutal-card-lg flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden"
      >
        {/* Panel Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-forest-600 bg-ink px-6 py-4">
          <div className="flex items-center gap-3">
            {selected ? (
              <PillButton
                onClick={() => setSelected(null)}
                variant="outline"
                size="sm"
              >
                Kembali
              </PillButton>
            ) : null}
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brass">
                {selected ? "DETAIL FILE" : `DIREKTORI // ${folder.countLabel}`}
              </p>
              <h3
                id={`panel-title-${folder.id}`}
                className="font-display text-xl font-bold text-sand sm:text-2xl"
              >
                {selected ? selected.item.title : folder.title}
              </h3>
            </div>
          </div>

          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Tutup panel"
            className="rounded-full border border-forest-600 bg-forest-900 px-4 py-1.5 font-mono text-xs text-sand transition-colors hover:border-brass hover:text-brass"
          >
            TUTUP
          </button>
        </div>

        {/* Panel Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {selected ? (
            selected.kind === "projects" ? (
              <ProjectDetail project={selected.item} />
            ) : (
              <AchievementDetail achievement={selected.item} />
            )
          ) : folder.id === "projects" ? (
            <div className="grid gap-5 md:grid-cols-2">
              {PROJECTS.map((project, idx) => (
                <motion.button
                  key={project.id}
                  type="button"
                  initial={reducedMotion ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: reducedMotion ? 0 : 0.25,
                    delay: reducedMotion ? 0 : idx * 0.05,
                  }}
                  onClick={() => setSelected({ kind: "projects", item: project })}
                  className="brutal-card group flex flex-col justify-between p-5 text-left transition-transform duration-150 hover:-translate-y-1 hover:border-brass"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 font-mono text-xs">
                      <span className="rounded-full border border-forest-600 bg-ink px-2.5 py-0.5 text-sage">
                        {project.type}
                      </span>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 ${
                          project.status === "done"
                            ? "border-brass text-brass"
                            : "border-forest-600 text-sage"
                        }`}
                      >
                        {projectStatusLabel(project.status)}
                      </span>
                    </div>
                    <h4 className="mt-3 font-display text-xl font-bold text-sand group-hover:text-brass">
                      {project.title}
                    </h4>
                    <p className="mt-2 text-sm text-sage">
                      {project.description}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5 border-t border-forest-600/60 pt-3">
                    {project.stack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full border border-forest-600 bg-ink px-2.5 py-0.5 font-mono text-[11px] text-sand"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-3">
              {ACHIEVEMENTS.map((item, idx) => (
                <motion.button
                  key={item.id}
                  type="button"
                  initial={reducedMotion ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: reducedMotion ? 0 : 0.25,
                    delay: reducedMotion ? 0 : idx * 0.05,
                  }}
                  onClick={() =>
                    setSelected({ kind: "achievements", item })
                  }
                  className="brutal-card group flex flex-col justify-between p-5 text-left transition-transform duration-150 hover:-translate-y-1 hover:border-brass"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 font-mono text-xs">
                      <span className="rounded-full border border-forest-600 bg-ink px-2.5 py-0.5 text-brass">
                        {achievementKindLabel(item)}
                      </span>
                      <span className="text-sage">{item.year}</span>
                    </div>
                    <h4 className="mt-3 font-display text-lg font-bold text-sand group-hover:text-brass">
                      {item.title}
                    </h4>
                    <p className="mt-2 text-sm text-sage">{item.issuer}</p>
                  </div>
                  <p className="mt-4 border-t border-forest-600/60 pt-3 font-mono text-xs text-sand">
                    Lihat detail →
                  </p>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function ProjectDetail({ project }: { project: Project }) {
  const isDone = project.status === "done";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
        <span className="rounded-full border border-forest-600 bg-ink px-3 py-1 text-sage">
          {project.type}
        </span>
        <span
          className={`rounded-full border px-3 py-1 ${
            isDone
              ? "border-brass text-brass"
              : "border-forest-600 text-sage"
          }`}
        >
          {projectStatusLabel(project.status)}
        </span>
      </div>

      <p className="text-base leading-relaxed text-sand/90">
        {project.description}
      </p>

      {isDone && project.caseStudy ? (
        <div className="grid gap-4 border-t border-forest-600/70 pt-5 sm:grid-cols-2">
          <div className="border border-forest-600 bg-ink p-4">
            <h4 className="font-mono text-xs uppercase tracking-wider text-brass">
              Masalah
            </h4>
            <p className="mt-2 text-sm text-sage">
              {project.caseStudy.problem}
            </p>
          </div>
          <div className="border border-forest-600 bg-ink p-4">
            <h4 className="font-mono text-xs uppercase tracking-wider text-brass">
              Peran
            </h4>
            <p className="mt-2 text-sm text-sage">{project.caseStudy.role}</p>
          </div>
          <div className="border border-forest-600 bg-ink p-4">
            <h4 className="font-mono text-xs uppercase tracking-wider text-brass">
              Solusi
            </h4>
            <p className="mt-2 text-sm text-sage">
              {project.caseStudy.solution}
            </p>
          </div>
          <div className="border border-forest-600 bg-ink p-4">
            <h4 className="font-mono text-xs uppercase tracking-wider text-brass">
              Hasil & Pembelajaran
            </h4>
            <p className="mt-2 text-sm text-sage">{project.caseStudy.result}</p>
          </div>
        </div>
      ) : (
        <div className="border border-forest-600 bg-ink p-4 font-mono text-xs text-sage">
          Status jujur: project masih dalam tahap pengembangan. Studi kasus
          lengkap akan ditambahkan setelah selesai.
        </div>
      )}

      <div className="border-t border-forest-600/70 pt-4">
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

      {project.demoUrl || project.repoUrl ? (
        <div className="flex flex-wrap gap-3 border-t border-forest-600/70 pt-4">
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
          ) : null}
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
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function AchievementDetail({ achievement }: { achievement: Achievement }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
        <span className="rounded-full border border-brass px-3 py-1 text-brass">
          {achievementKindLabel(achievement)}
        </span>
        <span className="rounded-full border border-forest-600 bg-ink px-3 py-1 text-sage">
          Tahun: {achievement.year}
        </span>
      </div>

      <div className="border border-forest-600 bg-ink p-5">
        <p className="font-mono text-xs uppercase tracking-wider text-sage">
          Penerbit / Penyelenggara
        </p>
        <p className="mt-2 text-base text-sand">{achievement.issuer}</p>
      </div>

      {achievement.link ? (
        <PillButton
          href={achievement.link}
          target="_blank"
          rel="noreferrer"
          variant="primary"
          size="sm"
        >
          Buka Tautan Verifikasi
        </PillButton>
      ) : null}
    </div>
  );
}

export function FolderShowcase() {
  const reducedMotion = useReducedMotion();
  const isTouch = useMediaQuery("(hover: none)");
  const [peekingId, setPeekingId] = useState<FolderKind | null>(null);
  const [openId, setOpenId] = useState<FolderKind | null>(null);
  const folderBtnRefs = useRef<Record<FolderKind, HTMLButtonElement | null>>({
    projects: null,
    achievements: null,
  });

  const activeFolder = FOLDERS.find((f) => f.id === openId) ?? null;

  const handleClose = useCallback(() => {
    const closingId = openId;
    setOpenId(null);
    setPeekingId(null);
    if (closingId) {
      window.requestAnimationFrame(() => {
        folderBtnRefs.current[closingId]?.focus();
      });
    }
  }, [openId]);

  return (
    <section className="border-b border-forest-600 bg-ink py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          index="03"
          eyebrow="Arsip Karya & Pencapaian"
          title="Projects & Sertifikat"
          subtitle="Arahkan kursor atau fokus untuk mengintip isi folder, lalu buka untuk melihat detail."
        />

        <div className="grid gap-10 md:grid-cols-2 lg:gap-12">
          {FOLDERS.map((folder) => (
            <FolderButton
              key={folder.id}
              folder={folder}
              isPeeking={peekingId === folder.id}
              isOpen={openId === folder.id}
              reducedMotion={reducedMotion}
              isTouch={isTouch}
              buttonRef={(el) => {
                folderBtnRefs.current[folder.id] = el;
              }}
              onPeekStart={() => setPeekingId(folder.id)}
              onPeekEnd={() =>
                setPeekingId((curr) => (curr === folder.id ? null : curr))
              }
              onOpen={() => setOpenId(folder.id)}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activeFolder ? (
          <FolderOverlayPanel
            key={activeFolder.id}
            folder={activeFolder}
            reducedMotion={reducedMotion}
            onClose={handleClose}
          />
        ) : null}
      </AnimatePresence>
    </section>
  );
}
