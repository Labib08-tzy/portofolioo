import { useEffect, useRef } from "react";
import {
  applyBurstOnRelease,
  createSwarmParticles,
  drawSwarmParticles,
  getParticleCountForWidth,
  readSwarmPalette,
  stepSwarm,
  type PointerState,
  type SwarmParticle,
} from "./swarmEngine";

interface SwarmCanvasProps {
  reducedMotion: boolean;
  onPointerReadout?: (x: number, y: number) => void;
  onCountChange?: (count: number) => void;
}

export function SwarmCanvas({
  reducedMotion,
  onPointerReadout,
  onCountChange,
}: SwarmCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerReadoutRef = useRef(onPointerReadout);
  const countChangeRef = useRef(onCountChange);
  pointerReadoutRef.current = onPointerReadout;
  countChangeRef.current = onCountChange;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const palette = readSwarmPalette();
    const grid = new Map<number, number[]>();
    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles: SwarmParticle[] = [];
    let rafId = 0;
    let lastTime = performance.now();
    let resizeTimer: number | undefined;
    let isVisible = true;
    let isTabVisible = !document.hidden;

    const pointer: PointerState = {
      x: -9999,
      y: -9999,
      active: false,
      down: false,
    };

    const setup = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = getParticleCountForWidth(width);
      particles = createSwarmParticles(count, width, height);
      countChangeRef.current?.(count);

      if (reducedMotion) {
        ctx.clearRect(0, 0, width, height);
        drawSwarmParticles(ctx, particles, palette);
      }
    };

    const tick = (now: number) => {
      if (reducedMotion || !isVisible || !isTabVisible) {
        rafId = 0;
        return;
      }

      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      stepSwarm(particles, width, height, dt, pointer, grid);
      ctx.clearRect(0, 0, width, height);
      drawSwarmParticles(ctx, particles, palette);

      rafId = window.requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (!rafId && !reducedMotion && isVisible && isTabVisible) {
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

    const updatePointerCoords = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = clientX - rect.left;
      pointer.y = clientY - rect.top;
      pointer.active = true;
      pointerReadoutRef.current?.(Math.round(pointer.x), Math.round(pointer.y));
    };

    const onPointerMove = (e: PointerEvent) => {
      if (reducedMotion) return;
      updatePointerCoords(e.clientX, e.clientY);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (reducedMotion) return;
      updatePointerCoords(e.clientX, e.clientY);
      pointer.down = true;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (reducedMotion) return;
      if (pointer.down) {
        const rect = canvas.getBoundingClientRect();
        applyBurstOnRelease(
          particles,
          e.clientX - rect.left,
          e.clientY - rect.top
        );
      }
      pointer.down = false;
    };

    const onPointerLeave = () => {
      pointer.active = false;
      pointer.down = false;
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
            { threshold: 0.02 }
          )
        : null;

    setup();
    if (observer) observer.observe(canvas);
    startLoop();

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("pointercancel", onPointerUp, { passive: true });
    document.addEventListener("mouseleave", onPointerLeave);
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      stopLoop();
      window.clearTimeout(resizeTimer);
      observer?.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      document.removeEventListener("mouseleave", onPointerLeave);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="h-full w-full touch-pan-y"
    />
  );
}
