export interface SwarmParticle {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  vx: number;
  vy: number;
  startX: number;
  startY: number;
  ctrlX: number;
  ctrlY: number;
  tx: number;
  ty: number;
  hasTarget: boolean;
  isTemp: boolean;
  launchMs: number;
  flightMs: number;
  driftVx: number;
  driftVy: number;
  size: number;
  introSize: number;
  baseSize: number;
  colorIndex: 0 | 1 | 2;
  opacity: number;
  baseOpacity: number;
  angle: number;
  wanderAngle: number;
}

export interface SwarmPalette {
  colors: [string, string, string]; // [sand, brass, sage]
}

export interface PointerState {
  x: number;
  y: number;
  active: boolean;
  down: boolean;
}

export interface HeadlineLineSpec {
  text: string;
  outline: boolean;
  left: number;
  top: number;
  width: number;
  height: number;
  font: string;
  letterSpacing: string;
}

export interface SampledTarget {
  x: number;
  y: number;
  lineIndex: number;
  colorIndex: 0 | 1 | 2;
}

export function readSwarmPalette(): SwarmPalette {
  const styles = getComputedStyle(document.documentElement);
  const sand = styles.getPropertyValue("--c-sand").trim() || "currentColor";
  const brass = styles.getPropertyValue("--c-brass").trim() || sand;
  const sage = styles.getPropertyValue("--c-sage").trim() || sand;
  return { colors: [sand, brass, sage] };
}

export function getParticleCountForWidth(width: number): number {
  if (width < 640) return 70;
  if (width < 1024) return 140;
  return 220;
}

export function getIntroTargetCountForWidth(width: number): number {
  if (width < 640) return 620;
  if (width < 1024) return 720;
  return 1000;
}

/** Ukuran kursor saat membentuk huruf: kecil di layar kecil agar huruf tetap terbaca. */
export function getIntroSizeForWidth(width: number): number {
  if (width < 640) return 2.9;
  if (width < 1024) return 3.8;
  return 4.7;
}

function getSampleSteps(width: number): { solid: number; outline: number } {
  if (width < 640) return { solid: 3, outline: 2 };
  if (width < 1024) return { solid: 4, outline: 3 };
  return { solid: 5, outline: 3 };
}

export function sampleHeadlineTargets(
  lines: HeadlineLineSpec[],
  canvasWidth: number,
  canvasHeight: number,
  maxTargets: number
): SampledTarget[] {
  if (lines.length === 0 || canvasWidth <= 0 || canvasHeight <= 0) return [];

  const offscreen = document.createElement("canvas");
  offscreen.width = Math.max(1, Math.floor(canvasWidth));
  offscreen.height = Math.max(1, Math.floor(canvasHeight));
  const ctx = offscreen.getContext("2d");
  if (!ctx) return [];

  const allPoints: SampledTarget[] = [];

  lines.forEach((line, lineIndex) => {
    ctx.clearRect(0, 0, offscreen.width, offscreen.height);
    ctx.font = line.font;
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";

    if ("letterSpacing" in ctx) {
      (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
        line.letterSpacing;
    }

    const drawX = line.left;
    const drawY = line.top + line.height * 0.52;

    if (line.outline) {
      ctx.lineWidth = canvasWidth < 640 ? 1.6 : 2.2;
      ctx.strokeStyle = "white";
      ctx.strokeText(line.text, drawX, drawY);
    } else {
      ctx.fillStyle = "white";
      ctx.fillText(line.text, drawX, drawY);
    }

    const minX = Math.max(0, Math.floor(line.left - 8));
    const minY = Math.max(0, Math.floor(line.top - 8));
    const maxX = Math.min(offscreen.width, Math.ceil(line.left + line.width + 16));
    const maxY = Math.min(offscreen.height, Math.ceil(line.top + line.height + 16));
    const regionW = maxX - minX;
    const regionH = maxY - minY;
    if (regionW <= 0 || regionH <= 0) return;

    const data = ctx.getImageData(minX, minY, regionW, regionH).data;
    const steps = getSampleSteps(canvasWidth);
    const step = line.outline ? steps.outline : steps.solid;

    for (let y = 0; y < regionH; y += step) {
      for (let x = 0; x < regionW; x += step) {
        const alpha = data[(y * regionW + x) * 4 + 3];
        if (alpha > 128) {
          const jitterX = (Math.random() - 0.5) * 1.4;
          const jitterY = (Math.random() - 0.5) * 1.4;
          const colorIndex: 0 | 1 | 2 = line.outline
            ? Math.random() < 0.82 ? 1 : 0
            : Math.random() < 0.84 ? 0 : 2;
          allPoints.push({
            x: minX + x + jitterX,
            y: minY + y + jitterY,
            lineIndex,
            colorIndex,
          });
        }
      }
    }
  });

  if (allPoints.length === 0) return [];

  // Sort top-to-bottom (lineIndex), then left-to-right (x) with slight organic jitter
  allPoints.sort((a, b) => {
    if (a.lineIndex !== b.lineIndex) return a.lineIndex - b.lineIndex;
    return a.x - b.x + (Math.random() - 0.5) * 32;
  });

  // Evenly downsample if more points than maxTargets so all 3 lines stay balanced
  if (allPoints.length <= maxTargets) return allPoints;
  const sampled: SampledTarget[] = [];
  const stride = allPoints.length / maxTargets;
  for (let i = 0; i < maxTargets; i++) {
    sampled.push(allPoints[Math.floor(i * stride)]);
  }
  return sampled;
}

function randomEdgePoint(width: number, height: number): { x: number; y: number } {
  const side = Math.floor(Math.random() * 4);
  const margin = 28;
  switch (side) {
    case 0: // top
      return { x: Math.random() * width, y: -margin + Math.random() * 60 };
    case 1: // right
      return { x: width + margin - Math.random() * 60, y: Math.random() * height };
    case 2: // bottom
      return { x: Math.random() * width, y: height + margin - Math.random() * 60 };
    default: // left
      return { x: -margin + Math.random() * 60, y: Math.random() * height };
  }
}

export function createIntroParticles(
  targets: SampledTarget[],
  normalCount: number,
  width: number,
  height: number,
  launchSpanMs: number,
  flightMinMs: number,
  flightMaxMs: number
): SwarmParticle[] {
  const total = Math.max(normalCount, targets.length);
  const particles: SwarmParticle[] = [];
  const targetCount = Math.max(1, targets.length);

  for (let i = 0; i < total; i++) {
    const target = i < targets.length ? targets[i] : null;
    const isTemp = i >= normalCount;
    const start = randomEdgePoint(width, height);
    const tx = target ? target.x : Math.random() * width;
    const ty = target ? target.y : Math.random() * height;

    // Quadratic Bezier control point offset perpendicular 10%-20% of distance
    const dx = tx - start.x;
    const dy = ty - start.y;
    const dist = Math.hypot(dx, dy) || 1;
    const nx = -dy / dist;
    const ny = dx / dist;
    const curveRatio = (0.1 + Math.random() * 0.1) * (i % 2 === 0 ? 1 : -1);
    const ctrlX = (start.x + tx) * 0.5 + nx * dist * curveRatio;
    const ctrlY = (start.y + ty) * 0.5 + ny * dist * curveRatio;

    const launchMs = target
      ? (i / targetCount) * launchSpanMs + Math.random() * 120
      : 0;
    const flightMs =
      flightMinMs + Math.random() * Math.max(50, flightMaxMs - flightMinMs);

    const roll = i % 10;
    const defaultColor: 0 | 1 | 2 = roll < 5 ? 0 : roll < 8 ? 2 : 1;
    const baseOpacity =
      i % 4 === 0 ? 0.24 + Math.random() * 0.18 : 0.55 + Math.random() * 0.35;
    const wanderAngle = Math.random() * Math.PI * 2;

    particles.push({
      x: start.x,
      y: start.y,
      prevX: start.x,
      prevY: start.y,
      vx: Math.cos(wanderAngle) * 32,
      vy: Math.sin(wanderAngle) * 32,
      startX: start.x,
      startY: start.y,
      ctrlX,
      ctrlY,
      tx,
      ty,
      hasTarget: target !== null,
      isTemp,
      launchMs,
      flightMs,
      driftVx: (Math.random() - 0.5) * 14,
      driftVy: (Math.random() - 0.5) * 14,
      size: getIntroSizeForWidth(width),
      introSize: getIntroSizeForWidth(width),
      baseSize: 4 + (i % 4) * 1.4,
      colorIndex: target ? target.colorIndex : defaultColor,
      opacity: target ? 0.85 : baseOpacity,
      baseOpacity,
      angle: Math.atan2(dy, dx) + Math.PI / 2,
      wanderAngle,
    });
  }

  return particles;
}

export function createAmbientParticles(
  count: number,
  width: number,
  height: number
): SwarmParticle[] {
  const particles: SwarmParticle[] = [];
  for (let i = 0; i < count; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const wanderAngle = Math.random() * Math.PI * 2;
    const speed = 28 + Math.random() * 34;
    const roll = i % 10;
    const colorIndex: 0 | 1 | 2 = roll < 5 ? 0 : roll < 8 ? 2 : 1;
    const baseOpacity =
      i % 4 === 0 ? 0.24 + Math.random() * 0.18 : 0.55 + Math.random() * 0.35;

    particles.push({
      x,
      y,
      prevX: x,
      prevY: y,
      vx: Math.cos(wanderAngle) * speed,
      vy: Math.sin(wanderAngle) * speed,
      startX: x,
      startY: y,
      ctrlX: x,
      ctrlY: y,
      tx: x,
      ty: y,
      hasTarget: false,
      isTemp: false,
      launchMs: 0,
      flightMs: 0,
      driftVx: 0,
      driftVy: 0,
      size: 4 + (i % 4) * 1.4,
      introSize: 4 + (i % 4) * 1.4,
      baseSize: 4 + (i % 4) * 1.4,
      colorIndex,
      opacity: baseOpacity,
      baseOpacity,
      angle: wanderAngle + Math.PI / 2,
      wanderAngle,
    });
  }
  return particles;
}

function easeOutCubic(t: number): number {
  const inv = 1 - t;
  return 1 - inv * inv * inv;
}

const LANDED_ANGLE = (-20 * Math.PI) / 180;

export function stepIntroTween(
  particles: SwarmParticle[],
  elapsedMs: number
) {
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    if (!p.hasTarget) {
      // Gentle ambient drift for non-target particles
      const sec = elapsedMs / 1000;
      p.x = p.startX + p.driftVx * sec;
      p.y = p.startY + p.driftVy * sec;
      p.prevX = p.x;
      p.prevY = p.y;
      p.angle = Math.atan2(p.driftVy, p.driftVx) + Math.PI / 2;
      continue;
    }

    if (elapsedMs < p.launchMs) {
      // Waiting at edge with slow drift
      const sec = elapsedMs / 1000;
      p.x = p.startX + p.driftVx * sec * 0.35;
      p.y = p.startY + p.driftVy * sec * 0.35;
      p.prevX = p.x;
      p.prevY = p.y;
      p.size = p.introSize * 0.85;
      p.opacity = 0.72;
      p.angle = Math.atan2(p.ty - p.y, p.tx - p.x) + Math.PI / 2;
      continue;
    }

    const flightElapsed = elapsedMs - p.launchMs;
    if (flightElapsed < p.flightMs) {
      // Quadratic Bezier flight from current drifted start to target
      const rawT = flightElapsed / p.flightMs;
      const u = easeOutCubic(rawT);
      const oneMinusU = 1 - u;

      const x =
        oneMinusU * oneMinusU * p.startX +
        2 * oneMinusU * u * p.ctrlX +
        u * u * p.tx;
      const y =
        oneMinusU * oneMinusU * p.startY +
        2 * oneMinusU * u * p.ctrlY +
        u * u * p.ty;

      // Tangent along Bezier curve
      const dxdt =
        2 * oneMinusU * (p.ctrlX - p.startX) + 2 * u * (p.tx - p.ctrlX);
      const dydt =
        2 * oneMinusU * (p.ctrlY - p.startY) + 2 * u * (p.ty - p.ctrlY);

      p.x = x;
      p.y = y;
      p.prevX = x;
      p.prevY = y;
      p.angle = Math.atan2(dydt, dxdt) + Math.PI / 2;
      p.size = p.introSize;
      p.opacity = 0.95;
      continue;
    }

    // Landed: 180ms tap scale (1.0 -> 1.5 -> 1.0), then settle with 0.4px jitter
    const arrivedMs = flightElapsed - p.flightMs;
    const tapPulse =
      arrivedMs < 180 ? 1 + 0.5 * Math.sin((arrivedMs / 180) * Math.PI) : 1;

    p.x = p.tx + (Math.random() - 0.5) * 0.8;
    p.y = p.ty + (Math.random() - 0.5) * 0.8;
    p.prevX = p.x;
    p.prevY = p.y;
    p.size = p.introSize * tapPulse;
    p.angle = LANDED_ANGLE;
    p.opacity = 1;
  }
}

const CELL_SIZE = 72;

export function stepSwarm(
  particles: SwarmParticle[],
  width: number,
  height: number,
  dt: number,
  pointer: PointerState,
  grid: Map<number, number[]>,
  isMelting: boolean
): boolean {
  let countChanged = false;

  if (isMelting || particles.some((p) => p.isTemp)) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      if (p.isTemp) {
        p.opacity -= dt * 1.55;
        if (p.opacity <= 0.02) {
          particles.splice(i, 1);
          countChanged = true;
          continue;
        }
      } else {
        p.size += (p.baseSize - p.size) * Math.min(1, dt * 3.5);
        p.opacity += (p.baseOpacity - p.opacity) * Math.min(1, dt * 3.5);
      }
    }
  }

  grid.clear();
  const cols = Math.max(1, Math.ceil(width / CELL_SIZE));

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    const cx = Math.max(0, Math.min(cols - 1, Math.floor(p.x / CELL_SIZE)));
    const cy = Math.max(0, Math.floor(p.y / CELL_SIZE));
    const key = cy * cols + cx;
    let bucket = grid.get(key);
    if (!bucket) {
      bucket = [];
      grid.set(key, bucket);
    }
    bucket.push(i);
  }

  const maxSpeed = pointer.down ? 360 : 185;
  const minSpeed = 24;

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.prevX = p.x;
    p.prevY = p.y;

    p.wanderAngle += (Math.random() - 0.5) * 2.4 * dt;
    let ax = Math.cos(p.wanderAngle) * 32;
    let ay = Math.sin(p.wanderAngle) * 32;

    const cx = Math.max(0, Math.min(cols - 1, Math.floor(p.x / CELL_SIZE)));
    const cy = Math.max(0, Math.floor(p.y / CELL_SIZE));

    let sepX = 0;
    let sepY = 0;
    let aliX = 0;
    let aliY = 0;
    let cohX = 0;
    let cohY = 0;
    let neighbors = 0;

    for (let oy = -1; oy <= 1; oy++) {
      for (let ox = -1; ox <= 1; ox++) {
        const bucket = grid.get((cy + oy) * cols + (cx + ox));
        if (!bucket) continue;
        for (let k = 0; k < bucket.length; k++) {
          const j = bucket[k];
          if (j === i) continue;
          const other = particles[j];
          const dx = p.x - other.x;
          const dy = p.y - other.y;
          const distSq = dx * dx + dy * dy;
          if (distSq > 0 && distSq < 70 * 70) {
            const dist = Math.sqrt(distSq);
            if (dist < 32) {
              sepX += (dx / dist) * ((32 - dist) / 32);
              sepY += (dy / dist) * ((32 - dist) / 32);
            }
            aliX += other.vx;
            aliY += other.vy;
            cohX += other.x;
            cohY += other.y;
            neighbors++;
          }
        }
      }
    }

    if (neighbors > 0) {
      ax += sepX * 165;
      ay += sepY * 165;
      ax += (aliX / neighbors - p.vx) * 0.9;
      ay += (aliY / neighbors - p.vy) * 0.9;
      ax += (cohX / neighbors - p.x) * 0.35;
      ay += (cohY / neighbors - p.y) * 0.35;
    }

    if (pointer.active) {
      const dx = p.x - pointer.x;
      const dy = p.y - pointer.y;
      const dist = Math.hypot(dx, dy) || 1;

      if (pointer.down) {
        const pullRadius = 320;
        if (dist < pullRadius) {
          const factor = 1 - dist / pullRadius;
          const nx = -dx / dist;
          const ny = -dy / dist;
          ax += nx * 560 * factor + -ny * 420 * factor;
          ay += ny * 560 * factor + nx * 420 * factor;
        }
      } else {
        const repelRadius = 140;
        if (dist < repelRadius) {
          const factor = (repelRadius - dist) / repelRadius;
          ax += (dx / dist) * 680 * factor;
          ay += (dy / dist) * 680 * factor;
        }
      }
    }

    p.vx += ax * dt;
    p.vy += ay * dt;
    p.vx *= 0.985;
    p.vy *= 0.985;

    const speed = Math.hypot(p.vx, p.vy);
    if (speed > maxSpeed) {
      p.vx = (p.vx / speed) * maxSpeed;
      p.vy = (p.vy / speed) * maxSpeed;
    } else if (speed < minSpeed && speed > 0.01) {
      p.vx = (p.vx / speed) * minSpeed;
      p.vy = (p.vy / speed) * minSpeed;
    }

    p.x += p.vx * dt;
    p.y += p.vy * dt;

    const pad = 16;
    if (p.x < -pad) {
      p.x = width + pad;
      p.prevX = p.x;
    } else if (p.x > width + pad) {
      p.x = -pad;
      p.prevX = p.x;
    }
    if (p.y < -pad) {
      p.y = height + pad;
      p.prevY = p.y;
    } else if (p.y > height + pad) {
      p.y = -pad;
      p.prevY = p.y;
    }

    if (speed > 4) {
      p.angle = Math.atan2(p.vy, p.vx) + Math.PI / 2;
    }
  }

  return countChanged;
}

export function applyBurstOnRelease(
  particles: SwarmParticle[],
  px: number,
  py: number
) {
  const radius = 240;
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    const dx = p.x - px;
    const dy = p.y - py;
    const dist = Math.hypot(dx, dy) || 1;
    if (dist < radius) {
      const strength = ((radius - dist) / radius) * 280;
      p.vx += (dx / dist) * strength;
      p.vy += (dy / dist) * strength;
    }
  }
}

export function drawSwarmParticles(
  ctx: CanvasRenderingContext2D,
  particles: SwarmParticle[],
  palette: SwarmPalette,
  dpr: number,
  allowTrails: boolean
) {
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    if (p.opacity <= 0.01) continue;
    const color = palette.colors[p.colorIndex];

    // Short, subtle trails ONLY in ambient phase (never during intro)
    if (allowTrails) {
      const dx = p.x - p.prevX;
      const dy = p.y - p.prevY;
      const dist = Math.hypot(dx, dy);
      if (dist > 1.8 && dist < 40) {
        const trailLen = Math.min(12, dist * 3.5);
        const ux = dx / dist;
        const uy = dy / dist;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.globalAlpha = Math.min(0.24, p.opacity * 0.3);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(p.x - ux * trailLen, p.y - uy * trailLen);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
    }

    const s = p.size;
    ctx.setTransform(dpr, 0, 0, dpr, p.x * dpr, p.y * dpr);
    ctx.rotate(p.angle);
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.lineTo(s * 0.72, s * 0.85);
    ctx.lineTo(0, s * 0.42);
    ctx.lineTo(-s * 0.72, s * 0.85);
    ctx.closePath();
    ctx.fill();
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.globalAlpha = 1;
}
