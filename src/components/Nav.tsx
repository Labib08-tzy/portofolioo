import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { PillButton } from "./ui/PillButton";
import { useReducedMotion } from "../hooks/useReducedMotion";

export interface NavItem {
  label: string;
  href: string;
}

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Achievements", href: "#achievements" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];

interface NavProps {
  brand?: string;
  cvUrl?: string;
  items?: NavItem[];
}

export function Nav({
  brand = "LABIB",
  cvUrl = "/cv/cv-labib.pdf",
  items = DEFAULT_NAV_ITEMS,
}: NavProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [activeHref, setActiveHref] = useState<string>("#home");
  const lastScrollY = useRef(0);
  const reducedMotion = useReducedMotion();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = lastScrollY.current;
    const delta = latest - prev;
    setScrolled(latest > 24);

    if (latest <= 80) {
      setHidden(false);
    } else if (delta > 6) {
      setHidden(true);
    } else if (delta < -6) {
      setHidden(false);
    }

    lastScrollY.current = latest;
  });

  useEffect(() => {
    const ids = items.map((item) => item.href.replace(/^#/, ""));
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0 || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveHref(`#${entry.target.id}`);
          }
        }
      },
      {
        rootMargin: "-35% 0px -55% 0px",
        threshold: 0,
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  // Close mobile menu on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  // Lock body scroll when mobile menu is open without layout shift
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleMobileNavClick = () => {
    document.body.style.overflow = "";
    setMenuOpen(false);
  };

  const isNavVisible = !hidden || focusWithin || menuOpen;

  return (
    <motion.header
      initial={false}
      animate={{ y: isNavVisible ? "0%" : "-100%" }}
      transition={{
        duration: reducedMotion ? 0 : 0.24,
        ease: [0.22, 1, 0.36, 1],
      }}
      onFocusCapture={() => setFocusWithin(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setFocusWithin(false);
        }
      }}
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-200 ${
        scrolled || menuOpen
          ? "border-b border-forest-600 bg-ink/90 backdrop-blur-md"
          : "border-b border-forest-600/35 bg-ink/35 backdrop-blur-xs"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 md:py-3 lg:px-8">
        {/* Brand */}
        <a
          href="#home"
          className="inline-flex min-h-[44px] items-center gap-2 font-ui text-base font-bold tracking-[0.04em] text-sand md:min-h-0 md:text-lg"
        >
          <span
            className="inline-block h-2.5 w-2.5 rounded-full bg-brass"
            aria-hidden="true"
          />
          <span>{brand}</span>
        </a>

        {/* Desktop single-row pill nav (md and up) */}
        <nav
          aria-label="Navigasi utama"
          className="hidden items-center gap-1 md:flex"
        >
          {items.map((item) => {
            const isActive = activeHref === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`rounded-full px-3 py-1.5 font-ui text-xs font-medium tracking-[0.02em] transition-colors ${
                  isActive
                    ? "border border-brass/70 bg-forest-900 text-brass"
                    : "text-sage hover:bg-forest-900/70 hover:text-sand"
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Desktop Unduh CV + Mobile Hamburger */}
        <div className="flex items-center">
          <PillButton
            href={cvUrl}
            download="cv-labib.pdf"
            variant="outline"
            size="sm"
            className="hidden md:inline-flex"
          >
            <span>Unduh CV</span>
          </PillButton>

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-panel"
            aria-label={
              menuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"
            }
            className="inline-flex h-11 w-11 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-full border border-forest-600 bg-forest-900 text-sand transition-colors hover:border-brass focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass md:hidden"
            style={{ boxShadow: "2px 2px 0 0 var(--c-forest-600)" }}
          >
            <motion.span
              aria-hidden="true"
              animate={
                menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }
              }
              transition={{ duration: reducedMotion ? 0 : 0.2 }}
              className="block h-0.5 w-5 bg-sand"
            />
            <motion.span
              aria-hidden="true"
              animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: reducedMotion ? 0 : 0.15 }}
              className="block h-0.5 w-5 bg-brass"
            />
            <motion.span
              aria-hidden="true"
              animate={
                menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }
              }
              transition={{ duration: reducedMotion ? 0 : 0.2 }}
              className="block h-0.5 w-5 bg-sand"
            />
          </button>
        </div>
      </div>

      {/* Mobile slide-down menu panel (< md) */}
      <AnimatePresence>
        {menuOpen ? (
          <>
            {/* Backdrop to close on outside click */}
            <motion.div
              key="mobile-nav-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.2 }}
              onClick={() => setMenuOpen(false)}
              aria-hidden="true"
              className="fixed inset-x-0 top-[65px] bottom-0 z-40 bg-ink/80 backdrop-blur-xs md:hidden"
            />

            <motion.div
              key="mobile-nav-panel"
              id="mobile-nav-panel"
              role="dialog"
              aria-modal="true"
              aria-label="Menu navigasi mobile"
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
              animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
              transition={{
                duration: reducedMotion ? 0.12 : 0.25,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="brutal-card-lg fixed inset-x-4 top-[74px] z-50 max-h-[calc(100svh-90px)] overflow-y-auto p-4 md:hidden"
            >
              <nav
                aria-label="Navigasi mobile"
                className="flex flex-col gap-1.5"
              >
                {items.map((item) => {
                  const isActive = activeHref === item.href;
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={handleMobileNavClick}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex min-h-[44px] items-center justify-between border px-3.5 py-2 font-ui text-sm font-semibold tracking-[0.04em] transition-colors focus-visible:outline-2 focus-visible:outline-brass ${
                        isActive
                          ? "border-brass bg-ink text-brass"
                          : "border-forest-600/60 bg-ink/50 text-sand hover:border-brass/70 hover:text-brass"
                      }`}
                    >
                      <span>{item.label}</span>
                      {isActive ? (
                        <span
                          aria-hidden="true"
                          className="h-2 w-2 rounded-full bg-brass"
                        />
                      ) : null}
                    </a>
                  );
                })}
              </nav>

              <div className="mt-4 border-t border-forest-600 pt-4">
                <PillButton
                  href={cvUrl}
                  download="cv-labib.pdf"
                  variant="primary"
                  className="min-h-[44px] w-full"
                  onClick={handleMobileNavClick}
                >
                  Unduh CV
                </PillButton>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}
