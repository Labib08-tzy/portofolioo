import { useEffect, useRef, useState, type FormEvent } from "react";
import { siGithub, siInstagram, siTelegram } from "simple-icons";
import { CONTACT_INFO } from "../../data/site";
import "../../styles/chibi-contact.css";

const LINKEDIN_PATH =
  "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z";

interface Social {
  label: string;
  href: string;
  path: string;
  brand: string;
}

const SOCIALS: Social[] = [
  { label: "Instagram", href: CONTACT_INFO.instagram, path: siInstagram.path, brand: "#E4405F" },
  { label: "GitHub", href: CONTACT_INFO.github, path: siGithub.path, brand: "#F0E6D2" },
  { label: "LinkedIn", href: CONTACT_INFO.linkedin, path: LINKEDIN_PATH, brand: "#4A9BE8" },
  { label: "Telegram", href: CONTACT_INFO.telegram, path: siTelegram.path, brand: "#2AABEE" },
];

const isTodo = (v: string) => v.trim().toUpperCase().startsWith("TODO");

export function ChibiContact() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [paused, setPaused] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  // Hentikan animasi sprite saat di luar layar (hemat baterai di HP)
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([e]) => setPaused(!e.isIntersecting),
      { threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const emailReady = !isTodo(CONTACT_INFO.email);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!emailReady || !message.trim()) return;
    const subject = encodeURIComponent(`Pesan dari portfolio${name ? ` - ${name}` : ""}`);
    const body = encodeURIComponent(`${message.trim()}${name ? `\n\n— ${name}` : ""}`);
    window.location.href = `mailto:${CONTACT_INFO.email}?subject=${subject}&body=${body}`;
  };

  return (
    <div ref={rootRef} className="chibi-contact" data-paused={paused}>
      <div
        className="chibi-sprite"
        role="img"
        aria-label="Dua karakter chibi, Abi dan Itachi, duduk di atas kotak kontak sambil mengayunkan kaki"
      />

      <div className="chibi-box">
        <span className="chibi-aura" aria-hidden="true" />

        <div className="chibi-cols">
          {/* Kiri: sosial media */}
          <div>
            <p className="chibi-label">Social Media</p>
            <div className="chibi-socials">
              {SOCIALS.map((s) => {
                const ready = !isTodo(s.href);
                const icon = (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d={s.path} />
                  </svg>
                );
                return ready ? (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.label}
                    title={s.label}
                    className="chibi-social"
                    style={{ ["--brand" as string]: s.brand }}
                  >
                    {icon}
                  </a>
                ) : (
                  <span
                    key={s.label}
                    role="img"
                    aria-label={`${s.label} (belum diisi)`}
                    title={`${s.label}: isi link di data/site.ts`}
                    className="chibi-social is-empty"
                  >
                    {icon}
                  </span>
                );
              })}
            </div>
          </div>

          <span className="chibi-divider" aria-hidden="true" />

          {/* Kanan: pesan (langsung tampil) */}
          <div>
            <h3 className="chibi-title">Send Me a Message</h3>
            <p className="chibi-desc">Have something in mind? Let&apos;s talk!</p>
            <form className="chibi-form" onSubmit={onSubmit}>
              <textarea
                className="chibi-field"
                rows={2}
                placeholder="Tulis pesanmu..."
                aria-label="Pesan"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
              <div className="chibi-row">
                <input
                  className="chibi-field"
                  type="text"
                  placeholder="Nama (opsional)"
                  aria-label="Nama"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
                <button type="submit" className="chibi-msg-btn" disabled={!emailReady}>
                  <span>Leave a Message</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </button>
              </div>
              {!emailReady ? (
                <span className="chibi-note">Email belum diisi di data/site.ts</span>
              ) : null}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
