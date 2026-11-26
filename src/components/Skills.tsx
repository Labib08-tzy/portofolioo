import type { CSSProperties } from "react";
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
import { getBrandColor } from "../data/brandColors";
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

        <div className="grid gap-6 md:grid-cols-2">
          {SKILL_GROUPS.map((group, groupIdx) => {
            const visibleItems = group.items.filter(
              (item) => !isTodoItem(item)
            );
            if (visibleItems.length === 0) return null;

            return (
              <motion.div
                key={group.category}
                initial={reducedMotion ? false : { y: 14 }}
                whileInView={{ y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : {
                        duration: 0.4,
                        delay: groupIdx * 0.06,
                        ease: "easeOut",
                      }
                }
                className="brutal-card p-6 sm:p-8"
              >
                <div className="flex items-center justify-between border-b border-forest-600 pb-3 font-mono text-xs uppercase tracking-[0.2em]">
                  <h3 className="text-brass">{group.category}</h3>
                  <span className="text-sage">
                    {String(visibleItems.length).padStart(2, "0")}
                  </span>
                </div>

                <ul
                  className="mt-6 flex flex-wrap gap-5 sm:gap-6"
                  aria-label={group.category}
                >
                  {visibleItems.map((item, idx) => {
                    const icon = SKILL_ICON_MAP[item];
                    const brandColor = getBrandColor(item);
                    const style = {
                      "--brand-color": brandColor,
                    } as CSSProperties;

                    return (
                      <motion.li
                        key={item}
                        initial={reducedMotion ? false : { y: 10 }}
                        whileInView={{ y: 0 }}
                        viewport={{ once: true, amount: 0.15 }}
                        transition={
                          reducedMotion
                            ? { duration: 0 }
                            : {
                                duration: 0.3,
                                delay: Math.min(idx * 0.04, 0.2),
                                ease: "easeOut",
                              }
                        }
                      >
                        <div
                          tabIndex={0}
                          style={style}
                          className="skill-circle-trigger group flex w-20 flex-col items-center gap-2.5 rounded-xl p-1 text-center focus-visible:outline-2 focus-visible:outline-brass focus-visible:outline-offset-3 sm:w-22"
                        >
                          <div className="skill-circle flex h-16 w-16 items-center justify-center rounded-full bg-ink sm:h-[72px] sm:w-[72px]">
                            {icon ? (
                              <svg
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                                style={{ color: brandColor }}
                                className="skill-circle-icon h-7 w-7 fill-current transition-transform duration-200 ease-out sm:h-8 sm:w-8"
                              >
                                <path d={icon.path} />
                              </svg>
                            ) : (
                              <span
                                aria-hidden="true"
                                style={{ color: brandColor }}
                                className="skill-circle-icon font-mono text-sm font-bold transition-transform duration-200 ease-out"
                              >
                                {getInitials(item)}
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-[11px] leading-tight text-sand">
                            {item}
                          </span>
                        </div>
                      </motion.li>
                    );
                  })}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
