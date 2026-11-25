import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SKILL_GROUPS } from "../data/skills";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { SectionHeading } from "./ui/SectionHeading";

gsap.registerPlugin(ScrollTrigger);

export function Skills() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || reducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.from(".skill-card", {
        y: 22,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
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
          subtitle="Dikelompokkan berdasarkan domain pengembangan tanpa bar persentase."
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SKILL_GROUPS.map((group) => (
            <div key={group.category} className="skill-card brutal-card p-6">
              <h3 className="border-b border-forest-600 pb-3 font-mono text-xs uppercase tracking-[0.2em] text-brass">
                {group.category}
              </h3>
              <ul className="mt-4 flex flex-wrap gap-2" aria-label={group.category}>
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-forest-600 bg-ink px-3.5 py-1.5 font-mono text-xs text-sand transition-colors hover:border-brass"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

