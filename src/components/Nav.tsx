import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useReducedMotion } from "../hooks/useReducedMotion";
import "../styles/blur-theme.css";

/*
 * Dimensi berlatar sand (terang) dimulai di Portofolio, berlanjut ke galeri foto, dan berakhir saat
 * layar terang keluar lewat huruf "o" di judul Kontak. Selama itu navbar memakai tema terang
 * dengan tombol aktif hijau.
 * WORLD_IN mengikuti PortfolioPortal (worldOpacity 0.5 di ~0.32).
 * CONTACT_LIGHT_END mengikuti ContactExit (dimensi tinggal separuh terlihat di ~0.18).
 */
const WORLD_IN = 0.32;
const CONTACT_LIGHT_END = 0.18;

export interface NavItem {
  label: string;
  href: string;
}

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "Contact", href: "#contact" },
];

interface NavProps {
  items?: NavItem[];
  /** props lama dipertahankan agar App.tsx tidak error; tidak dipakai lagi */
  brand?: string;
  cvUrl?: string;
}

export function Nav({ items = DEFAULT_NAV_ITEMS }: NavProps) {
  const [hidden, setHidden] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [light, setLight] = useState(false);
  const [activeHref, setActiveHref] = useState<string>(items[0]?.href ?? "#home");
  const lastScrollY = useRef(0);
  const pinUntil = useRef(0);
  const reducedMotion = useReducedMotion();
  const { scrollY } = useScroll();

  // Sembunyi saat scroll turun, muncul saat scroll naik
  useMotionValueEvent(scrollY, "change", (latest) => {
    const delta = latest - lastScrollY.current;
    if (latest <= 80 || performance.now() < pinUntil.current) setHidden(false);
    else if (delta > 6) setHidden(true);
    else if (delta < -6) setHidden(false);
    lastScrollY.current = latest;
  });

  // Scroll-spy: item aktif = section terakhir yang sudah melewati garis 40% layar.
  useEffect(() => {
    let raf = 0;
    const compute = () => {
      raf = 0;
      const line = window.innerHeight * 0.4;
      let current = items[0]?.href ?? "#home";
      for (const item of items) {
        const el = document.getElementById(item.href.slice(1));
        if (el && el.getBoundingClientRect().top <= line) current = item.href;
      }
      const atBottom =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 4;
      if (atBottom && items.length) current = items[items.length - 1].href;
      setActiveHref(current);

      const portfolio = document.getElementById("portfolio");
      let inWorld = false;
      if (portfolio) {
        const rect = portfolio.getBoundingClientRect();
        const scrollable = rect.height - window.innerHeight;
        // hanya untuk versi animasi (section tinggi); versi reduced-motion tetap tema gelap
        if (scrollable > window.innerHeight * 2) {
          const p = -rect.top / scrollable;
          inWorld = p > WORLD_IN;
        }
      }
      const exit = document.getElementById("contact-exit");
      if (inWorld && exit) {
        const er = exit.getBoundingClientRect();
        const escrollable = er.height - window.innerHeight;
        if (escrollable > 0 && -er.top / escrollable > CONTACT_LIGHT_END) inWorld = false;
      }
      setLight(inWorld);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [items]);

  const visible = !hidden || focusWithin;

  return (
    <motion.header
      initial={false}
      animate={{ y: visible ? 0 : -90, opacity: visible ? 1 : 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
      onFocusCapture={() => setFocusWithin(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setFocusWithin(false);
        }
      }}
      className="pointer-events-none fixed inset-x-0 top-3 z-40 flex justify-center px-3 sm:top-4"
    >
      <nav
        aria-label="Navigasi utama"
        data-theme={light ? "light" : "dark"}
        className="nav-glass pointer-events-auto flex max-w-full items-center gap-0.5 rounded-full border p-1 backdrop-blur-xl sm:gap-1 sm:p-1.5"
      >
        {items.map((item) => {
          const isActive = activeHref === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              onClick={() => {
                pinUntil.current = performance.now() + 1800; // tetap tampil setelah lompat ke section
                setActiveHref(item.href);
              }}
              aria-current={isActive ? "page" : undefined}
              className="nav-link relative rounded-full px-3 py-1.5 text-[12px] font-medium tracking-wide sm:px-4 sm:py-2 sm:text-[13px]"
            >
              {isActive ? (
                <motion.span
                  layoutId="nav-active-pill"
                  aria-hidden="true"
                  className="nav-pill absolute inset-0 rounded-full"
                  transition={
                    reducedMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 420, damping: 34 }
                  }
                />
              ) : null}
              <span className="relative z-10">{item.label}</span>
            </a>
          );
        })}
      </nav>
    </motion.header>
  );
}
