const INK_RGB: [number, number, number] = [11, 15, 13];

function parseHex(hex: string): [number, number, number] | null {
  const clean = hex.replace(/^#/, "");
  if (clean.length !== 6) return null;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
  return [r, g, b];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(
  a: [number, number, number],
  b: [number, number, number]
): number {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export const BRAND_COLORS: Record<string, string> = {
  React: "#61DAFB",
  TypeScript: "#3178C6",
  "Tailwind CSS": "#06B6D4",
  GSAP: "#88CE02",
  "Framer Motion": "#0055FF",
  PHP: "#777BB4",
  Laravel: "#FF2D20",
  MySQL: "#4479A1",
  Flutter: "#54C5F8",
  Git: "#F05032",
  Vercel: "#FFFFFF",
};

export function getBrandColor(name: string, fallbackHex = "#D9C7A3"): string {
  const candidate = BRAND_COLORS[name] ?? fallbackHex;
  const rgb = parseHex(candidate);
  if (!rgb) return fallbackHex;

  // Ensure at least ~3:1 contrast against --c-ink (#0B0F0D)
  if (contrastRatio(rgb, INK_RGB) < 3) {
    return "#FFFFFF";
  }
  return candidate;
}
