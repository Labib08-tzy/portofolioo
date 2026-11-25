import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ACHIEVEMENTS } from "../data/achievements";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { PillButton } from "./ui/PillButton";
import { SectionHeading } from "./ui/SectionHeading";

gsap.registerPlugin(ScrollTrigger);

export function Achievements() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || reducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.from(".achievement-card", {
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
      id="achievements"
      className="border-b border-forest-600 bg-ink py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          index="04"
          eyebrow="Pencapaian"
          title="Kompetisi & Sertifikat"
          subtitle="Catatan pencapaian yang dapat diverifikasi dan mudah ditambah lewat data."
        />

        <div className="grid gap-6 md:grid-cols-3">
          {ACHIEVEMENTS.map((item) => (
            <article
              key={item.id}
              className="achievement-card brutal-card flex flex-col justify-between p-6"
            >
              <div>
                <div className="flex items-center justify-between gap-2 font-mono text-xs">
                  <span className="rounded-full border border-forest-600 bg-ink px-3 py-1 uppercase text-brass">
                    {item.kind === "competition" ? "Kompetisi" : "Sertifikat"}
                  </span>
                  <span className="text-sage">{item.year}</span>
                </div>

                <h3 className="mt-4 font-display text-xl font-bold text-sand">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-sage">{item.issuer}</p>
              </div>

              <div className="mt-6 border-t border-forest-600/60 pt-4">
                {item.link ? (
                  <PillButton
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    variant="outline"
                    size="sm"
                  >
                    Verifikasi
                  </PillButton>
                ) : (
                  <span className="font-mono text-xs text-sage">
                    Tautan verifikasi: TODO
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
