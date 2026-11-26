export interface SwarmParticle {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  vx: number;
  vy: number;
  tx: number;
  ty: number;
  hasTarget: boolean;
  isTemp: boolean;
  staggerMs: number;
  swirlSign: number;
  size: number;
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
  if (width < 640) return 80;
  if (width < 1024) return 140;
  return 220;
}

export function getIntroTargetCountForWidth(width: number): number {
  if (width < 640) return 380;
  if (width < 1024) return 600;
  return 900;
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

  for (const line of lines) {
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
      ctx.lineWidth = 2.2;
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
    if (regionW <= 0 || regionH <= 0) continue;

    const data = ctx.getImageData(minX, minY, regionW, regionH).data;
    const step = line.outline ? 3 : 5;

    for (let y = 0; y < regionH; y += step) {
      for (let x = 0; x < regionW; x += step) {
        const alpha = data[(y * regionW + x) * 4 + 3];
        if (alpha > 128) {
          const jitterX = (Math.random() - 0.5) * 1.8;
          const jitterY = (Math.random() - 0.5) * 1.8;
          const colorIndex: 0 | 1 | 2 = line.outline
            ? Math.random() < 0.8 ? 1 : 0
            : Math.random() < 0.82 ? 0 : 2;
          allPoints.push({
            x: minX + x + jitterX,
            y: minY + y + jitterY,
            colorIndex,
          });
        }
      }
    }
  }

  // Shuffle
  for (let i = allPoints.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = allPoints[i];
    allPoints[i] = allPoints[j];
    allPoints[j] = tmp;
  }

  return allPoints.slice(0, maxTargets);
}

export function createIntroParticles(
  targets: SampledTarget[],
  normalCount: number,
  width: number,
  height: number
): SwarmParticle[] {
  const total = Math.max(normalCount, targets.length);
  const particles: SwarmParticle[] = [];

  for (let i = 0; i < total; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const wanderAngle = Math.random() * Math.PI * 2;
    const speed = 28 + Math.random() * 34;
    const target = i < targets.length ? targets[i] : null;
    const isTemp = i >= normalCount;

    const roll = i % 10;
    const defaultColor: 0 | 1 | 2 = roll < 5 ? 0 : roll < 8 ? 2 : 1;
    const baseOpacity =
      i % 4 === 0 ? 0.24 + Math.random() * 0.18 : 0.55 + Math.random() * 0.35;

    particles.push({
      x,
      y,
      prevX: x,
      prevY: y,
      vx: Math.cos(wanderAngle) * speed,
      vy: Math.sin(wanderAngle) * speed,
      tx: target ? target.x : x,
      ty: target ? target.y : y,
      hasTarget: target !== null,
      isTemp,
      staggerMs: Math.random() * 600,
      swirlSign: i % 2 === 0 ? 1 : -1,
      size: 5.2,
      baseSize: 4 + (i % 4) * 1.4,
      colorIndex: target ? target.colorIndex : defaultColor,
      opacity: target ? 1 : baseOpacity,
      baseOpacity,
      angle: wanderAngle + Math.PI / 2,
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
  return createIntroParticles([], count, width, height);
}

export function stepIntroGatherHold(
  particles: SwarmParticle[],
  elapsedMs: number,
  dt: number,
  pointer: PointerState,
  isHoldPhase: boolean
) {
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.prevX = p.x;
    p.prevY = p.y;

    if (!p.hasTarget) {
      // Non-target ambient particle
      p.wanderAngle += (Math.random() - 0.5) * 2 * dt;
      p.x += Math.cos(p.wanderAngle) * 28 * dt;
      p.y += Math.sin(p.wanderAngle) * 28 * dt;
      p.angle = p.wanderAngle + Math.PI / 2;
      continue;
    }

    if (elapsedMs < p.staggerMs) {
      p.wanderAngle += (Math.random() - 0.5) * 2 * dt;
      p.x += Math.cos(p.wanderAngle) * 34 * dt;
      p.y += Math.sin(p.wanderAngle) * 34 * dt;
      p.angle = p.wanderAngle + Math.PI / 2;
      continue;
    }

    const dx = p.tx - p.x;
    const dy = p.ty - p.y;
    const dist = Math.hypot(dx, dy);

    // Curved/swirling path while far from target, decaying to crisp arrival
    const swirlWeight = Math.min(1, dist / 180) * 0.42 * p.swirlSign;
    const fx = dx - dy * swirlWeight;
    const fy = dy + dx * swirlWeight;

    const springK = isHoldPhase ? 26 : 16;
    p.vx += fx * springK * dt;
    p.vy += fy * springK * dt;

    // Gentle pointer repel during intro (radius ~80px)
    if (pointer.active) {
      const mdx = p.x - pointer.x;
      const mdy = p.y - pointer.y;
      const mDist = Math.hypot(mdx, mdy) || 1;
      if (mDist < 80) {
        const push = ((80 - mDist) / 80) * 420;
        p.vx += (mdx / mDist) * push * dt;
        p.vy += (mdy / mDist) * push * dt;
      }
    }

    p.vx *= 0.82;
    p.vy *= 0.82;
    p.x += p.vx;
    p.y += p.vy;

    if (isHoldPhase && dist < 4) {
      p.x += (Math.random() - 0.5) * 0.5;
      p.y += (Math.random() - 0.5) * 0.5;
    }

    const speed = Math.hypot(p.vx, p.vy);
    if (dist > 6 && speed > 0.35) {
      p.angle = Math.atan2(p.vy, p.vx) + Math.PI / 2;
    } else {
      p.angle += (-Math.PI / 6 - p.angle) * Math.min(1, dt * 10);
    }

    p.size += (5.4 - p.size) * Math.min(1, dt * 8);
    p.opacity += (1 - p.opacity) * Math.min(1, dt * 8);
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
) {
  // Fade temporary extra particles during melt and restore normal baseSize/baseOpacity
  if (isMelting || particles.some((p) => p.isTemp)) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      if (p.isTemp) {
        p.opacity -= dt * 1.45;
        if (p.opacity <= 0.02) {
          particles.splice(i, 1);
          continue;
        }
      } else {
        p.size += (p.baseSize - p.size) * Math.min(1, dt * 3);
        p.opacity += (p.baseOpacity - p.opacity) * Math.min(1, dt * 3);
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
      const distSq = dx * dx + dy * dy;
      const dist = Math.sqrt(distSq) || 1;

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
  palette: SwarmPalette
) {
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    if (p.opacity <= 0.01) continue;
    const color = palette.colors[p.colorIndex];
    const speed = Math.hypot(p.vx, p.vy);

    if (speed > 95) {
      ctx.save();
      ctx.globalAlpha = Math.min(0.45, p.opacity * 0.55);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.moveTo(p.prevX - p.vx * 0.025, p.prevY - p.vy * 0.025);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.globalAlpha = p.opacity;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    ctx.beginPath();
    ctx.moveTo(0, -p.size);
    ctx.lineTo(p.size * 0.72, p.size * 0.85);
    ctx.lineTo(0, p.size * 0.42);
    ctx.lineTo(-p.size * 0.72, p.size * 0.85);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }
}
