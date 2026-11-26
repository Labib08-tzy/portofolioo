import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SITE_INFO } from "../data/site";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { SectionHeading } from "./ui/SectionHeading";

gsap.registerPlugin(ScrollTrigger);

export function About() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const photoContainerRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();
  const isTouch = useMediaQuery("(hover: none)");

  const [revealed, setRevealed] = useState(false);
  const [primaryError, setPrimaryError] = useState(false);
  const [hoverError, setHoverError] = useState(false);

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

  // Preload hover photo when About enters viewport
  useEffect(() => {
    const target = photoContainerRef.current;
    if (!target || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const preload = new Image();
          preload.src = SITE_INFO.aboutHoverPhoto;
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const handleToggle = () => {
    if (isTouch) {
      setRevealed((prev) => !prev);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="about"
      className="scroll-mt-20 border-b border-forest-600 bg-ink py-20 sm:py-28"
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
                  <div
                    key={fact.label}
                    className="border-l border-forest-600 pl-3"
                  >
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

          <div ref={photoContainerRef} className="about-reveal lg:col-span-5">
            <button
              type="button"
              aria-pressed={revealed}
              aria-label={`Foto ${SITE_INFO.fullName}. ${
                isTouch ? "Ketuk" : "Arahkan kursor atau fokus"
              } untuk mengganti tampilan foto.`}
              onClick={handleToggle}
              onMouseEnter={isTouch ? undefined : () => setRevealed(true)}
              onMouseLeave={isTouch ? undefined : () => setRevealed(false)}
              onFocus={() => setRevealed(true)}
              onBlur={() => setRevealed(false)}
              className="group relative mx-auto block aspect-[4/5] w-full max-w-md overflow-hidden border border-forest-600 bg-forest-900 text-left shadow-[8px_8px_0_0_var(--c-forest-600)] transition-colors duration-200 hover:border-brass focus-visible:border-brass focus-visible:outline-2 focus-visible:outline-brass focus-visible:outline-offset-4"
            >
              {/* Primary Photo */}
              {!primaryError ? (
                <img
                  src={SITE_INFO.aboutPhoto}
                  alt={SITE_INFO.fullName}
                  loading="lazy"
                  onError={() => setPrimaryError(true)}
                  className="h-full w-full object-cover object-center"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-forest-900 via-ink to-forest-900 p-6 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border border-forest-600 bg-ink font-display text-2xl font-bold text-brass">
                    ML
                  </div>
                  <p className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-sage">
                    Foto belum tersedia
                  </p>
                </div>
              )}

              {/* Hover / Tap Reveal Photo */}
              {!hoverError ? (
                <motion.img
                  src={SITE_INFO.aboutHoverPhoto}
                  alt={SITE_INFO.aboutHoverAlt}
                  loading="lazy"
                  onError={() => setHoverError(true)}
                  initial={false}
                  animate={
                    reducedMotion
                      ? { opacity: revealed ? 1 : 0 }
                      : {
                          opacity: revealed ? 1 : 0,
                          clipPath: revealed
                            ? "circle(78% at 50% 50%)"
                            : "circle(0% at 50% 50%)",
                          scale: revealed ? 1.03 : 1,
                        }
                  }
                  transition={
                    reducedMotion
                      ? { duration: 0.15 }
                      : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
                  }
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
                />
              ) : null}

              {/* Corner Mono Labels */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-3 left-3 rounded-full border border-forest-600 bg-ink/85 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-sand backdrop-blur-xs"
              >
                PORTRAIT // 01
              </span>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-3 bottom-3 rounded-full border border-forest-600 bg-ink/85 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-brass backdrop-blur-xs"
              >
                HOVER / TAP
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
