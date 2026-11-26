import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  siFlutter,
  siFramer,
  siGit,
  siGsap,
  siLaravel,
  siMysql,
  siPhp,
  siReact,
  siTailwindcss,
  siTypescript,
  siVercel,
  type SimpleIcon,
} from "simple-icons";
import { getBrandColor } from "../data/brandColors";
import { SKILL_GROUPS } from "../data/skills";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { SectionHeading } from "./ui/SectionHeading";

const SKILL_ICON_MAP: Record<string, SimpleIcon> = {
  React: siReact,
  TypeScript: siTypescript,
  "Tailwind CSS": siTailwindcss,
  GSAP: siGsap,
  "Framer Motion": siFramer,
  PHP: siPhp,
  Laravel: siLaravel,
  MySQL: siMysql,
  Flutter: siFlutter,
  Git: siGit,
  Vercel: siVercel,
};

function isTodoItem(name: string): boolean {
  return name.trim().toUpperCase().startsWith("TODO");
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

interface SampledPath {
  xs: number[];
  ys: number[];
  cumLen: number[];
  totalLength: number;
  svgD: string;
  speed: number;
  scale: number;
  opacity: number;
}

interface PathNodeItem {
  key: string;
  tech: string;
  pathIndex: number;
  offset: number;
  scale: number;
  opacity: number;
}

function sampleWavePath(
  width: number,
  yCenter: number,
  amplitude: number,
  wavelength: number,
  phase: number,
  speed: number,
  scale: number,
  opacity: number
): SampledPath {
  const margin = 200;
  const startX = -margin;
  const endX = width + margin;
  const step = 8;

  const xs: number[] = [];
  const ys: number[] = [];
  const cumLen: number[] = [];

  let total = 0;
  let prevX = startX;
  let prevY = yCenter + Math.sin((startX / wavelength) * Math.PI * 2 + phase) * amplitude;
  let svgD = `M ${prevX.toFixed(1)} ${prevY.toFixed(1)}`;

  xs.push(prevX);
  ys.push(prevY);
  cumLen.push(0);

  for (let x = startX + step; x <= endX; x += step) {
    const y = yCenter + Math.sin((x / wavelength) * Math.PI * 2 + phase) * amplitude;
    total += Math.hypot(x - prevX, y - prevY);
    xs.push(x);
    ys.push(y);
    cumLen.push(total);
    svgD += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    prevX = x;
    prevY = y;
  }

  return { xs, ys, cumLen, totalLength: total, svgD, speed, scale, opacity };
}

function pointAt(path: SampledPath, s: number): { x: number; y: number } {
  const len = path.totalLength;
  if (len <= 0) return { x: 0, y: 0 };
  const target = ((s % len) + len) % len;
  const { cumLen, xs, ys } = path;

  let lo = 0;
  let hi = cumLen.length - 1;
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1;
    if (cumLen[mid] <= target) lo = mid;
    else hi = mid;
  }

  const segLen = cumLen[hi] - cumLen[lo];
  const t = segLen > 0 ? (target - cumLen[lo]) / segLen : 0;
  return {
    x: xs[lo] + (xs[hi] - xs[lo]) * t,
    y: ys[lo] + (ys[hi] - ys[lo]) * t,
  };
}

function buildStageLayout(
  width: number,
  height: number,
  techs: string[],
  reducedMotion: boolean
): { paths: SampledPath[]; nodes: PathNodeItem[] } {
  const isMobile = width < 768;
  const specs = isMobile
    ? [
        { y: 0.34, amp: 0.17, wl: Math.max(460, width * 0.95), phase: 0.2, speed: 38, scale: 0.88, opacity: 0.75 },
        { y: 0.66, amp: 0.17, wl: Math.max(420, width * 0.85), phase: 2.3, speed: -28, scale: 1, opacity: 1 },
      ]
    : [
        { y: 0.28, amp: 0.16, wl: Math.max(680, width * 0.72), phase: 0.2, speed: 45, scale: 0.85, opacity: 0.7 },
        { y: 0.51, amp: 0.18, wl: Math.max(620, width * 0.64), phase: 2.1, speed: -32, scale: 1, opacity: 1 },
        { y: 0.74, amp: 0.14, wl: Math.max(760, width * 0.8), phase: 4.1, speed: 24, scale: 0.94, opacity: 0.9 },
      ];

  const paths = specs.map((sp) =>
    sampleWavePath(
      width,
      height * sp.y,
      height * sp.amp,
      sp.wl,
      sp.phase,
      sp.speed,
      sp.scale,
      sp.opacity
    )
  );

  const nodes: PathNodeItem[] = [];
  if (techs.length === 0) return { paths, nodes };

  if (reducedMotion) {
    // Static spread of 1 set of technologies across paths without repetition
    techs.forEach((tech, idx) => {
      const pathIndex = idx % paths.length;
      const path = paths[pathIndex];
      const slot = Math.floor(idx / paths.length);
      const countInPath = Math.ceil((techs.length - pathIndex) / paths.length);
      const usableStart = 240;
      const usableSpan = Math.max(200, path.totalLength - 480);
      const offset =
        usableStart +
        ((slot + 0.5) / Math.max(1, countInPath)) * usableSpan;

      nodes.push({
        key: `static-${tech}`,
        tech,
        pathIndex,
        offset,
        scale: path.scale,
        opacity: path.opacity,
      });
    });
    return { paths, nodes };
  }

  const spacing = isMobile ? 140 : 185;
  const maxTotal = isMobile ? 36 : 60;
  let totalCount = 0;

  paths.forEach((path, pathIndex) => {
    const rawCount = Math.max(4, Math.floor(path.totalLength / spacing));
    const perPathLimit = Math.max(1, Math.floor((maxTotal - totalCount) / (paths.length - pathIndex)));
    const count = Math.min(rawCount, perPathLimit);
    const step = path.totalLength / count;
    const startTechIdx = (pathIndex * 4) % techs.length;

    for (let i = 0; i < count; i++) {
      const tech = techs[(startTechIdx + i) % techs.length];
      nodes.push({
        key: `p${pathIndex}-n${i}-${tech}`,
        tech,
        pathIndex,
        offset: i * step,
        scale: path.scale,
        opacity: path.opacity,
      });
      totalCount++;
    }
  });

  return { paths, nodes };
}

export function Skills() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Array<HTMLDivElement | null>>([]);
  const reducedMotion = useReducedMotion();

  const allTechs = useMemo(
    () =>
      SKILL_GROUPS.flatMap((g) => g.items.filter((item) => !isTodoItem(item))),
    []
  );

  const [stageSize, setStageSize] = useState<{ w: number; h: number }>({
    w: 1280,
    h: 520,
  });

  const layout = useMemo(
    () => buildStageLayout(stageSize.w, stageSize.h, allTechs, reducedMotion),
    [stageSize.w, stageSize.h, allTechs, reducedMotion]
  );

  // Measure container on mount and debounced resize
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const measure = () => {
      const rect = stage.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setStageSize({ w: Math.round(rect.width), h: Math.round(rect.height) });
      }
    };

    measure();
    let timer: number | undefined;
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(measure, 180);
    };

    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Single rAF loop for all nodes (or static placement for reduced-motion)
  useEffect(() => {
    const stage = stageRef.current;
    const section = sectionRef.current;
    if (!stage || !section) return;

    const { paths, nodes } = layout;
    const offsetsX = new Float32Array(nodes.length);
    const offsetsY = new Float32Array(nodes.length);

    const placeStatic = () => {
      for (let i = 0; i < nodes.length; i++) {
        const el = nodeRefs.current[i];
        if (!el) continue;
        const n = nodes[i];
        const pt = pointAt(paths[n.pathIndex], n.offset);
        el.style.transform = `translate3d(${pt.x.toFixed(1)}px, ${pt.y.toFixed(
          1
        )}px, 0) translate(-50%, -50%) scale(${n.scale})`;
      }
    };

    placeStatic();
    if (reducedMotion) return;

    let rafId = 0;
    let isVisible = true;
    let isTabVisible = !document.hidden;
    let lastTime = performance.now();
    const sValues = paths.map(() => 0);

    const pointer = { x: -9999, y: -9999, active: false };

    const tick = (now: number) => {
      if (!isVisible || !isTabVisible) {
        rafId = 0;
        return;
      }

      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      for (let p = 0; p < paths.length; p++) {
        sValues[p] += paths[p].speed * dt;
      }

      const lerpAlpha = Math.min(1, dt * 8);

      for (let i = 0; i < nodes.length; i++) {
        const el = nodeRefs.current[i];
        if (!el) continue;
        const n = nodes[i];
        const pt = pointAt(paths[n.pathIndex], sValues[n.pathIndex] + n.offset);

        let targetOx = 0;
        let targetOy = 0;
        if (pointer.active) {
          const dx = pt.x - pointer.x;
          const dy = pt.y - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 120 && dist > 0.5) {
            const push = ((120 - dist) / 120) * 14;
            targetOx = (dx / dist) * push;
            targetOy = (dy / dist) * push;
          }
        }

        offsetsX[i] += (targetOx - offsetsX[i]) * lerpAlpha;
        offsetsY[i] += (targetOy - offsetsY[i]) * lerpAlpha;

        const fx = pt.x + offsetsX[i];
        const fy = pt.y + offsetsY[i];
        el.style.transform = `translate3d(${fx.toFixed(1)}px, ${fy.toFixed(
          1
        )}px, 0) translate(-50%, -50%) scale(${n.scale})`;
      }

      rafId = window.requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (!rafId && isVisible && isTabVisible) {
        lastTime = performance.now();
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const stopLoop = () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = stage.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    };

    const onPointerLeave = () => {
      pointer.active = false;
    };

    const onVisibilityChange = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible) startLoop();
      else stopLoop();
    };

    const observer =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            ([entry]) => {
              isVisible = entry.isIntersecting;
              if (isVisible) startLoop();
              else stopLoop();
            },
            { threshold: 0.02 }
          )
        : null;

    if (observer) observer.observe(section);
    startLoop();

    stage.addEventListener("pointermove", onPointerMove, { passive: true });
    stage.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      stopLoop();
      observer?.disconnect();
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [layout, reducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="relative scroll-mt-20 overflow-hidden border-b border-forest-600 bg-ink bg-grid-pattern pt-[clamp(48px,6vw,112px)] pb-[clamp(24px,4vw,56px)]"
    >
      {/* Subtle ambient glows */}
      <div
        aria-hidden="true"
        className="ambient-glow-brass pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full blur-3xl"
      />
      <div
        aria-hidden="true"
        className="ambient-glow-emerald pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          index="02"
          eyebrow="Keahlian"
          title="Teknologi & Perkakas"
          subtitle="Teknologi yang digunakan dalam pengembangan web, mobile, dan alur kerja."
        />
      </div>

      {/* Screen-reader accessible semantic list per group */}
      <div className="sr-only">
        {SKILL_GROUPS.map((group) => {
          const items = group.items.filter((i) => !isTodoItem(i));
          if (items.length === 0) return null;
          return (
            <div key={group.category}>
              <h3>{group.category}</h3>
              <ul>
                {items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Full-viewport curved intersecting paths stage */}
      <div
        ref={stageRef}
        aria-hidden="true"
        className="skills-stage-mask relative z-10 h-[clamp(290px,52vw,520px)] w-full overflow-hidden"
      >
        {/* Top & bottom soft edge gradients */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-14 bg-gradient-to-b from-ink to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-14 bg-gradient-to-t from-ink to-transparent" />

        {/* Track SVG paths in exact pixel coordinates */}
        <svg
          viewBox={`0 0 ${stageSize.w} ${stageSize.h}`}
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          {layout.paths.map((p, idx) => (
            <path
              key={idx}
              d={p.svgD}
              fill="none"
              stroke="var(--c-forest-600)"
              strokeOpacity={0.35}
              strokeWidth={1.25}
            />
          ))}
        </svg>

        {/* Moving circular technology nodes */}
        {layout.nodes.map((node, idx) => {
          const icon = SKILL_ICON_MAP[node.tech];
          const brandColor = getBrandColor(node.tech);
          const style = {
            "--brand-color": brandColor,
            opacity: node.opacity,
          } as CSSProperties;

          return (
            <div
              key={node.key}
              ref={(el) => {
                nodeRefs.current[idx] = el;
              }}
              style={style}
              className="skill-circle-trigger pointer-events-auto absolute top-0 left-0 will-change-transform"
            >
              <div className="flex flex-col items-center gap-1.5 text-center">
                <div className="skill-circle flex h-[clamp(42px,8vw,72px)] w-[clamp(42px,8vw,72px)] items-center justify-center rounded-full bg-ink/85 backdrop-blur-xs">
                  {icon ? (
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      style={{ color: brandColor }}
                      className="h-[clamp(18px,3.4vw,32px)] w-[clamp(18px,3.4vw,32px)] fill-current"
                    >
                      <path d={icon.path} />
                    </svg>
                  ) : (
                    <span
                      aria-hidden="true"
                      style={{ color: brandColor }}
                      className="font-mono text-[clamp(10px,1.8vw,14px)] font-bold"
                    >
                      {getInitials(node.tech)}
                    </span>
                  )}
                </div>
                <span className="skill-label whitespace-nowrap font-mono text-[clamp(9px,1.6vw,11px)] text-sage transition-colors duration-200">
                  {node.tech}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
