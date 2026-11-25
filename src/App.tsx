import { Nav } from "./components/Nav";

export function App() {
  return (
    <div className="min-h-screen bg-ink text-sand">
      <a href="#main-content" className="skip-link">
        Lewati ke konten utama
      </a>

      <Nav />

      <main id="main-content" tabIndex={-1}>
        <section
          id="home"
          className="mx-auto flex min-h-[70vh] max-w-7xl flex-col justify-center px-4 py-20 sm:px-6 lg:px-8"
        >
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-sage">
            Portofolio
          </p>
          <h1 className="mt-4 font-display text-5xl font-bold tracking-tight text-sand sm:text-7xl">
            LABIB
          </h1>
          <p className="mt-4 font-mono text-sm text-brass">
            Creative Developer / Full-Stack Developer
          </p>
        </section>
      </main>
    </div>
  );
}

export default App;
