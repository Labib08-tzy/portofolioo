import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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

gsap.registerPlugin(ScrollTrigger);

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

export function Skills() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || reducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.from(".skill-tile", {
        y: 20,
        opacity: 0,
        duration: 0.55,
        stagger: 0.05,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          once: true,
        },
      });
    }, el);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="border-b border-forest-600 bg-ink py-20 sm:py-28"
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
            const visibleItems = group.items.filter((item) => !isTodoItem(item));
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
                  {visibleItems.map((item) => {
                    const icon = SKILL_ICON_MAP[item];
                    return (
                      <li
                        key={item}
                        tabIndex={0}
                        className="skill-tile group flex aspect-square flex-col items-center justify-center gap-3 border border-forest-600 bg-forest-900 p-4 text-center shadow-[4px_4px_0_0_var(--c-forest-600)] transition-all duration-200 hover:-translate-y-1 hover:border-brass focus-visible:-translate-y-1 focus-visible:border-brass focus-visible:outline-2 focus-visible:outline-brass focus-visible:outline-offset-3"
                      >
                        {icon ? (
                          <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                            className="h-10 w-10 fill-current text-sage transition-colors duration-200 group-hover:text-brass group-focus-visible:text-brass sm:h-11 sm:w-11"
                          >
                            <path d={icon.path} />
                          </svg>
                        ) : null}
                        <span className="font-mono text-xs text-sand">
                          {item}
                        </span>
                      </li>
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
