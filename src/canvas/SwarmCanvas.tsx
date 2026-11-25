import { useEffect, useRef } from "react";
import {
  createParticles,
  drawCursorShape,
  readSwarmPalette,
  sampleTextTargets,
  type SwarmParticle,
} from "./swarmEngine";

interface SwarmCanvasProps {
  text: string;
  active: boolean;
  onFormed?: () => void;
}

export function SwarmCanvas({ text, active, onFormed }: SwarmCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const formedCalledRef = useRef(false);
  const onFormedRef = useRef(onFormed);
  onFormedRef.current = onFormed;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const palette = readSwarmPalette();
    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles: SwarmParticle[] = [];
    let rafId = 0;
    let resizeTimer: number | undefined;
    let isVisible = true;
    let isTabVisible = !document.hidden;

    const pointer = { x: -9999, y: -9999, active: false };
    const startTime = performance.now();

    const setup = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const maxParticles =
        width < 480 ? 150 : width < 900 ? 240 : 380;
      const targets = sampleTextTargets(text, width, height, maxParticles);
      particles = createParticles(targets, width, height);
    };

    const tick = (now: number) => {
      if (!active || !isVisible || !isTabVisible) {
        rafId = 0;
        return;
      }

      const elapsed = now - startTime;
      // Phase 1 (0..750ms): roam freely; Phase 2 (750ms+): assemble into "LABIB"
      const isAssembling = elapsed > 750;

      if (elapsed > 1550 && !formedCalledRef.current) {
        formedCalledRef.current = true;
        onFormedRef.current?.();
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (isAssembling) {
          const dx = p.tx - p.x;
          const dy = p.ty - p.y;
          p.vx += dx * 0.045;
          p.vy += dy * 0.045;
        } else {
          p.vx += Math.sin(now * 0.003 + i) * 0.14;
          p.vy += Math.cos(now * 0.0027 + i * 0.7) * 0.14;
        }

        // Consistent repel interaction on mouse/touch
        if (pointer.active) {
          const mdx = p.x - pointer.x;
          const mdy = p.y - pointer.y;
          const distSq = mdx * mdx + mdy * mdy;
          const radius = 95;
          if (distSq < radius * radius && distSq > 1) {
            const dist = Math.sqrt(distSq);
            const force = ((radius - dist) / radius) * 3.8;
            p.vx += (mdx / dist) * force;
            p.vy += (mdy / dist) * force;
          }
        }

        p.vx *= 0.84;
        p.vy *= 0.84;
        p.x += p.vx;
        p.y += p.vy;

        const speed = Math.hypot(p.vx, p.vy);
        if (speed > 0.25) {
          p.angle = Math.atan2(p.vy, p.vx) + Math.PI / 2;
        } else {
          p.angle += (-Math.PI / 6 - p.angle) * 0.1;
        }

        drawCursorShape(
          ctx,
          p.x,
          p.y,
          p.size,
          p.angle,
          p.isBrass ? palette.brass : palette.sand
        );
      }

      rafId = window.requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (!rafId && active && isVisible && isTabVisible) {
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
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    };

    const onPointerLeave = () => {
      pointer.active = false;
    };

    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        setup();
      }, 180);
    };

    const onVisibilityChange = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible) {
        startLoop();
      } else {
        stopLoop();
      }
    };

    const observer =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            ([entry]) => {
              isVisible = entry.isIntersecting;
              if (isVisible) {
                startLoop();
              } else {
                stopLoop();
              }
            },
            { threshold: 0.05 }
          )
        : null;

    setup();
    if (observer) observer.observe(canvas);
    startLoop();

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      stopLoop();
      window.clearTimeout(resizeTimer);
      observer?.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [text, active]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="h-full w-full touch-pan-y"
    />
  );
}

