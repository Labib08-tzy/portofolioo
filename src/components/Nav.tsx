import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

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

  return (
    <header className="sticky top-0 z-40 border-b border-forest-600 bg-ink/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <a
          href="#home"
          className="inline-flex items-center gap-2 font-display text-lg font-bold tracking-tight text-sand"
        >
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-brass" aria-hidden="true" />
          <span>{brand}</span>
        </a>

        <nav aria-label="Navigasi utama" className="hidden items-center gap-1 lg:flex">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-1.5 font-mono text-xs text-sage transition-colors hover:bg-forest-900 hover:text-sand"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <PillButton
            href={cvUrl}
            download="cv-labib.pdf"
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex"
          >
            <span>Unduh CV</span>
          </PillButton>

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-overlay"
            aria-label={menuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
            className="inline-flex items-center justify-center rounded-full border border-forest-600 bg-forest-900 px-3.5 py-1.5 font-mono text-xs text-sand lg:hidden"
          >
            {menuOpen ? "TUTUP" : "MENU"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            id="mobile-nav-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Menu navigasi mobile"
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
            className="fixed inset-x-0 top-[57px] bottom-0 z-50 flex flex-col justify-between border-t border-forest-600 bg-ink p-6 lg:hidden"
          >
            <nav aria-label="Navigasi mobile" className="flex flex-col gap-3">
              {items.map((item, idx) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between border-b border-forest-600/50 py-3 font-display text-2xl font-bold text-sand transition-colors hover:text-brass"
                >
                  <span>{item.label}</span>
                  <span className="font-mono text-xs text-sage">
                    0{idx + 1}
                  </span>
                </a>
              ))}
            </nav>

            <div className="pt-6">
              <PillButton
                href={cvUrl}
                download="cv-labib.pdf"
                variant="primary"
                className="w-full"
                onClick={() => setMenuOpen(false)}
              >
                Unduh CV
              </PillButton>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

