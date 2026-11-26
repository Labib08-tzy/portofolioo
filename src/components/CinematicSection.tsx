import { type ReactNode, useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useReducedMotion } from "../hooks/useReducedMotion";

type TransitionMode = "pinned" | "flow" | "exit-only";

interface CinematicSectionProps {
  children: ReactNode;
  mode?: TransitionMode;
  /** Subtle background color interpolation stops within the site's dark forest/ink palette. */
  bgColors?: [string, string, string];
  className?: string;
}

const DEFAULT_BG: [string, string, string] = ["#0b0f0d", "#0f1511", "#0b0f0d"];

export function CinematicSection({
  children,
  mode = "flow",
  bgColors = DEFAULT_BG,
  className = "",
}: CinematicSectionProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();
  const isMobile = useMediaQuery("(max-width: 767px)");

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset:
      mode === "exit-only"
        ? ["start start", "end start"]
        : ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 26,
    mass: 0.45,
  });

  // Disable blur & parallax on mobile for crisp performance; keep subtle zoom + fade
  const maxBlur = isMobile ? 0 : 8;

  const exitOnlyScale = useTransform(
    smoothProgress,
    [0, 0.38, 1],
    isMobile ? [1, 1, 1.07] : [1, 1, 1.15]
  );
  const exitOnlyOpacity = useTransform(smoothProgress, [0, 0.42, 1], [1, 1, 0.25]);
  const exitOnlyBlurPx = useTransform(
    smoothProgress,
    [0, 0.45, 1],
    [0, 0, maxBlur]
  );

  const stageScale = useTransform(
    smoothProgress,
    [0, 0.24, 0.76, 1],
    mode === "pinned"
      ? isMobile
        ? [0.96, 1, 1, 1.06]
        : [0.91, 1, 1, 1.16]
      : isMobile
        ? [0.97, 1, 1, 1.04]
        : [0.94, 1, 1, 1.1]
  );
  const stageOpacity = useTransform(
    smoothProgress,
    [0, 0.2, 0.8, 1],
    [0.25, 1, 1, 0.25]
  );
  const stageBlurPx = useTransform(
    smoothProgress,
    [0, 0.2, 0.8, 1],
    [maxBlur, 0, 0, maxBlur]
  );
  const stageY = useTransform(
    smoothProgress,
    [0, 0.24, 0.78, 1],
    isMobile ? [0, 0, 0, 0] : [18, 0, 0, -14]
  );

  const bgColor = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    [bgColors[0], bgColors[1], bgColors[2]]
  );

  const activeBlurPx = mode === "exit-only" ? exitOnlyBlurPx : stageBlurPx;
  const filterBlur = useMotionTemplate`blur(${activeBlurPx}px)`;

  if (reducedMotion) {
    return (
      <div
        ref={containerRef}
        className={`relative overflow-x-clip ${className}`}
        style={{ backgroundColor: bgColors[1] }}
      >
        {children}
      </div>
    );
  }

  if (mode === "exit-only") {
    return (
      <div
        ref={containerRef}
        className={`relative overflow-x-clip ${className}`}
      >
        <motion.div
          style={{
            scale: exitOnlyScale,
            opacity: exitOnlyOpacity,
            filter: isMobile ? undefined : filterBlur,
            transformOrigin: "center center",
            willChange: isMobile ? "transform, opacity" : "transform, opacity, filter",
          }}
        >
          {children}
        </motion.div>
      </div>
    );
  }

  if (mode === "pinned") {
    return (
      <motion.div
        ref={containerRef}
        className={`relative min-h-[135svh] overflow-x-clip ${className}`}
        style={{ backgroundColor: bgColor }}
      >
        <div className="sticky top-0 flex min-h-[100svh] items-center">
          <motion.div
            className="w-full"
            style={{
              scale: stageScale,
              opacity: stageOpacity,
              y: stageY,
              filter: isMobile ? undefined : filterBlur,
              transformOrigin: "center center",
              willChange: isMobile ? "transform, opacity" : "transform, opacity, filter",
            }}
          >
            {children}
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={containerRef}
      className={`relative overflow-x-clip ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      <motion.div
        style={{
          scale: stageScale,
          opacity: stageOpacity,
          y: stageY,
          filter: isMobile ? undefined : filterBlur,
          transformOrigin: "center center",
          willChange: isMobile ? "transform, opacity" : "transform, opacity, filter",
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
