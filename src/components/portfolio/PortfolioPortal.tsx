import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import type { Achievement } from "../../data/achievements";
import { PROJECTS, type Project } from "../../data/projects";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { BlurBackdrop } from "../ui/BlurBackdrop";
import { PortfolioSection } from "./PortfolioSection";
import {
  AWARD_ITEMS,
  CERTIFICATE_ITEMS,
  PORTFOLIO_CATEGORIES,
  type PortfolioCategory,
} from "./portfolioData";
import { DEFAULT_GEO, measureStroke, type Geo } from "./measureStroke";
import "../../styles/portal.css";

/*
 * Alur scroll (p = 0..1 sepanjang section):
 *   0.00 - 0.05  judul "Portofolio" diam
 *   0.05 - 0.40  zoom masuk ke garis huruf "o" sampai layar penuh warna huruf itu (dimensi baru)
 *   0.40 - 0.96  portofolio lengkap bergeser ke samping mengikuti scroll
 *   0.96 - 1.00  diam; dimensi terang TIDAK menutup, langsung lanjut ke galeri foto (tema sama)
 */
const ZOOM_START = 0.05;
const ZOOM_END = 0.4;
const TRACK_END = 0.96;
const SECTION_HEIGHT = "800svh";
const CATEGORY_ORDER: PortfolioCategory[] = ["projects", "certificates", "awards"];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (v: number) => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};

/** Menyembunyikan placeholder "TODO" agar tidak tampil di halaman. */
function clean(text?: string): string {
  if (!text) return "";
  return text.replace(/\s*\(?TODO(?::[^)\n.]*)?\)?\.?/gi, "").trim();
}

export function PortfolioPortal() {
  const reducedMotion = useReducedMotion();
  // Tanpa animasi: pakai tampilan folder biasa
  if (reducedMotion) return <PortfolioSection />;
  return <Portal />;
}

function Portal() {
  const containerRef = useRef<HTMLElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const h2Ref = useRef<HTMLHeadingElement | null>(null);
  const oRef = useRef<HTMLSpanElement | null>(null);
  const markRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const panelRefs = useRef<Partial<Record<PortfolioCategory, HTMLElement | null>>>({});
  const geo = useRef<Geo>(DEFAULT_GEO);
  const [origin, setOrigin] = useState("50% 50%");
  const [active, setActive] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    const measure = () => {
      const h2 = h2Ref.current;
      const o = oRef.current;
      const mark = markRef.current;
      const wrap = wrapRef.current;
      if (cancelled || !h2 || !o || !mark || !wrap) return;
      geo.current = measureStroke(h2, o, mark, wrap);
      setOrigin(`${geo.current.hx}px ${geo.current.hy}px`);
    };

    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(measure, 150);
    };

    (document.fonts?.ready ?? Promise.resolve()).then(measure);
    window.addEventListener("resize", onResize);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.4 });

  // --- Zoom masuk ke garis huruf "o" ---
  const z = useTransform(p, [ZOOM_START, ZOOM_END], [0, 1]);
  const S = useTransform(z, (v) => Math.exp(Math.log(geo.current.smax) * smooth(v)));
  const move = useTransform(z, (v) => smooth(v / 0.55));
  const tx = useTransform(move, (v) => (geo.current.vw / 2 - geo.current.ox) * v);
  const ty = useTransform(move, (v) => (geo.current.vh / 2 - geo.current.oy) * v);
  const headOpacity = useTransform(z, [0.93, 0.98], [1, 0]);
  const hintOpacity = useTransform(p, [0, 0.05], [1, 0]);

  // --- Dimensi: warnanya sama dengan huruf "o", muncul saat layar penuh oleh garis huruf ---
  const worldOpacity = useTransform(p, (v) => smooth((v - 0.267) / 0.105));
  const worldScale = useTransform(p, [0.3, 0.44], [1.12, 1]);
  const contentOpacity = useTransform(p, [0.34, 0.44], [0, 1]);
  const portalEvents = useTransform(p, (v) => (v > 0.42 ? "auto" : "none"));

  const trackP = useTransform(p, [ZOOM_END, TRACK_END], [0, 1]);
  const trackX = useTransform(trackP, (v) => {
    const el = trackRef.current;
    if (!el) return 0;
    const max = Math.max(0, el.scrollWidth - (el.parentElement?.clientWidth ?? 0));
    return -max * v;
  });
  const barWidth = useTransform(trackP, (v) => `${v * 100}%`);

  useMotionValueEvent(trackX, "change", (x) => {
    let idx = 0;
    CATEGORY_ORDER.forEach((cat, i) => {
      const el = panelRefs.current[cat];
      if (el && el.offsetLeft - geo.current.vw * 0.5 <= -x) idx = i;
    });
    setActive((prev) => (prev === idx ? prev : idx));
  });

  return (
    <section
      ref={containerRef}
      id="portfolio"
      aria-label="Portofolio"
      className="relative bg-ink"
      style={{ height: SECTION_HEIGHT }}
    >
      <span id="projects" aria-hidden="true" className="absolute top-0" />
      <span id="achievements" aria-hidden="true" className="absolute top-0" />

      <div className="sticky top-0 isolate h-[100svh] overflow-hidden">
        <BlurBackdrop variant="c" />

        {/* Judul yang di-zoom */}
        <div ref={wrapRef} className="absolute inset-0 z-10 flex items-center justify-center">
          <motion.h2
            ref={h2Ref}
            className="relative whitespace-nowrap font-display text-[clamp(3rem,12.5vw,9.5rem)] font-bold leading-none tracking-tight text-sand"
            style={{ x: tx, y: ty, scale: S, transformOrigin: origin, opacity: headOpacity }}
          >
            Port
            <span ref={oRef}>
              <i ref={markRef} aria-hidden="true" className="inline-block h-0 w-0" />o
            </span>
            folio
          </motion.h2>
        </div>

        <motion.p
          style={{ opacity: hintOpacity }}
          className="pointer-events-none absolute inset-x-0 bottom-[max(2.5rem,env(safe-area-inset-bottom))] z-10 text-center font-ui text-sm text-sage"
        >
          Scroll untuk masuk
        </motion.p>

        {/* Dimensi lain */}
        <motion.div
          className="portal-world inset-0 z-30"
          style={{ opacity: worldOpacity, pointerEvents: portalEvents }}
        >
          <motion.div className="absolute inset-0" style={{ scale: worldScale, opacity: contentOpacity }}>
            <div className="h-full w-full overflow-hidden pb-24 pt-16">
              <motion.div
                ref={trackRef}
                className="flex h-full w-max items-center gap-[clamp(24px,4vw,64px)] px-[8vw]"
                style={{ x: trackX }}
              >
                <IntroPanel
                  panelRef={(el) => {
                    panelRefs.current.projects = el;
                  }}
                />
                {PROJECTS.map((project) => (
                  <ProjectPanel key={project.id} project={project} />
                ))}
                <ListPanel
                  category="certificates"
                  items={CERTIFICATE_ITEMS}
                  panelRef={(el) => {
                    panelRefs.current.certificates = el;
                  }}
                />
                <ListPanel
                  category="awards"
                  items={AWARD_ITEMS}
                  panelRef={(el) => {
                    panelRefs.current.awards = el;
                  }}
                />
              </motion.div>
            </div>

            <div className="absolute inset-x-0 bottom-0 px-[8vw] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              <div className="mx-auto flex max-w-5xl flex-col gap-3">
                <div className="flex justify-between font-ui text-sm">
                  {PORTFOLIO_CATEGORIES.map((c, i) => (
                    <span
                      key={c.id}
                      className={i === active ? "text-ink" : "text-ink/40"}
                      style={{ transition: "color 0.2s" }}
                    >
                      {c.label} ({c.count})
                    </span>
                  ))}
                </div>
                <div className="h-px w-full bg-ink/15">
                  <motion.div className="h-px bg-ink" style={{ width: barWidth }} />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- Panel ---------- */

type PanelRef = (el: HTMLElement | null) => void;

function IntroPanel({ panelRef }: { panelRef: PanelRef }) {
  const text = `${PROJECTS.length} project, ${CERTIFICATE_ITEMS.length} sertifikat, dan ${AWARD_ITEMS.length} penghargaan.`;
  return (
    <div ref={panelRef} className="flex w-[min(86vw,680px)] shrink-0 flex-col gap-4">
      <h3 className="font-display text-[clamp(2rem,5vw,4rem)] font-bold leading-[1.02] text-ink">
        {text}
      </h3>
      <p className="max-w-md font-ui text-base text-ink/80">
        Lanjutkan scroll untuk melihat detail setiap karya.
      </p>
    </div>
  );
}

function Chip({ children }: { children: string }) {
  return (
    <span className="rounded-full border border-ink/40 px-3 py-1 font-ui text-xs text-sand">
      {children}
    </span>
  );
}

function ProjectPanel({ project }: { project: Project }) {
  const description = clean(project.description);
  const stack = project.stack.map(clean).filter(Boolean);
  const image = project.caseStudy?.images?.[0];
  const study = project.caseStudy
    ? ([
        ["Masalah", clean(project.caseStudy.problem)],
        ["Peran", clean(project.caseStudy.role)],
        ["Solusi", clean(project.caseStudy.solution)],
        ["Hasil", clean(project.caseStudy.result)],
      ] as const).filter(([, text]) => text)
    : [];

  return (
    <article className="grid h-[min(76svh,620px)] w-[min(88vw,1040px)] shrink-0 gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="relative hidden flex-col overflow-hidden rounded-xl border border-ink/30 bg-ink/5 lg:flex">
        <div className="flex items-center gap-1.5 border-b border-ink/20 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-ink/25" />
          <span className="h-2.5 w-2.5 rounded-full bg-ink/25" />
          <span className="h-2.5 w-2.5 rounded-full bg-ink/25" />
        </div>
        {image ? (
          <img src={image} alt={`Preview ${project.title}`} className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-1 items-center justify-center font-display text-[11rem] font-bold leading-none text-ink">
            {project.title.charAt(0)}
          </div>
        )}
      </div>

      <div className="flex min-h-0 flex-col justify-center gap-5">
        <div className="flex flex-wrap gap-2">
          <Chip>{project.type}</Chip>
          <Chip>{project.status === "done" ? "Selesai" : "Dalam pengembangan"}</Chip>
        </div>

        <h3 className="font-display text-[clamp(2rem,4.2vw,3.5rem)] font-bold leading-[1.02] text-ink">
          {project.title}
        </h3>

        <p className={`max-w-xl font-ui text-base ${description ? "text-ink/90" : "text-ink/40"}`}>
          {description || "Detail project ini segera ditambahkan."}
        </p>

        {stack.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {stack.map((item) => (
              <li key={item}>
                <Chip>{item}</Chip>
              </li>
            ))}
          </ul>
        ) : null}

        {study.length > 0 ? (
          <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {study.map(([label, text]) => (
              <div key={label}>
                <dt className="font-ui text-sm font-semibold text-ink">{label}</dt>
                <dd className="mt-1 line-clamp-3 font-ui text-sm text-ink/80 lg:line-clamp-4">{text}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {project.demoUrl || project.repoUrl ? (
          <div className="flex flex-wrap gap-3">
            {project.demoUrl ? (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-ink px-5 py-2.5 font-ui text-sm font-semibold text-sand"
              >
                Lihat demo
              </a>
            ) : null}
            {project.repoUrl ? (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-ink/50 px-5 py-2.5 font-ui text-sm font-semibold text-ink"
              >
                Kode sumber
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}

function ListPanel({
  category,
  items,
  panelRef,
}: {
  category: "certificates" | "awards";
  items: Achievement[];
  panelRef: PanelRef;
}) {
  const meta = PORTFOLIO_CATEGORIES.find((c) => c.id === category);
  return (
    <section ref={panelRef} className="flex w-[min(88vw,760px)] shrink-0 flex-col gap-6">
      <div>
        <h3 className="font-display text-[clamp(2rem,4.2vw,3.5rem)] font-bold leading-[1.02] text-ink">
          {meta?.label}
        </h3>
        <p className="mt-2 font-ui text-base text-ink/80">{meta?.subtitle}</p>
      </div>
      <ul className="divide-y divide-ink/25 border-y border-ink/25">
        {items.map((item) => {
          const title = clean(item.title);
          const detail = [clean(item.issuer), clean(item.year)].filter(Boolean).join(", ");
          return (
            <li key={item.id} className="flex items-baseline justify-between gap-4 py-4">
              <div>
                <p className={`font-display text-xl font-bold ${title ? "text-ink" : "text-ink/40"}`}>
                  {title || "Segera ditambahkan"}
                </p>
                {detail ? <p className="mt-1 font-ui text-sm text-ink/75">{detail}</p> : null}
              </div>
              {item.link ? (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 font-ui text-sm font-semibold text-ink underline underline-offset-4"
                >
                  Lihat
                </a>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
