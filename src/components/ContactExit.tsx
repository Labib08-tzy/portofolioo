import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { BlurBackdrop } from "./ui/BlurBackdrop";
import { ChibiContact } from "./contact/ChibiContact";
import { DEFAULT_GEO, measureStroke, type Geo } from "./portfolio/measureStroke";
import "../styles/portal.css";

/*
 * Kebalikan zoom masuk di Portfolio.
 * Layar terang (galeri) "keluar" lewat garis huruf "o" pada judul "Kontak":
 * mulai dari garis huruf yang memenuhi layar, lalu zoom-out sampai judul utuh di latar hutan.
 *
 * Alur scroll (q = 0..1 sepanjang section, z = 1 → 0):
 *   0.00 - 0.80  zoom-out dari garis huruf "o" ke judul utuh
 *   0.80 - 1.00  judul diam sebentar, lalu section lepas dan kartu kontak menyusul
 *
 * Angka z di bawah sama dengan di PortfolioPortal (hanya dibalik), supaya gerakannya cermin.
 */
const ZOOM_END = 0.8;
const SECTION_HEIGHT = "240svh";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (v: number) => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};

function Title({
  h2Ref,
  oRef,
  markRef,
  style,
}: {
  h2Ref?: React.Ref<HTMLHeadingElement>;
  oRef?: React.Ref<HTMLSpanElement>;
  markRef?: React.Ref<HTMLElement>;
  style?: React.ComponentProps<typeof motion.h2>["style"];
}) {
  return (
    <motion.h2
      ref={h2Ref}
      className="relative whitespace-nowrap font-display text-[clamp(2.2rem,5.5vw,4.25rem)] font-bold leading-none tracking-tight text-sand"
      style={style}
    >
      K
      <span ref={oRef}>
        <i ref={markRef} aria-hidden="true" className="inline-block h-0 w-0" />o
      </span>
      ntak
    </motion.h2>
  );
}

export function ContactExit() {
  const reducedMotion = useReducedMotion();
  return reducedMotion ? <StaticTitle /> : <ZoomOut />;
}

/** Tanpa animasi: judul biasa. */
function StaticTitle() {
  return (
    <section
      id="contact-exit"
      aria-label="Kontak"
      className="relative isolate overflow-hidden bg-ink px-3 pt-24 pb-16 text-center"
    >
      <span id="contact" aria-hidden="true" className="absolute top-0" />
      <BlurBackdrop variant="a" />
      <Title />
      <div className="mt-8">
        <ChibiContact />
      </div>
    </section>
  );
}

function ZoomOut() {
  const containerRef = useRef<HTMLElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const h2Ref = useRef<HTMLHeadingElement | null>(null);
  const oRef = useRef<HTMLSpanElement | null>(null);
  const markRef = useRef<HTMLElement | null>(null);
  const geo = useRef<Geo>(DEFAULT_GEO);
  const [origin, setOrigin] = useState("50% 50%");

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
  const q = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.4 });

  // z = 1: garis huruf "o" memenuhi layar. z = 0: judul utuh.
  const z = useTransform(q, [0, ZOOM_END], [1, 0]);
  const S = useTransform(z, (v) => Math.exp(Math.log(geo.current.smax) * smooth(v)));
  const move = useTransform(z, (v) => smooth(v / 0.55));
  const tx = useTransform(move, (v) => (geo.current.vw / 2 - geo.current.ox) * v);
  const ty = useTransform(move, (v) => (geo.current.vh / 2 - geo.current.oy) * v);
  const headOpacity = useTransform(z, [0.93, 0.98], [1, 0]);
  // Dimensi terang menutupi layar di awal, lalu memudar saat garis huruf mengecil.
  const worldOpacity = useTransform(z, (v) => smooth((v - 0.62) / 0.3));
  // Kotak kontak muncul tepat di bawah judul setelah zoom-out selesai (satu layar).
  const boxOpacity = useTransform(q, [0.72, 0.9], [0, 1]);
  const boxY = useTransform(q, [0.72, 0.9], [70, 0]);
  const boxPE = useTransform(q, (v) => (v > 0.82 ? "auto" : "none"));

  return (
    <section
      ref={containerRef}
      id="contact-exit"
      aria-label="Kontak"
      className="relative bg-ink"
      style={{ height: SECTION_HEIGHT }}
    >
      {/* Titik tujuan menu "Contact": judul sudah utuh (akhir zoom-out) */}
      <span
        id="contact"
        aria-hidden="true"
        className="absolute left-0"
        style={{ top: "calc(100% - 100svh)" }}
      />

      <div className="sticky top-0 isolate h-[100svh] overflow-hidden">
        <BlurBackdrop variant="a" />

        <div ref={wrapRef} className="absolute inset-0 z-10 flex items-start justify-center pt-[clamp(4.25rem,10svh,6.25rem)]">
          <Title
            h2Ref={h2Ref}
            oRef={oRef}
            markRef={markRef}
            style={{ x: tx, y: ty, scale: S, transformOrigin: origin, opacity: headOpacity }}
          />
        </div>

        <motion.div
          className="absolute inset-x-0 bottom-0 z-20 flex justify-center px-3 pb-[clamp(0.75rem,3.5svh,2rem)]"
          style={{ opacity: boxOpacity, y: boxY, pointerEvents: boxPE as never }}
        >
          <ChibiContact />
        </motion.div>

        {/* Dimensi terang: sama dengan galeri & portofolio (sand + kisi) */}
        <motion.div
          aria-hidden="true"
          className="portal-world pointer-events-none inset-0 z-30"
          style={{ opacity: worldOpacity }}
        />
      </div>
    </section>
  );
}
