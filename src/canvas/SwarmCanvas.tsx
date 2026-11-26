import { useEffect, useRef, type RefObject } from "react";
import { IS_MOBILE_FRAMES } from "../data/site";
import {
  applyBurstOnRelease,
  createAmbientParticles,
  createIntroParticles,
  drawSwarmParticles,
  getIntroTargetCountForWidth,
  getParticleCountForWidth,
  readSwarmPalette,
  sampleHeadlineTargets,
  stepIntroTween,
  stepSwarm,
  type HeadlineLineSpec,
  type PointerState,
  type SwarmParticle,
} from "./swarmEngine";

export type IntroPhase = "gather" | "hold" | "melt" | "ambient";

interface SwarmCanvasProps {
  reducedMotion: boolean;
  lineRefs: Array<RefObject<HTMLSpanElement | null>>;
  onIntroPhase?: (phase: IntroPhase) => void;
  onPointerReadout?: (x: number, y: number) => void;
  onCountChange?: (count: number) => void;
}

const SESSION_INTRO_KEY = "labib_hero_intro_done";

export function SwarmCanvas({
  reducedMotion,
  lineRefs,
  onIntroPhase,
  onPointerReadout,
  onCountChange,
}: SwarmCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerReadoutRef = useRef(onPointerReadout);
  const countChangeRef = useRef(onCountChange);
  const phaseCbRef = useRef(onIntroPhase);
  pointerReadoutRef.current = onPointerReadout;
  countChangeRef.current = onCountChange;
  phaseCbRef.current = onIntroPhase;

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
    let cancelled = false;
    let lastTime = performance.now();
    let resizeTimer: number | undefined;
    let isVisible = true;
    let isTabVisible = !document.hidden;

    const isRepeatSession =
      typeof window !== "undefined" &&
      window.sessionStorage.getItem(SESSION_INTRO_KEY) === "1";

    let launchSpanMs = isRepeatSession ? 380 : 1700;
    let flightMinMs = isRepeatSession ? 320 : 700;
    let flightMaxMs = isRepeatSession ? 450 : 950;
    let buildEndMs = launchSpanMs + 120 + flightMaxMs;
    let holdEndMs = buildEndMs + (isRepeatSession ? 180 : 600);

    let phase: IntroPhase = reducedMotion ? "ambient" : "gather";
    let introStart = performance.now();
    let frameCount = 0;
    let dtSum = 0;
    let lastReportedCount = -1;

    const pointer: PointerState = {
      x: -9999,
      y: -9999,
      active: false,
      down: false,
    };

    const reportCount = (n: number) => {
      if (n !== lastReportedCount) {
        lastReportedCount = n;
        countChangeRef.current?.(n);
      }
    };

    const measureHeadline = (): HeadlineLineSpec[] => {
      const canvasRect = canvas.getBoundingClientRect();
      const specs: HeadlineLineSpec[] = [];

      lineRefs.forEach((ref, idx) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        specs.push({
          text: el.textContent ?? "",
          outline: idx === 1,
          left: r.left - canvasRect.left,
          top: r.top - canvasRect.top,
          width: r.width,
          height: r.height,
          font: `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`,
          letterSpacing: cs.letterSpacing || "normal",
        });
      });

      return specs;
    };

    const emitPhase = (next: IntroPhase) => {
      if (phase === next) return;
      phase = next;
      phaseCbRef.current?.(next);
    };

    const setupCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      const maxDpr = width < 768 || IS_MOBILE_FRAMES ? 1.5 : 2;
      dpr = Math.min(window.devicePixelRatio || 1, maxDpr);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const initParticles = () => {
      setupCanvasSize();
      const normalCount = getParticleCountForWidth(width);

      if (reducedMotion) {
        particles = createAmbientParticles(normalCount, width, height);
        reportCount(normalCount);
        emitPhase("ambient");
        ctx.clearRect(0, 0, width, height);
        drawSwarmParticles(ctx, particles, palette, dpr, false);
        return;
      }

      const specs = measureHeadline();
      const targetCap = getIntroTargetCountForWidth(width);
      const targets = sampleHeadlineTargets(specs, width, height, targetCap);

      if (targets.length < 30) {
        particles = createAmbientParticles(normalCount, width, height);
        reportCount(normalCount);
        emitPhase("ambient");
        return;
      }

      particles = createIntroParticles(
        targets,
        normalCount,
        width,
        height,
        launchSpanMs,
        flightMinMs,
        flightMaxMs
      );
      reportCount(particles.length);
      introStart = performance.now();
      phase = "gather";
      phaseCbRef.current?.("gather");
    };

    const triggerMelt = () => {
      emitPhase("melt");
      try {
        window.sessionStorage.setItem(SESSION_INTRO_KEY, "1");
      } catch {
        // Ignore storage errors
      }
      // Scatter particles outward cleanly without trails
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const ang = Math.random() * Math.PI * 2;
        const spd = 65 + Math.random() * 110;
        p.vx = Math.cos(ang) * spd;
        p.vy = Math.sin(ang) * spd;
        p.prevX = p.x;
        p.prevY = p.y;
      }
    };

    const tick = (now: number) => {
      if (cancelled || reducedMotion || !isVisible || !isTabVisible) {
        rafId = 0;
        return;
      }

      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      // Low-end FPS guard over first 30 frames (> 28ms avg -> skip intro, show headline)
      if (phase === "gather" || phase === "hold") {
        frameCount++;
        dtSum += dt;
        if (frameCount === 30 && dtSum / 30 > 0.028) {
          particles = particles.filter((p) => !p.isTemp);
          for (let i = 0; i < particles.length; i++) {
            particles[i].prevX = particles[i].x;
            particles[i].prevY = particles[i].y;
          }
          reportCount(particles.length);
          emitPhase("ambient");
          try {
            window.sessionStorage.setItem(SESSION_INTRO_KEY, "1");
          } catch {
            // Ignore storage errors
          }
        }
      }

      const elapsed = now - introStart;

      if (phase === "gather" && elapsed >= buildEndMs) {
        emitPhase("hold");
      } else if (phase === "hold" && elapsed >= holdEndMs) {
        triggerMelt();
      } else if (phase === "melt" && elapsed >= holdEndMs + 650) {
        // Sync prevX/prevY before enabling short ambient trails
        for (let i = 0; i < particles.length; i++) {
          particles[i].prevX = particles[i].x;
          particles[i].prevY = particles[i].y;
        }
        emitPhase("ambient");
      }

      if (phase === "gather" || phase === "hold") {
        stepIntroTween(particles, elapsed);
      } else {
        const changed = stepSwarm(
          particles,
          width,
          height,
          dt,
          pointer,
          grid,
          phase === "melt"
        );
        if (changed) {
          reportCount(particles.length);
        }
      }

      const isMobileView = width < 768 || IS_MOBILE_FRAMES;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      drawSwarmParticles(
        ctx,
        particles,
        palette,
        dpr,
        phase === "ambient" && !isMobileView
      );

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
      if (reducedMotion || phase === "gather" || phase === "hold") return;
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
        if (phase === "gather" || phase === "hold") {
          initParticles();
        } else {
          setupCanvasSize();
          if (reducedMotion) {
            ctx.clearRect(0, 0, width, height);
            drawSwarmParticles(ctx, particles, palette, dpr, false);
          }
        }
      }, 180);
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

    const fontsReady =
      typeof document !== "undefined" && document.fonts?.ready
        ? document.fonts.ready
        : Promise.resolve();

    fontsReady
      .then(() => {
        if (cancelled) return;
        initParticles();
        if (observer) observer.observe(canvas);
        startLoop();
      })
      .catch(() => {
        if (cancelled) return;
        setupCanvasSize();
        const normalCount = getParticleCountForWidth(width);
        particles = createAmbientParticles(normalCount, width, height);
        reportCount(normalCount);
        emitPhase("ambient");
        if (observer) observer.observe(canvas);
        startLoop();
      });

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("pointercancel", onPointerUp, { passive: true });
    document.addEventListener("mouseleave", onPointerLeave);
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
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
  }, [reducedMotion, lineRefs]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="h-full w-full touch-pan-y"
    />
  );
}
