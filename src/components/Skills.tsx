import { motion } from "framer-motion";
import {
  siFlutter,
  siFramer,
  siGit,
  siGsap,
  siLaravel,
  siMysql,
  siPhp,
  siReact,
  siTailwindcss,
  siTypescript,
  siVercel,
  type SimpleIcon,
} from "simple-icons";
import { SKILL_GROUPS } from "../data/skills";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { SectionHeading } from "./ui/SectionHeading";

const SKILL_ICON_MAP: Record<string, SimpleIcon> = {
  React: siReact,
  TypeScript: siTypescript,
  "Tailwind CSS": siTailwindcss,
  GSAP: siGsap,
  "Framer Motion": siFramer,
  PHP: siPhp,
  Laravel: siLaravel,
  MySQL: siMysql,
  Flutter: siFlutter,
  Git: siGit,
  Vercel: siVercel,
};

function isTodoItem(name: string): boolean {
  return name.trim().toUpperCase().startsWith("TODO");
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function Skills() {
  const reducedMotion = useReducedMotion();

  return (
    <section
      id="skills"
      className="scroll-mt-20 border-b border-forest-600 bg-ink py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          index="02"
          eyebrow="Keahlian"
          title="Teknologi & Perkakas"
          subtitle="Teknologi yang digunakan dalam pengembangan web, mobile, dan alur kerja."
        />

        <div className="space-y-10">
          {SKILL_GROUPS.map((group) => {
            const visibleItems = group.items.filter(
              (item) => !isTodoItem(item)
            );
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.category}>
                <h3 className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-brass">
                  {group.category}
                </h3>

                <ul
                  className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
                  aria-label={group.category}
                >
                  {visibleItems.map((item, idx) => {
                    const icon = SKILL_ICON_MAP[item];
                    return (
                      <motion.li
                        key={item}
                        tabIndex={0}
                        initial={
                          reducedMotion ? false : { opacity: 0, y: 14 }
                        }
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.15 }}
                        transition={
                          reducedMotion
                            ? { duration: 0 }
                            : {
                                duration: 0.35,
                                delay: Math.min(idx * 0.04, 0.2),
                                ease: "easeOut",
                              }
                        }
                        className="group flex aspect-square flex-col items-center justify-center gap-3 border border-forest-600 bg-forest-900 p-4 text-center shadow-[4px_4px_0_0_var(--c-forest-600)] transition-all duration-200 hover:-translate-y-1 hover:border-brass focus-visible:-translate-y-1 focus-visible:border-brass focus-visible:outline-2 focus-visible:outline-brass focus-visible:outline-offset-3"
                      >
                        {icon ? (
                          <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                            className="h-10 w-10 fill-current text-sage transition-colors duration-200 group-hover:text-brass group-focus-visible:text-brass sm:h-11 sm:w-11"
                          >
                            <path d={icon.path} />
                          </svg>
                        ) : (
                          <span
                            aria-hidden="true"
                            className="flex h-10 w-10 items-center justify-center border border-forest-600 bg-ink font-mono text-sm font-bold text-sage transition-colors duration-200 group-hover:border-brass group-hover:text-brass group-focus-visible:border-brass group-focus-visible:text-brass sm:h-11 sm:w-11"
                          >
                            {getInitials(item)}
                          </span>
                        )}
                        <span className="font-mono text-xs text-sand">
                          {item}
                        </span>
                      </motion.li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
