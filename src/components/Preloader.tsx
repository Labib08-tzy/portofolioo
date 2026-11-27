import { AnimatePresence, motion } from "framer-motion";
import type { PreloadStatus } from "../hooks/useFramePreloader";
import { PillButton } from "./ui/PillButton";

interface PreloaderProps {
  progress: number;
  status: PreloadStatus;
  failedCount: number;
  reducedMotion: boolean;
  onDismissError: () => void;
}

export function Preloader({
  progress,
  status,
  failedCount,
  reducedMotion,
  onDismissError,
}: PreloaderProps) {
  const isVisible = status !== "ready";

  return (
    <AnimatePresence>
      {isVisible ? (
        <motion.div
          key="preloader"
          role="status"
          aria-live="polite"
          aria-label="Memuat aset portofolio"
          initial={{ opacity: 1 }}
          exit={
            reducedMotion
              ? { opacity: 0, transition: { duration: 0.15 } }
              : {
                  opacity: 0,
                  y: "-4%",
                  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                }
          }
          className="fixed inset-0 z-50 flex flex-col justify-between bg-ink p-6 sm:p-10"
        >
          <div className="flex items-center justify-between border-b border-forest-600 pb-4 font-mono text-xs uppercase tracking-[0.2em] text-sage">
            <span>BIANEKST // PORTFOLIO_INIT</span>
            <span>{status === "error" ? "ASSET_WARNING" : "LOADING_FRAMES"}</span>
          </div>

          <div className="mx-auto flex w-full max-w-2xl flex-col items-start gap-6">
            {status === "error" ? (
              <div className="brutal-card w-full p-6 sm:p-8">
                <p className="font-mono text-xs uppercase tracking-widest text-brass">
                  Gagal Memuat Sebagian Aset
                </p>
                <h2 className="mt-2 font-display text-2xl font-bold text-sand">
                  Animasi Eye Scan tidak dapat dimuat ({failedCount} frame gagal).
                </h2>
                <p className="mt-3 text-sm text-sage">
                  Seluruh informasi portofolio tetap dapat diakses secara normal tanpa
                  animasi urutan gambar.
                </p>
                <div className="mt-6">
                  <PillButton onClick={onDismissError} variant="primary">
                    Lanjutkan ke Portofolio
                  </PillButton>
                </div>
              </div>
            ) : (
              <>
                <div className="flex w-full items-baseline justify-between">
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-sage">
                    Memuat sequence visual
                  </span>
                  <span className="font-mono text-5xl font-bold tabular-nums text-sand sm:text-7xl">
                    {String(progress).padStart(2, "0")}%
                  </span>
                </div>

                <div
                  className="h-3 w-full overflow-hidden border border-forest-600 bg-forest-900"
                  aria-hidden="true"
                >
                  <div
                    className="h-full bg-brass transition-[width] duration-150 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-forest-600 pt-4 font-mono text-xs text-sage">
            <span>MOHAMMAD LABIB NAYLA FAHMI</span>
            <span>SMK UMAR FATAH REMBANG</span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

