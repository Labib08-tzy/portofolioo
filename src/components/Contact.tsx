import { SITE_INFO } from "../data/site";

/** Footer ringkas di bagian bawah halaman. */
export function Contact() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-forest-600/50 bg-ink py-6">
      <div className="mx-auto max-w-7xl px-4 text-center font-ui text-xs text-sage sm:px-6 lg:px-8">
        <p>© {year} {SITE_INFO.fullName}</p>
      </div>
    </footer>
  );
}
