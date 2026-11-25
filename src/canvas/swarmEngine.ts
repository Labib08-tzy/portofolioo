export interface SwarmParticle {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  vx: number;
  vy: number;
  size: number;
  colorIndex: 0 | 1 | 2;
  opacity: number;
  angle: number;
  wanderAngle: number;
}

export interface SwarmPalette {
  colors: [string, string, string];
}

export interface PointerState {
  x: number;
  y: number;
  active: boolean;
  down: boolean;
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

export function createSwarmParticles(
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
    // Mix of dim background particles and bright foreground ones for depth
    const opacity =
      i % 4 === 0 ? 0.22 + Math.random() * 0.18 : 0.55 + Math.random() * 0.35;

    particles.push({
      x,
      y,
      prevX: x,
      prevY: y,
      vx: Math.cos(wanderAngle) * speed,
      vy: Math.sin(wanderAngle) * speed,
      size: 4 + (i % 4) * 1.4,
      colorIndex,
      opacity,
      angle: wanderAngle + Math.PI / 2,
      wanderAngle,
    });
  }
  return particles;
}

const CELL_SIZE = 72;

export function stepSwarm(
  particles: SwarmParticle[],
  width: number,
  height: number,
  dt: number,
  pointer: PointerState,
  grid: Map<number, number[]>
) {
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

    // Gentle wander
    p.wanderAngle += (Math.random() - 0.5) * 2.4 * dt;
    let ax = Math.cos(p.wanderAngle) * 32;
    let ay = Math.sin(p.wanderAngle) * 32;

    // Spatial-grid boids (separation, alignment, weak cohesion)
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

    // Pointer interaction
    if (pointer.active) {
      const dx = p.x - pointer.x;
      const dy = p.y - pointer.y;
      const distSq = dx * dx + dy * dy;
      const dist = Math.sqrt(distSq) || 1;

      if (pointer.down) {
        // Vortex attraction on press & hold
        const pullRadius = 320;
        if (dist < pullRadius) {
          const factor = 1 - dist / pullRadius;
          const nx = -dx / dist;
          const ny = -dy / dist;
          // Tangential swirl + inward pull
          ax += nx * 560 * factor + -ny * 420 * factor;
          ay += ny * 560 * factor + nx * 420 * factor;
        }
      } else {
        // Smooth repulsion within ~140px
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

    // Damping & speed clamp
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

    // Wrap around edges cleanly (avoid trail artifact across screen)
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
    const color = palette.colors[p.colorIndex];
    const speed = Math.hypot(p.vx, p.vy);

    // Thin fading trail for fast particles
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
