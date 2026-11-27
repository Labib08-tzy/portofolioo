import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SITE_INFO } from "../data/site";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { SectionHeading } from "./ui/SectionHeading";
import { BlurBackdrop } from "./ui/BlurBackdrop";

gsap.registerPlugin(ScrollTrigger);

interface ContainRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

function computeContainBottom(
  imgW: number,
  imgH: number,
  canvasW: number,
  canvasH: number
): ContainRect {
  const scale = Math.min(canvasW / imgW, canvasH / imgH);
  const w = imgW * scale;
  const h = imgH * scale;
  const x = (canvasW - w) / 2;
  const y = canvasH - h;
  return { x, y, w, h };
}

async function loadDecodedImage(src: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.decoding = "async";
  img.src = src;
  if (typeof img.decode === "function") {
    try {
      await img.decode();
      return img;
    } catch {
      // Fallback to onload
    }
  }
  return new Promise<HTMLImageElement>((resolve, reject) => {
    if (img.complete && img.naturalWidth > 0) {
      resolve(img);
      return;
    }
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
  });
}

function drawBrushStamp(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number
) {
  if (radius <= 0.5) return;
  const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
  grad.addColorStop(0, "rgba(0,0,0,1)");
  grad.addColorStop(0.55, "rgba(0,0,0,0.75)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function EraserPortraitCanvas({
  reducedMotion,
  isTouch,
}: {
  reducedMotion: boolean;
  isTouch: boolean;
}) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [reducedToggled, setReducedToggled] = useState(false);

  const imagesRef = useRef<{
    primary: HTMLImageElement | null;
    hover: HTMLImageElement | null;
  }>({ primary: null, hover: null });

  // Reduced motion: simple tap-to-toggle between photo 1 and photo 2
  useEffect(() => {
    if (!reducedMotion) return;
    let cancelled = false;

    Promise.all([
      loadDecodedImage(SITE_INFO.aboutPhoto),
      loadDecodedImage(SITE_INFO.aboutHoverPhoto),
    ])
      .then(([p, h]) => {
        if (cancelled) return;
        imagesRef.current = { primary: p, hover: h };
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.max(1, Math.round(rect.width * dpr));
        canvas.height = Math.max(1, Math.round(rect.height * dpr));
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const activeImg = reducedToggled ? h : p;
        const box = computeContainBottom(
          activeImg.naturalWidth,
          activeImg.naturalHeight,
          canvas.width,
          canvas.height
        );
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(activeImg, box.x, box.y, box.w, box.h);
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [reducedMotion, reducedToggled]);

  // Interactive eraser reveal loop
  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const mainCtx = canvas.getContext("2d");
    if (!mainCtx) return;

    const maskCanvas = document.createElement("canvas");
    const tempCanvas = document.createElement("canvas");
    const maskCtx = maskCanvas.getContext("2d");
    const tempCtx = tempCanvas.getContext("2d");
    if (!maskCtx || !tempCtx) return;

    let cw = 1;
    let ch = 1;
    let dpr = 1;
    let rafId = 0;
    let isVisible = true;
    let isTabVisible = !document.hidden;
    let cancelled = false;
    let lastTime = performance.now();

    const pointer = {
      inside: false,
      targetX: 0,
      targetY: 0,
      currX: 0,
      currY: 0,
      prevX: 0,
      prevY: 0,
      radius: 0,
      energy: 0,
      fadeRate: 0.08,
    };

    const drawStaticPrimary = () => {
      const primary = imagesRef.current.primary;
      if (!primary) return;
      mainCtx.globalCompositeOperation = "source-over";
      mainCtx.clearRect(0, 0, cw, ch);
      const box = computeContainBottom(
        primary.naturalWidth,
        primary.naturalHeight,
        cw,
        ch
      );
      mainCtx.drawImage(primary, box.x, box.y, box.w, box.h);
    };

    const syncSize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cw = Math.round(rect.width * dpr);
      ch = Math.round(rect.height * dpr);
      canvas.width = cw;
      canvas.height = ch;
      maskCanvas.width = cw;
      maskCanvas.height = ch;
      tempCanvas.width = cw;
      tempCanvas.height = ch;
      drawStaticPrimary();
    };

    const stopLoop = () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    const tick = (now: number) => {
      if (cancelled || !isVisible || !isTabVisible) {
        rafId = 0;
        return;
      }

      const primary = imagesRef.current.primary;
      const hover = imagesRef.current.hover;
      if (!primary || !hover) {
        rafId = 0;
        return;
      }

      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      const maxRadius = cw * 0.22;

      // 1) Fade previous mask trail smoothly (~0.8s decay)
      const stepAlpha = 1 - Math.pow(1 - pointer.fadeRate, dt * 60);
      maskCtx.globalCompositeOperation = "destination-out";
      maskCtx.fillStyle = `rgba(0,0,0,${stepAlpha.toFixed(3)})`;
      maskCtx.fillRect(0, 0, cw, ch);

      // 2) Stamp radial brush along interpolated path when pointer is inside
      if (pointer.inside) {
        pointer.prevX = pointer.currX;
        pointer.prevY = pointer.currY;
        pointer.currX += (pointer.targetX - pointer.currX) * Math.min(1, dt * 40);
        pointer.currY += (pointer.targetY - pointer.currY) * Math.min(1, dt * 40);
        pointer.radius += (maxRadius - pointer.radius) * Math.min(1, dt * 34);

        maskCtx.globalCompositeOperation = "source-over";
        const dx = pointer.currX - pointer.prevX;
        const dy = pointer.currY - pointer.prevY;
        const dist = Math.hypot(dx, dy);
        const stepSize = Math.max(4 * dpr, pointer.radius * 0.22);
        const steps = Math.max(1, Math.ceil(dist / stepSize));

        for (let s = 1; s <= steps; s++) {
          const t = s / steps;
          drawBrushStamp(
            maskCtx,
            pointer.prevX + dx * t,
            pointer.prevY + dy * t,
            pointer.radius
          );
        }
        pointer.energy = 1;
      } else {
        pointer.radius = Math.max(0, pointer.radius - maxRadius * dt * 3);
        pointer.energy = Math.max(0, pointer.energy - dt * (pointer.fadeRate * 13));
      }

      // 3) Composite main canvas:
      // (a) clear
      mainCtx.globalCompositeOperation = "source-over";
      mainCtx.clearRect(0, 0, cw, ch);

      // (b) draw photo 1 (object-fit contain, aligned bottom)
      const pBox = computeContainBottom(
        primary.naturalWidth,
        primary.naturalHeight,
        cw,
        ch
      );
      mainCtx.drawImage(primary, pBox.x, pBox.y, pBox.w, pBox.h);

      // (c) destination-out photo 1 using maskCanvas
      mainCtx.globalCompositeOperation = "destination-out";
      mainCtx.drawImage(maskCanvas, 0, 0);

      // (d) tempCanvas: draw photo 2 + destination-in with maskCanvas
      tempCtx.globalCompositeOperation = "source-over";
      tempCtx.clearRect(0, 0, cw, ch);
      const hBox = computeContainBottom(
        hover.naturalWidth,
        hover.naturalHeight,
        cw,
        ch
      );
      tempCtx.drawImage(hover, hBox.x, hBox.y, hBox.w, hBox.h);
      tempCtx.globalCompositeOperation = "destination-in";
      tempCtx.drawImage(maskCanvas, 0, 0);
      tempCtx.globalCompositeOperation = "source-over";

      // (e) source-over tempCanvas onto mainCanvas
      mainCtx.globalCompositeOperation = "source-over";
      mainCtx.drawImage(tempCanvas, 0, 0);

      // Stop loop once mask has completely faded out
      if (!pointer.inside && pointer.energy <= 0.005) {
        maskCtx.clearRect(0, 0, cw, ch);
        drawStaticPrimary();
        rafId = 0;
        return;
      }

      rafId = window.requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (!rafId && isVisible && isTabVisible && imagesRef.current.primary) {
        lastTime = performance.now();
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const toCanvasCoords = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (clientX - rect.left) * dpr,
        y: (clientY - rect.top) * dpr,
      };
    };

    const onPointerEnter = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const pt = toCanvasCoords(e.clientX, e.clientY);
      pointer.inside = true;
      pointer.fadeRate = 0.08;
      pointer.targetX = pt.x;
      pointer.targetY = pt.y;
      pointer.currX = pt.x;
      pointer.currY = pt.y;
      pointer.prevX = pt.x;
      pointer.prevY = pt.y;
      pointer.radius = cw * 0.16; // langsung muncul, tanpa jeda
      pointer.energy = 1;
      setHasInteracted(true);
      startLoop();
    };

    const onPointerMove = (e: PointerEvent) => {
      const pt = toCanvasCoords(e.clientX, e.clientY);
      if (e.pointerType === "touch") {
        pointer.inside = true;
        pointer.fadeRate = 0.06;
      } else if (!pointer.inside) {
        pointer.inside = true;
        pointer.currX = pt.x;
        pointer.currY = pt.y;
      }
      pointer.targetX = pt.x;
      pointer.targetY = pt.y;
      pointer.energy = 1;
      setHasInteracted(true);
      startLoop();
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return;
      const pt = toCanvasCoords(e.clientX, e.clientY);
      const maxRadius = cw * 0.22;
      pointer.inside = false;
      pointer.fadeRate = 0.045; // ~1.5s fade on touch tap
      pointer.targetX = pt.x;
      pointer.targetY = pt.y;
      pointer.currX = pt.x;
      pointer.currY = pt.y;
      pointer.energy = 1;
      maskCtx.globalCompositeOperation = "source-over";
      drawBrushStamp(maskCtx, pt.x, pt.y, maxRadius);
      setHasInteracted(true);
      startLoop();
    };

    const onPointerLeave = () => {
      pointer.inside = false;
    };

    const onVisibilityChange = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible && (pointer.inside || pointer.energy > 0.005)) {
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
              if (isVisible && (pointer.inside || pointer.energy > 0.005)) {
                startLoop();
              } else if (!isVisible) {
                stopLoop();
              }
            },
            { threshold: 0.05 }
          )
        : null;

    syncSize();
    if (observer) observer.observe(wrapper);

    Promise.all([
      loadDecodedImage(SITE_INFO.aboutPhoto),
      loadDecodedImage(SITE_INFO.aboutHoverPhoto),
    ])
      .then(([p, h]) => {
        if (cancelled) return;
        imagesRef.current = { primary: p, hover: h };
        drawStaticPrimary();
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });

    wrapper.addEventListener("pointerenter", onPointerEnter);
    wrapper.addEventListener("pointermove", onPointerMove);
    wrapper.addEventListener("pointerdown", onPointerDown);
    wrapper.addEventListener("pointerleave", onPointerLeave);
    wrapper.addEventListener("pointercancel", onPointerLeave);
    window.addEventListener("resize", syncSize);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      stopLoop();
      observer?.disconnect();
      wrapper.removeEventListener("pointerenter", onPointerEnter);
      wrapper.removeEventListener("pointermove", onPointerMove);
      wrapper.removeEventListener("pointerdown", onPointerDown);
      wrapper.removeEventListener("pointerleave", onPointerLeave);
      wrapper.removeEventListener("pointercancel", onPointerLeave);
      window.removeEventListener("resize", syncSize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [reducedMotion]);

  if (loadFailed) {
    return (
      <div
        className="brutal-card mx-auto flex w-full max-w-md flex-col items-center justify-center p-6 text-center"
        style={{ aspectRatio: "900 / 1124" }}
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-forest-600 bg-ink font-display text-2xl font-bold text-brass">
          ML
        </div>
        <p className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-sage">
          Foto belum tersedia
        </p>
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      onClick={reducedMotion ? () => setReducedToggled((p) => !p) : undefined}
      className="about-portrait mx-auto w-full max-w-md"
      style={{
        aspectRatio: "900 / 1124",
        touchAction: "pan-y",
      }}
    >
      {/* Cahaya lembut di belakang potret (tanpa kotak) */}
      <div aria-hidden="true" className="about-portrait-glow" />

      <canvas
        ref={canvasRef}
        role="img"
        aria-label={SITE_INFO.fullName}
        className="relative z-10 block h-full w-full"
      />

      {!hasInteracted && !reducedMotion ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-3 bottom-3 z-20 rounded-full border border-forest-600 bg-ink/85 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-brass backdrop-blur-xs"
        >
          {isTouch ? "SENTUH / GESER" : "GERAKKAN KURSOR"}
        </span>
      ) : null}
    </div>
  );
}

export function About() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();
  const isTouch = useMediaQuery("(hover: none)");

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || reducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.from(".about-reveal", {
        y: 24,
        opacity: 0,
        duration: 0.65,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          once: true,
        },
      });
    }, el);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative isolate overflow-hidden scroll-mt-20 border-b border-forest-600 bg-ink py-20 sm:py-28"
    >
<BlurBackdrop variant="a" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          index="01"
          eyebrow="Tentang"
          title="Mengenal Lebih Dekat"
          subtitle="Latar belakang singkat, fokus belajar di RPL, dan arah pengembangan."
        />

        <div className="grid gap-10 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-7">
            {SITE_INFO.aboutParagraphs.map((paragraph, index) => (
              <p
                key={index}
                className="about-reveal text-base leading-relaxed text-sand/90 sm:text-lg"
              >
                {paragraph}
              </p>
            ))}

            <div className="about-reveal brutal-card mt-8 p-5 sm:p-6">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-brass">
                Fakta Ringkas
              </p>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                {SITE_INFO.aboutFacts.map((fact) => (
                  <div
                    key={fact.label}
                    className="border-l border-forest-600 pl-3"
                  >
                    <dt className="font-mono text-xs uppercase tracking-wider text-sage">
                      {fact.label}
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-sand">
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div className="about-reveal lg:col-span-5 lg:-mt-14 lg:self-start">
            <EraserPortraitCanvas
              reducedMotion={reducedMotion}
              isTouch={isTouch}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
