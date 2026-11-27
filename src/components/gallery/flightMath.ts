/*
 * Hitungan "terbang menembus foto".
 * Tiap foto punya kedalaman (depth) di sumbu z. Kamera maju dari 0 ke camEnd(n).
 * r = depth - kamera = jarak foto ke kamera. Perspektif sederhana:
 *   skala = 1 / r, posisi layar = posisi dasar / r
 * Jadi foto yang didekati membesar dan menyebar ke tepi layar, lalu lewat di samping kita.
 */

export interface Slot {
  index: number;
  /** posisi dasar, satuan setengah lebar / setengah tinggi layar pada r = 1 */
  x: number;
  y: number;
  depth: number;
  rotate: number;
  /** pengali lebar foto terhadap unit dasar --flight-u */
  size: number;
  /** lebar / tinggi */
  aspect: number;
}

export interface Frame {
  /** geser dalam vw / vh */
  tx: number;
  ty: number;
  scale: number;
  opacity: number;
  blur: number;
}

const GOLDEN_ANGLE = 2.399963;
const ASPECTS = [4 / 5, 1, 3 / 4, 5 / 4, 4 / 5, 4 / 3, 3 / 4, 1];
const ANGLE_OFFSET = 5.8; // dipilih agar 6 foto pertama tersebar seimbang dan tidak bertumpuk
const FIRST_DEPTH = 0.8;
const DEPTH_STEP = 0.32;

const FADE_IN_FAR = 3.4; // r di atas ini: belum terlihat
const FADE_IN_NEAR = 2.2; // r di bawah ini: terlihat penuh
const FADE_OUT_START = 0.5; // r di bawah ini: mulai memudar
const FADE_OUT_END = 0.14; // r di bawah ini: hilang

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (v: number) => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};

/** Sebaran abstrak: sudut emas + radius bervariasi supaya foto tidak berbaris. */
export function buildSlots(count: number): Slot[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = i * GOLDEN_ANGLE + ANGLE_OFFSET;
    const depth = FIRST_DEPTH + i * DEPTH_STEP + (((i * 7) % 5) - 2) * 0.03;
    // Foto yang jauh diberi radius lebih besar supaya di awal scroll kolase tersebar
    // ke seluruh layar (bukan menumpuk di tengah karena perspektif).
    const ring =
      (0.3 + ((i * 0.37) % 1) * 0.55) * Math.min(2, Math.max(1, depth / 1.5));
    return {
      index: i,
      x: Math.cos(angle) * ring,
      y: Math.sin(angle) * ring * 0.78,
      depth,
      rotate: (((i * 37) % 13) - 6) * 1.1,
      size: 0.85 + ((i * 53) % 7) * 0.065,
      aspect: ASPECTS[i % ASPECTS.length],
    };
  });
}

/** Posisi kamera di akhir: sedikit melewati foto terakhir. */
export function camEnd(count: number): number {
  return FIRST_DEPTH + Math.max(0, count - 1) * DEPTH_STEP + 0.3;
}

export function frameAt(slot: Slot, cam: number): Frame {
  const r = slot.depth - cam;
  const rr = Math.max(r, FADE_OUT_END);
  const fadeIn = smooth((FADE_IN_FAR - r) / (FADE_IN_FAR - FADE_IN_NEAR));
  const fadeOut = smooth((r - FADE_OUT_END) / (FADE_OUT_START - FADE_OUT_END));
  // Depth of field: jauh agak kabur, sangat dekat (lewat di depan lensa) kabur juga
  const blurFar = Math.min(5, Math.max(0, (r - 1.8) * 2.2));
  const blurNear = Math.max(0, (0.6 - r) * 14);
  return {
    tx: (slot.x * 50) / rr,
    ty: (slot.y * 50) / rr,
    scale: 1 / rr,
    opacity: fadeIn * fadeOut,
    blur: blurFar + blurNear,
  };
}
