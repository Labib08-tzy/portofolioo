import { motion } from "framer-motion";
import type { FolderCategoryMeta } from "./portfolioData";

interface FolderCardProps {
  category: FolderCategoryMeta;
  isActive: boolean;
  reducedMotion: boolean;
  onSelect: () => void;
}

function formatCount(count: number): string {
  return String(count).padStart(2, "0");
}

export function FolderCard({
  category,
  isActive,
  reducedMotion,
  onSelect,
}: FolderCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      aria-pressed={isActive}
      aria-expanded={isActive}
      aria-controls="portfolio-content-panel"
      whileHover={
        reducedMotion
          ? undefined
          : {
              y: -5,
              scale: 1.025,
              transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
            }
      }
      whileTap={reducedMotion ? undefined : { scale: 0.99 }}
      animate={
        reducedMotion
          ? undefined
          : {
              y: isActive ? -4 : 0,
              transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
            }
      }
      className="group relative flex min-h-[clamp(112px,24vw,174px)] w-full cursor-pointer select-none flex-col justify-end text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
      style={{ perspective: "920px" }}
    >
      {/* Folder container */}
      <div className="relative h-[clamp(108px,23vw,170px)] w-full">
        {/* Top-left computer folder tab */}
        <div
          aria-hidden="true"
          className={[
            "absolute top-0 left-0 h-[clamp(18px,4vw,28px)] w-[45%] border border-b-0 transition-colors duration-300",
            isActive
              ? "border-brass bg-forest-900"
              : "border-forest-600 bg-ink group-hover:border-brass/70",
          ].join(" ")}
        >
          <span
            className={[
              "mt-[clamp(5px,1.2vw,8px)] ml-[clamp(6px,1.5vw,12px)] inline-block h-[clamp(4px,0.8vw,6px)] w-[clamp(14px,3vw,28px)] transition-colors duration-300",
              isActive
                ? "bg-brass"
                : "bg-forest-600 group-hover:bg-brass/80",
            ].join(" ")}
          />
        </div>

        {/* Back panel of the folder */}
        <div
          aria-hidden="true"
          className={[
            "absolute inset-x-0 top-[clamp(14px,3.2vw,20px)] bottom-0 border transition-colors duration-300",
            isActive
              ? "border-brass bg-ink"
              : "border-forest-600 bg-ink group-hover:border-brass/70",
          ].join(" ")}
          style={{
            boxShadow: isActive
              ? "var(--shadow-brutal-brass)"
              : "var(--shadow-brutal)",
          }}
        />

        {/* Inner document sheets that lift when active or hovered */}
        <motion.div
          aria-hidden="true"
          animate={
            reducedMotion
              ? undefined
              : {
                  y: isActive ? -11 : 0,
                  rotate: isActive ? -2 : 0,
                }
          }
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute top-[clamp(18px,4vw,28px)] right-[clamp(8px,2vw,20px)] left-[clamp(8px,2vw,20px)] h-[clamp(36px,8vw,64px)] border border-forest-600 bg-forest-900/90 transition-transform duration-300 group-hover:-translate-y-2"
        >
          <div className="mt-2 ml-2.5 h-1 w-10 bg-brass/50 sm:w-14" />
          <div className="mt-1.5 ml-2.5 h-1 w-14 bg-sage/25 sm:w-24" />
        </motion.div>

        <motion.div
          aria-hidden="true"
          animate={
            reducedMotion
              ? undefined
              : {
                  y: isActive ? -7 : 0,
                  rotate: isActive ? 1.5 : 0,
                }
          }
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute top-[clamp(22px,4.5vw,32px)] right-[clamp(6px,1.6vw,16px)] left-[clamp(6px,1.6vw,16px)] h-[clamp(36px,8vw,64px)] border border-forest-600 bg-forest-900 transition-transform duration-300 group-hover:-translate-y-1.5"
        >
          <div className="mt-2 ml-2.5 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-glow-emerald" />
            <span className="h-1 w-12 bg-sand/30 sm:w-16" />
          </div>
        </motion.div>

        {/* Front flap that tilts open in 3D */}
        <motion.div
          animate={
            reducedMotion
              ? undefined
              : {
                  rotateX: isActive ? -20 : 0,
                }
          }
          whileHover={
            reducedMotion || isActive
              ? undefined
              : {
                  rotateX: -9,
                }
          }
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          style={{
            transformOrigin: "bottom center",
            transformStyle: "preserve-3d",
            background: isActive
              ? "linear-gradient(155deg, rgba(31, 42, 31, 0.98) 0%, rgba(11, 15, 13, 0.96) 100%)"
              : "linear-gradient(155deg, rgba(31, 42, 31, 0.92) 0%, rgba(11, 15, 13, 0.94) 100%)",
            boxShadow: isActive
              ? "inset 0 1px 0 rgba(217, 199, 163, 0.2), var(--shadow-brutal-brass)"
              : "inset 0 1px 0 rgba(140, 169, 140, 0.16), var(--shadow-brutal)",
          }}
          className={[
            "absolute inset-x-0 top-[clamp(26px,5.6vw,40px)] bottom-0 flex flex-col justify-between border p-[clamp(8px,2vw,20px)] transition-colors duration-300",
            isActive
              ? "border-brass"
              : "border-forest-600 group-hover:border-brass/75",
          ].join(" ")}
        >
          {/* Top row: folder icon + dynamic count badge */}
          <div className="flex items-center justify-between gap-1">
            <span
              className={[
                "inline-flex h-[clamp(24px,4.5vw,32px)] w-[clamp(24px,4.5vw,32px)] shrink-0 items-center justify-center border transition-colors duration-300",
                isActive
                  ? "border-brass bg-ink text-brass"
                  : "border-forest-600 bg-ink/80 text-sage group-hover:border-brass/70 group-hover:text-brass",
              ].join(" ")}
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-[clamp(12px,2.2vw,16px)] w-[clamp(12px,2.2vw,16px)]"
              >
                <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
              </svg>
            </span>

            <span
              className={[
                "rounded-full border px-[clamp(6px,1.4vw,10px)] py-0.5 font-ui text-[clamp(9px,1.8vw,11px)] font-semibold tracking-[0.04em] whitespace-nowrap transition-colors duration-300",
                isActive
                  ? "border-brass bg-ink text-brass"
                  : "border-forest-600 bg-ink/80 text-sage group-hover:border-brass/70 group-hover:text-sand",
              ].join(" ")}
            >
              {formatCount(category.count)}
              <span className="hidden sm:inline">
                {" "}
                {category.count === 1 ? "item" : "items"}
              </span>
            </span>
          </div>

          {/* Bottom row: category name & subtitle */}
          <div className="min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h3 className="truncate font-ui text-[clamp(0.75rem,2.3vw,1.15rem)] font-bold tracking-[0.01em] text-sand">
                {category.label}
              </h3>
              <span
                className={[
                  "hidden font-ui text-[10px] font-semibold uppercase tracking-[0.06em] sm:inline",
                  isActive
                    ? "text-brass"
                    : "text-sage group-hover:text-brass",
                ].join(" ")}
              >
                {isActive ? "Open" : "View"}
              </span>
            </div>
            <p className="mt-0.5 truncate text-[clamp(10px,1.7vw,12px)] text-sage">
              {category.subtitle}
            </p>
          </div>
        </motion.div>
      </div>
    </motion.button>
  );
}
