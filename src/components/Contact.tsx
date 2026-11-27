import { SITE_INFO, TECH_CREDITS } from "../data/site";

/** Bagian kontak kini menyatu dengan judul di ContactExit; di sini tinggal footer. */
export function Contact() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-forest-600/60 bg-ink py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 font-mono text-xs text-sage sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <p>
          © {year} {SITE_INFO.fullName} ({SITE_INFO.brand}).
        </p>
        <p>Dibangun dengan {TECH_CREDITS.join(" · ")}</p>
      </div>
    </footer>
  );
}
