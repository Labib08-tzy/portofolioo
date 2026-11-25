import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EXPERIENCE_ITEMS } from "../data/experience";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { SectionHeading } from "./ui/SectionHeading";

gsap.registerPlugin(ScrollTrigger);

export function Experience() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const lineRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = sectionRef.current;
    const line = lineRef.current;
    if (!el || reducedMotion) return;

    const ctx = gsap.context(() => {
      if (line) {
        gsap.fromTo(
          line,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top 70%",
              end: "bottom 75%",
              scrub: true,
            },
          }
        );
      }

      gsap.from(".exp-item", {
        x: -16,
        opacity: 0,
        duration: 0.6,
        stagger: 0.14,
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
      id="experience"
      className="border-b border-forest-600 bg-ink py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          index="05"
          eyebrow="Pengalaman"
          title="Perjalanan & Praktik"
          subtitle="Hanya mencantumkan pengalaman nyata yang benar-benar dijalani."
        />

        <div className="relative pl-8 sm:pl-12">
          {/* Vertical timeline line */}
          <div
            aria-hidden="true"
            className="absolute top-2 bottom-2 left-3 w-px bg-forest-600/35 sm:left-5"
          />
          <div
            ref={lineRef}
            aria-hidden="true"
            className="absolute top-2 bottom-2 left-3 w-px origin-top bg-brass sm:left-5"
          />

          <div className="space-y-8">
            {EXPERIENCE_ITEMS.map((item) => (
              <article key={item.id} className="exp-item relative">
                <span
                  aria-hidden="true"
                  className="absolute top-6 -left-[25px] h-3 w-3 rounded-full border-2 border-ink bg-brass sm:-left-[33px]"
                />
                <div className="brutal-card p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                    <span className="rounded-full border border-forest-600 bg-ink px-3 py-1 text-brass">
                      {item.period}
                    </span>
                    <span className="text-sage">{item.organization}</span>
                  </div>
                  <h3 className="mt-4 font-display text-xl font-bold text-sand sm:text-2xl">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-sage sm:text-base">
                    {item.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

