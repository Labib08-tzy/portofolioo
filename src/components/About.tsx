import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SITE_INFO } from "../data/site";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { SectionHeading } from "./ui/SectionHeading";

gsap.registerPlugin(ScrollTrigger);

export function About() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || reducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.from(".about-reveal", {
        y: 24,
        opacity: 0,
        duration: 0.65,
        stagger: 0.1,
        ease: "power2.out",
        once: true,
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
      id="about"
      className="border-b border-forest-600 bg-ink py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          index="01"
          eyebrow="Tentang"
          title="Mengenal Lebih Dekat"
          subtitle="Latar belakang singkat, fokus belajar di RPL, dan arah pengembangan."
        />

        <div className="grid gap-10 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-7">
            {SITE_INFO.aboutParagraphs.map((paragraph, index) => (
              <p
                key={index}
                className="about-reveal text-base leading-relaxed text-sand/90 sm:text-lg"
              >
                {paragraph}
              </p>
            ))}

            <div className="about-reveal brutal-card mt-8 p-5 sm:p-6">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-brass">
                Fakta Ringkas
              </p>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                {SITE_INFO.aboutFacts.map((fact) => (
                  <div key={fact.label} className="border-l border-forest-600 pl-3">
                    <dt className="font-mono text-xs uppercase tracking-wider text-sage">
                      {fact.label}
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-sand">
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div className="about-reveal lg:col-span-5">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden">
              {/* Subtle green neon ambient glow behind portrait */}
              <div
                aria-hidden="true"
                className="ambient-glow-emerald pointer-events-none absolute inset-4 scale-105 blur-3xl"
              />

              {/* Seamless multi-directional CSS masked portrait */}
              {SITE_INFO.profilePhoto ? (
                <img
                  src={SITE_INFO.profilePhoto}
                  alt={`Foto profil ${SITE_INFO.fullName}`}
                  loading="lazy"
                  className="about-photo-mask relative z-10 h-full w-full object-cover object-center"
                />
              ) : (
                <div className="about-photo-mask relative z-10 flex h-full w-full flex-col items-center justify-center p-6 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border border-forest-600/80 bg-ink/80 font-display text-2xl font-bold text-brass shadow-[0_0_28px_var(--c-glow-emerald)]">
                    ML
                  </div>
                  <p className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-sage">
                    Foto Profil (Opsional)
                  </p>
                  <p className="mt-2 max-w-xs text-sm text-sage">
                    TODO: Tambahkan foto formal atau potret diri jika ingin ditampilkan.
                  </p>
                </div>
              )}

              {/* Wide 4-side soft gradient fades into --c-ink */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 z-20 h-28 bg-gradient-to-b from-ink via-ink/70 to-transparent"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-32 bg-gradient-to-t from-ink via-ink/75 to-transparent"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-0 z-20 w-24 bg-gradient-to-r from-ink via-ink/70 to-transparent"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 right-0 z-20 w-24 bg-gradient-to-l from-ink via-ink/70 to-transparent"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
