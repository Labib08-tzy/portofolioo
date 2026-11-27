import { useEffect, useRef } from "react";

interface LanyardCardProps {
  reducedMotion: boolean;
  photoSrc: string;
  name: string;
  role: string;
  brand: string;
}

interface Point {
  x: number;
  y: number;
  px: number;
  py: number;
  inv: number; // 1 / massa (0 = terpaku)
}

interface Layout {
  width: number;
  height: number;
  cardW: number;
  cardH: number;
  ropeLen: number;
  anchorX: number;
  anchorY: number;
  segLen: number;
}

const ROPE_SEGMENTS = 8;
const STEP = 1 / 120; // detik per sub-langkah simulasi
const GRAVITY = 3600; // px/s^2 (dipilih agar ayunan terasa natural, bukan lambat)
const SOLVER_ITERATIONS = 12;

/** Motif garis kontur (topografi) dibuat dari matematika, jadi tidak perlu gambar. */
function buildMotifUri(): string {
  const W = 200;
  const H = 316;
  let paths = "";
  const rings = 14;
  for (let r = 0; r < rings; r++) {
    const base = 14 + r * 15;
    const ph1 = r * 0.55;
    const ph2 = r * 0.9 + 1.2;
    let d = "";
    for (let i = 0; i <= 90; i++) {
      const a = (i / 90) * Math.PI * 2;
      const rad =
        base * (1 + 0.14 * Math.sin(3 * a + ph1) + 0.08 * Math.sin(5 * a + ph2));
      const x = W * 0.82 + Math.cos(a) * rad * 1.05;
      const y = H * 0.2 + Math.sin(a) * rad * 1.25;
      d += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    const op = (0.34 - r * 0.018).toFixed(3);
    const col = r % 4 === 0 ? "#B08D57" : "#8CA98C";
    paths += `<path d='${d}Z' fill='none' stroke='${col}' stroke-opacity='${op}' stroke-width='0.7'/>`;
  }
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${W} ${H}' preserveAspectRatio='xMidYMid slice'>${paths}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
const MOTIF_URI = buildMotifUri();

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

function computeLayout(width: number, height: number): Layout {
  const cardW = clamp(Math.min(width * 0.72, height * 0.43, 300), 150, 300);
  const cardH = cardW * 1.58;
  const ropeLen = clamp(height - cardH - 56, 60, 270) + 20;
  return {
    width,
    height,
    cardW,
    cardH,
    ropeLen,
    anchorX: width / 2,
    anchorY: -20,
    segLen: ropeLen / ROPE_SEGMENTS,
  };
}

/** Buat titik tali + titik dasar kartu. `angle` = sudut awal dari garis vertikal (radian). */
function createPoints(layout: Layout, angle: number): Point[] {
  const pts: Point[] = [];
  const sin = Math.sin(angle);
  const cos = Math.cos(angle);
  for (let i = 0; i <= ROPE_SEGMENTS; i++) {
    const d = layout.segLen * i;
    const x = layout.anchorX + sin * d;
    const y = layout.anchorY + cos * d;
    let inv = 1;
    if (i === 0) inv = 0;
    if (i === ROPE_SEGMENTS) inv = 1 / 4; // klip kartu lebih berat
    pts.push({ x, y, px: x, py: y, inv });
  }
  const clip = pts[ROPE_SEGMENTS];
  const cx = clip.x + sin * layout.cardH;
  const cy = clip.y + cos * layout.cardH;
  pts.push({ x: cx, y: cy, px: cx, py: cy, inv: 1 / 7 }); // dasar kartu
  return pts;
}

function satisfy(a: Point, b: Point, rest: number) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy) || 0.0001;
  const diff = (dist - rest) / dist;
  const w = a.inv + b.inv;
  if (w === 0) return;
  const ka = a.inv / w;
  const kb = b.inv / w;
  a.x += dx * diff * ka;
  a.y += dy * diff * ka;
  b.x -= dx * diff * kb;
  b.y -= dy * diff * kb;
}

function buildStrapPath(pts: Point[]): string {
  const n = ROPE_SEGMENTS; // titik rope = 0..n
  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
  for (let i = 1; i < n; i++) {
    const mx = (pts[i].x + pts[i + 1].x) / 2;
    const my = (pts[i].y + pts[i + 1].y) / 2;
    d += ` Q ${pts[i].x.toFixed(2)} ${pts[i].y.toFixed(2)} ${mx.toFixed(2)} ${my.toFixed(2)}`;
  }
  d += ` L ${pts[n].x.toFixed(2)} ${pts[n].y.toFixed(2)}`;
  return d;
}

export function LanyardCard({
  reducedMotion,
  photoSrc,
  name,
  role,
  brand,
}: LanyardCardProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const outerRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const strapEdgeRef = useRef<SVGPathElement | null>(null);
  const strapInnerRef = useRef<SVGPathElement | null>(null);
  const strapStitchRef = useRef<SVGPathElement | null>(null);
  const impulseRef = useRef<(dir: number) => void>(() => {});
  const flipRef = useRef<() => boolean>(() => false);

  useEffect(() => {
    const stage = stageRef.current;
    const outer = outerRef.current;
    const card = cardRef.current;
    const edge = strapEdgeRef.current;
    const inner = strapInnerRef.current;
    const stitch = strapStitchRef.current;
    if (!stage || !outer || !card || !edge || !inner || !stitch) return;

    let layout: Layout | null = null;
    let pts: Point[] = [];
    let raf = 0;
    let running = true;
    let visible = true;
    let firstInit = true;

    // drag
    let grabbing = false;
    let grabT = 0.6;
    let pointerX = 0;
    let pointerY = 0;
    let targetX = 0;
    let targetY = 0;

    // putaran 3D (yaw/pitch) sebagai pegas teredam
    let yaw = 0;
    let yawVel = 0;
    let pitch = 0;
    let lastCx = 0;
    let lastCy = 0;
    let simTime = 0;

    // balik kartu (pegas sudut 0 <-> 180 derajat)
    let flipTarget = 0;
    let flipAngle = 0;
    let flipVel = 0;
    let downX = 0;
    let downY = 0;
    let downT = 0;

    const applySizes = (l: Layout) => {
      outer.style.width = `${l.cardW}px`;
      outer.style.height = `${l.cardH}px`;
      outer.style.marginLeft = `${-l.cardW / 2}px`;
      outer.style.fontSize = `${l.cardW / 20}px`;
      const strapW = clamp(l.cardW * 0.075, 10, 22);
      edge.setAttribute("stroke-width", String(strapW + 2.5));
      inner.setAttribute("stroke-width", String(strapW));
      stitch.setAttribute("stroke-width", "1");
    };

    const init = (width: number, height: number) => {
      layout = computeLayout(width, height);
      applySizes(layout);
      // Awal: kartu terayun ke samping lalu jatuh berayun (hanya saat pertama kali).
      const startAngle = firstInit && !reducedMotion ? 0.62 : 0.02;
      pts = createPoints(layout, startAngle);
      const c = pts[pts.length - 1];
      lastCx = c.x;
      lastCy = c.y;
      yaw = 0;
      yawVel = 0;
      pitch = 0;
      firstInit = false;
      render(0);
      outer.dataset.ready = "true";
    };

    const simulate = (dt: number) => {
      if (!layout) return;
      const l = layout;
      simTime += dt;
      const n = pts.length;
      const clipIdx = ROPE_SEGMENTS;
      const cardIdx = n - 1;

      // angin sangat halus agar kartu tidak kaku saat diam
      const windX = reducedMotion
        ? 0
        : Math.sin(simTime * 0.9) * 55 + Math.sin(simTime * 0.37 + 1.3) * 38;

      // Verlet
      for (let i = 1; i < n; i++) {
        const p = pts[i];
        const damp = i === cardIdx ? 0.9984 : 0.9988;
        const vx = (p.x - p.px) * damp;
        const vy = (p.y - p.py) * damp;
        p.px = p.x;
        p.py = p.y;
        p.x += vx + (grabbing ? 0 : windX) * dt * dt;
        p.y += vy + GRAVITY * dt * dt;
      }

      // Tarikan pointer (pegas lembut, bukan teleport) agar gerakan halus
      if (grabbing) {
        targetX += (pointerX - targetX) * 0.28;
        targetY += (pointerY - targetY) * 0.28;
        const a = pts[clipIdx];
        const b = pts[cardIdx];
        const gx = a.x * (1 - grabT) + b.x * grabT;
        const gy = a.y * (1 - grabT) + b.y * grabT;
        let ex = targetX - gx;
        let ey = targetY - gy;
        const len = Math.hypot(ex, ey);
        const maxStep = 70;
        if (len > maxStep) {
          ex = (ex / len) * maxStep;
          ey = (ey / len) * maxStep;
        }
        const k = 0.38;
        a.x += ex * k * (1 - grabT);
        a.y += ey * k * (1 - grabT);
        b.x += ex * k * grabT;
        b.y += ey * k * grabT;
        // sedikit redam selama ditarik agar tidak bergetar
        for (let i = 1; i < n; i++) {
          const p = pts[i];
          p.px += (p.x - p.px) * 0.06;
          p.py += (p.y - p.py) * 0.06;
        }
      }

      // Constraint jarak
      for (let it = 0; it < SOLVER_ITERATIONS; it++) {
        for (let i = 0; i < ROPE_SEGMENTS; i++) {
          satisfy(pts[i], pts[i + 1], l.segLen);
        }
        satisfy(pts[clipIdx], pts[cardIdx], l.cardH);
      }

      // Batas area (pantul lembut)
      const minX = l.cardW * 0.55;
      const maxX = l.width - l.cardW * 0.55;
      for (let i = 1; i < n; i++) {
        const p = pts[i];
        if (p.x < minX) {
          p.x = minX;
          p.px = p.x + (p.px - p.x) * 0.3;
        } else if (p.x > maxX) {
          p.x = maxX;
          p.px = p.x + (p.px - p.x) * 0.3;
        }
        if (p.y > l.height - 6) {
          p.y = l.height - 6;
          p.py = p.y + (p.py - p.y) * 0.3;
        }
      }
    };

    const render = (dt: number) => {
      if (!layout || pts.length === 0) return;
      const l = layout;
      const clip = pts[ROPE_SEGMENTS];
      const bottom = pts[pts.length - 1];

      // Sudut kartu = arah dari klip ke dasar kartu
      const dx = bottom.x - clip.x;
      const dy = bottom.y - clip.y;
      const theta = Math.atan2(-dx, dy);

      // Putaran 3D mengikuti kecepatan sisi (terasa seperti kartu menggantung bebas)
      if (dt > 0) {
        const vx = (bottom.x - lastCx) / dt;
        const vy = (bottom.y - lastCy) / dt;
        lastCx = bottom.x;
        lastCy = bottom.y;
        const idle = reducedMotion ? 0 : Math.sin(simTime * 0.7) * 5;
        const yawTarget = clamp(vx * 0.045, -44, 44) + idle;
        const acc = 70 * (yawTarget - yaw) - 9 * yawVel;
        yawVel += acc * dt;
        yaw += yawVel * dt;
        yaw = clamp(yaw, -62, 62);
        const pitchTarget = clamp(-vy * 0.008, -10, 10);
        pitch += (pitchTarget - pitch) * Math.min(1, dt * 8);
      }

      if (dt > 0) {
        const fa = 95 * (flipTarget - flipAngle) - 13 * flipVel;
        flipVel += fa * dt;
        flipAngle += flipVel * dt;
      } else {
        flipAngle = flipTarget;
        flipVel = 0;
      }

      outer.style.transform = `translate3d(${clip.x.toFixed(2)}px, ${clip.y.toFixed(2)}px, 0) rotate(${theta.toFixed(4)}rad)`;
      card.style.transform = `perspective(${(l.cardW * 3.4).toFixed(0)}px) rotateX(${pitch.toFixed(2)}deg) rotateY(${(yaw + flipAngle).toFixed(2)}deg)`;
      card.style.setProperty(
        "--shine",
        `${(50 + (yaw + flipAngle) * 0.5).toFixed(1)}%`
      );

      const d = buildStrapPath(pts);
      edge.setAttribute("d", d);
      inner.setAttribute("d", d);
      stitch.setAttribute("d", d);
    };

    // ---- loop ----
    let last = performance.now();
    let acc = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!running || !visible || !layout) {
        last = now;
        return;
      }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      acc += dt;
      let steps = 0;
      while (acc >= STEP && steps < 6) {
        simulate(STEP);
        acc -= STEP;
        steps++;
      }
      if (steps === 6) acc = 0;
      render(dt);
    };

    // ---- ukuran ----
    const measure = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      if (w < 10 || h < 10) return;
      const needsInit =
        !layout ||
        Math.abs(w - layout.width) > 50 ||
        Math.abs(h - layout.height) > 90;
      if (needsInit) {
        init(w, h);
        if (reducedMotion) {
          // pose statis rapi
          running = false;
          render(0);
        }
      }
    };

    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    measure();

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0 }
    );
    io.observe(stage);

    // ---- interaksi ----
    const toStage = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    const onDown = (e: PointerEvent) => {
      if (reducedMotion || !layout) return;
      const p = toStage(e);
      const a = pts[ROPE_SEGMENTS];
      const b = pts[pts.length - 1];
      const ax = b.x - a.x;
      const ay = b.y - a.y;
      const len2 = ax * ax + ay * ay || 1;
      grabT = clamp(((p.x - a.x) * ax + (p.y - a.y) * ay) / len2, 0.25, 0.9);
      pointerX = targetX = p.x;
      pointerY = targetY = p.y;
      downX = e.clientX;
      downY = e.clientY;
      downT = performance.now();
      grabbing = true;
      card.dataset.grabbing = "true";
      try {
        card.setPointerCapture(e.pointerId);
      } catch {
        /* abaikan */
      }
      e.preventDefault();
    };
    const onMove = (e: PointerEvent) => {
      if (!grabbing) return;
      const p = toStage(e);
      pointerX = p.x;
      pointerY = p.y;
    };
    const onUp = (e?: Event) => {
      if (!grabbing) return;
      grabbing = false;
      delete card.dataset.grabbing;
      // ketukan singkat tanpa geser = balik kartu
      if (e && e.type === "pointerup") {
        const pe = e as PointerEvent;
        const moved = Math.hypot(pe.clientX - downX, pe.clientY - downY);
        if (moved < 8 && performance.now() - downT < 380) doFlip();
      }
    };

    const doFlip = () => {
      flipTarget = flipTarget === 0 ? 180 : 0;
      if (reducedMotion) {
        flipAngle = flipTarget;
        render(0);
      }
      return flipTarget === 180;
    };
    flipRef.current = doFlip;

    card.addEventListener("pointerdown", onDown);
    card.addEventListener("pointermove", onMove);
    card.addEventListener("pointerup", onUp);
    card.addEventListener("pointercancel", onUp);
    card.addEventListener("lostpointercapture", onUp);

    impulseRef.current = (dir: number) => {
      if (reducedMotion || pts.length === 0) return;
      const b = pts[pts.length - 1];
      b.px -= dir * 26; // menambah kecepatan horizontal
      const c = pts[ROPE_SEGMENTS];
      c.px -= dir * 10;
    };

    if (!reducedMotion) raf = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      card.removeEventListener("pointerdown", onDown);
      card.removeEventListener("pointermove", onMove);
      card.removeEventListener("pointerup", onUp);
      card.removeEventListener("pointercancel", onUp);
      card.removeEventListener("lostpointercapture", onUp);
    };
  }, [reducedMotion]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      impulseRef.current(-1);
      e.preventDefault();
    } else if (e.key === "ArrowRight") {
      impulseRef.current(1);
      e.preventDefault();
    } else if (e.key === "Enter" || e.key === " ") {
      flipRef.current();
      e.preventDefault();
    }
  };

  return (
    <div ref={stageRef} className="lanyard-stage absolute inset-0">
      {/* Tali */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      >
        <path
          ref={strapEdgeRef}
          fill="none"
          stroke="var(--c-brass)"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.92"
        />
        <path
          ref={strapInnerRef}
          fill="none"
          stroke="var(--c-forest-900)"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          ref={strapStitchRef}
          fill="none"
          stroke="var(--c-sand)"
          strokeDasharray="5 7"
          strokeLinecap="round"
          opacity="0.35"
        />
      </svg>

      {/* Kartu */}
      <div ref={outerRef} className="lanyard-card-outer">
        <div className="lanyard-clip" aria-hidden="true" />
        <div
          ref={cardRef}
          className="lanyard-card"
          tabIndex={reducedMotion ? -1 : 0}
          role="group"
          aria-roledescription="kartu ID interaktif"
          aria-label={`Kartu ID ${name}. Seret untuk menarik, ketuk untuk membalik. Tombol panah mengayunkan, Enter membalik.`}
          onKeyDown={onKeyDown}
          style={{ "--motif-img": MOTIF_URI } as React.CSSProperties}
        >
          {/* Depan */}
          <div className="lanyard-face lanyard-face--front">
            <span className="lanyard-slot" aria-hidden="true" />
            <div className="lanyard-header" aria-hidden="true">
              <strong>{brand}</strong>
              <span>ID // Portfolio</span>
            </div>

            <div className="lanyard-photo-wrap">
              <div className="lanyard-photo-bg" aria-hidden="true" />
              <img
                className="lanyard-photo"
                src={photoSrc}
                alt={`Foto ${name}`}
                draggable={false}
                decoding="async"
              />
              <span className="lanyard-photo-tag" aria-hidden="true">
                Verified
              </span>
            </div>

            <div className="lanyard-info">
              <p className="lanyard-name">{name}</p>
              <p className="lanyard-role">{role}</p>
              <div className="lanyard-barcode" aria-hidden="true" />
            </div>
            <span className="lanyard-sheen" aria-hidden="true" />
          </div>

          {/* Belakang */}
          <div className="lanyard-face lanyard-face--back" aria-hidden="true">
            <div className="lanyard-back-strip" />
            <div className="lanyard-back-mark">{brand.charAt(0)}</div>
            <div className="lanyard-back-code">
              <div className="lanyard-barcode lanyard-barcode--lg" />
              <p>{brand} · 2026 · RPL</p>
            </div>
            <p className="lanyard-back-foot">{brand} // Portfolio</p>
            <span className="lanyard-sheen" />
          </div>
        </div>
      </div>

    </div>
  );
}
