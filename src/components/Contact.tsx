import { CONTACT_INFO, SITE_INFO, TECH_CREDITS } from "../data/site";
import { PillButton } from "./ui/PillButton";
import { SectionHeading } from "./ui/SectionHeading";

function isTodo(value: string): boolean {
  return value.trim().toUpperCase().startsWith("TODO");
}

export function Contact() {
  const year = new Date().getFullYear();

  const channels = [
    {
      label: "Email",
      value: CONTACT_INFO.email,
      href: isTodo(CONTACT_INFO.email) ? undefined : `mailto:${CONTACT_INFO.email}`,
    },
    {
      label: "GitHub",
      value: CONTACT_INFO.github,
      href: isTodo(CONTACT_INFO.github) ? undefined : CONTACT_INFO.github,
    },
    {
      label: "LinkedIn",
      value: CONTACT_INFO.linkedin,
      href: isTodo(CONTACT_INFO.linkedin) ? undefined : CONTACT_INFO.linkedin,
    },
  ];

  return (
    <>
      <section
        id="contact"
        className="border-b border-forest-600 bg-ink py-[clamp(48px,7vw,112px)]"
      >
        <div className="mx-auto max-w-7xl px-[clamp(14px,3.2vw,32px)]">
          <SectionHeading
            index="06"
            eyebrow="Kontak"
            title="Mari Terhubung"
            subtitle="Terbuka untuk diskusi magang, kerja sama project web, atau peluang belajar."
          />

          <div className="grid grid-cols-3 gap-[clamp(8px,2vw,24px)]">
            {channels.map((ch) => (
              <div
                key={ch.label}
                className="brutal-card flex min-w-0 flex-col justify-between p-[clamp(10px,2.2vw,24px)]"
              >
                <div>
                  <p className="font-ui text-[clamp(10px,1.6vw,12px)] font-semibold uppercase tracking-[0.07em] text-brass">
                    {ch.label}
                  </p>
                  <p className="mt-2 break-all text-[clamp(11px,1.8vw,14px)] text-sand">
                    {ch.value}
                  </p>
                </div>

                <div className="mt-[clamp(12px,2.5vw,24px)]">
                  {ch.href ? (
                    <PillButton
                      href={ch.href}
                      target={ch.label === "Email" ? undefined : "_blank"}
                      rel={ch.label === "Email" ? undefined : "noreferrer"}
                      variant="primary"
                      size="sm"
                      className="!min-h-[38px] !px-[clamp(8px,1.8vw,16px)] !text-[clamp(10px,1.6vw,12px)] sm:!min-h-[44px]"
                    >
                      Buka {ch.label}
                    </PillButton>
                  ) : (
                    <span className="inline-flex rounded-full border border-forest-600 bg-ink px-[clamp(6px,1.4vw,12px)] py-1 font-ui text-[clamp(9px,1.5vw,12px)] font-medium text-sage">
                      Belum diisi (TODO)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-[clamp(20px,3.5vw,40px)] flex flex-wrap items-center justify-between gap-4 border border-forest-600 bg-forest-900 p-[clamp(14px,2.5vw,24px)]">
            <div>
              <p className="font-display text-lg font-bold text-sand">
                Butuh ringkasan dalam format PDF?
              </p>
              <p className="mt-1 text-sm text-sage">
                Unduh CV {SITE_INFO.fullName} (placeholder tersedia hingga CV final
                diunggah).
              </p>
            </div>
            <PillButton
              href={SITE_INFO.cvUrl}
              download="cv-labib.pdf"
              variant="primary"
            >
              Unduh CV
            </PillButton>
          </div>
        </div>
      </section>

      <footer className="bg-ink py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 font-mono text-xs text-sage sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <p>
            © {year} {SITE_INFO.fullName} ({SITE_INFO.brand}).
          </p>
          <p>Dibangun dengan {TECH_CREDITS.join(" · ")}</p>
        </div>
      </footer>
    </>
  );
}

