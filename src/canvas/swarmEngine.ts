export interface SwarmParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx: number;
  ty: number;
  size: number;
  isBrass: boolean;
  angle: number;
}

export interface SwarmPalette {
  sand: string;
  brass: string;
}

export function readSwarmPalette(): SwarmPalette {
  const styles = getComputedStyle(document.documentElement);
  const sand = styles.getPropertyValue("--c-sand").trim() || "currentColor";
  const brass = styles.getPropertyValue("--c-brass").trim() || sand;
  return { sand, brass };
}

export function sampleTextTargets(
  text: string,
  width: number,
  height: number,
  maxParticles: number
): Array<{ x: number; y: number }> {
  const offscreen = document.createElement("canvas");
  offscreen.width = Math.max(1, Math.floor(width));
  offscreen.height = Math.max(1, Math.floor(height));
  const ctx = offscreen.getContext("2d");
  if (!ctx) return [];

  const fontSize = Math.min(width * 0.24, height * 0.42, 230);
  ctx.clearRect(0, 0, offscreen.width, offscreen.height);
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 ${Math.round(fontSize)}px "Space Grotesk", sans-serif`;
  ctx.fillText(text, offscreen.width / 2, offscreen.height * 0.46);

  const imageData = ctx.getImageData(0, 0, offscreen.width, offscreen.height).data;
  const step = Math.max(4, Math.round(Math.sqrt((width * height) / (maxParticles * 6))));
  const points: Array<{ x: number; y: number }> = [];

  for (let y = 0; y < offscreen.height; y += step) {
    for (let x = 0; x < offscreen.width; x += step) {
      const alpha = imageData[(y * offscreen.width + x) * 4 + 3];
      if (alpha > 128) {
        points.push({ x, y });
      }
    }
  }

  // Shuffle and cap to maxParticles
  for (let i = points.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = points[i];
    points[i] = points[j];
    points[j] = tmp;
  }

  return points.slice(0, maxParticles);
}

export function createParticles(
  targets: Array<{ x: number; y: number }>,
  width: number,
  height: number
): SwarmParticle[] {
  return targets.map((target, idx) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 6,
    vy: (Math.random() - 0.5) * 6,
    tx: target.x,
    ty: target.y,
    size: 4.5 + (idx % 3) * 1.1,
    isBrass: idx % 5 === 0,
    angle: -Math.PI / 4,
  }));
}

export function drawCursorShape(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  angle: number,
  color: string
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(size * 0.72, size * 0.85);
  ctx.lineTo(0, size * 0.42);
  ctx.lineTo(-size * 0.72, size * 0.85);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}
