/*
 * Hitungan "terbang menembus foto".
 * Tiap foto punya kedalaman (depth) di sumbu z. Kamera maju dari 0 ke camEnd(slots).
 * r = depth - kamera = jarak foto ke kamera. Perspektif sederhana:
 *   skala = 1 / r, posisi layar = posisi dasar / r
 * Jadi foto yang didekati membesar dan menyebar ke tepi layar, lalu lewat di samping kita.
 */

export interface Slot {
  index: number;
  /** foto di luar kolase referensi: posisi dalam satuan setengah lebar / setengah tinggi layar pada r = 1 */
  x: number;
  y: number;
  depth: number;
  rotate: number;
  /** pengali lebar foto (hanya untuk foto di luar kolase referensi) */
  size: number;
  /** lebar / tinggi */
  aspect: number;
  /** foto kolase referensi: posisi (x, y) dan lebar (w) dalam satuan vw */
  ref?: { x: number; y: number; w: number };
}

export interface Frame {
  /** 1 / jarak: pengali untuk posisi dan skala */
  inv: number;
  opacity: number;
}

export interface Base {
  /** posisi dasar dalam px dari tengah layar, saat r = 1 */
  bx: number;
  by: number;
  /** lebar foto dalam px pada skala 1 */
  width: number;
}

const GOLDEN_ANGLE = 2.399963;
const ASPECTS = [4 / 5, 1, 3 / 4, 5 / 4, 4 / 5, 4 / 3, 3 / 4, 1];
const ANGLE_OFFSET = 5.8; // dipilih agar foto di luar kolase referensi tersebar seimbang
const DEPTH_STEP = 0.32;

/*
 * 8 foto pertama ditata mengikuti referensi: kolase abstrak (besar-kecil, miring, saling menimpa).
 * x, y : posisi pusat foto dalam vw dari tengah layar, saat foto tepat di jarak r = 1
 * w    : lebar foto dalam vw
 * Kedalamannya sengaja berdekatan, jadi ketika kamera mendekat susunannya terlihat seperti referensi.
 * Di awal scroll foto-foto ini masih jauh (kecil dan menumpuk di tengah), lalu menyebar dan lewat.
 */
const REFERENCE = [
  { x: -3.5, y: 5.4, w: 9.7, aspect: 4 / 5, rotate: -2 },
  { x: 11, y: 8.2, w: 13.6, aspect: 6 / 7, rotate: 4 },
  { x: 3.5, y: -8.5, w: 14, aspect: 4 / 5, rotate: 3 },
  { x: -22, y: 9.4, w: 16.8, aspect: 7 / 8, rotate: -3 },
  { x: 27, y: 0, w: 18, aspect: 4 / 5, rotate: 3 },
  { x: -8, y: -6.5, w: 8, aspect: 3 / 4, rotate: -5 },
  { x: -20, y: -4.6, w: 11.7, aspect: 4 / 3, rotate: -4 },
  { x: 16.7, y: -6.4, w: 7.6, aspect: 3 / 4, rotate: -6 },
];
const REF_FIRST_DEPTH = 2.6;
const REF_DEPTH_STEP = 0.1;

const FADE_IN_FAR = 3.4; // r di atas ini: belum terlihat
const FADE_IN_NEAR = 2.2; // r di bawah ini: terlihat penuh
const FADE_OUT_START = 0.5; // r di bawah ini: mulai memudar
const FADE_OUT_END = 0.14; // r di bawah ini: hilang

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (v: number) => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};

/** 8 foto pertama mengikuti kolase referensi; sisanya disebar abstrak (sudut emas) di belakangnya. */
export function buildSlots(count: number): Slot[] {
  const lastRefDepth = REF_FIRST_DEPTH + (REFERENCE.length - 1) * REF_DEPTH_STEP;
  return Array.from({ length: count }, (_, i) => {
    if (i < REFERENCE.length) {
      const r = REFERENCE[i];
      return {
        index: i,
        x: 0,
        y: 0,
        depth: REF_FIRST_DEPTH + i * REF_DEPTH_STEP,
        rotate: r.rotate,
        size: 1,
        aspect: r.aspect,
        ref: { x: r.x, y: r.y, w: r.w },
      };
    }
    const k = i - REFERENCE.length;
    const angle = i * GOLDEN_ANGLE + ANGLE_OFFSET;
    const depth = lastRefDepth + 0.5 + k * DEPTH_STEP + (((i * 7) % 5) - 2) * 0.03;
    const ring = (0.3 + ((i * 0.37) % 1) * 0.55) * Math.min(2, Math.max(1, depth / 1.5));
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
export function camEnd(slots: Slot[]): number {
  return slots.reduce((m, s) => Math.max(m, s.depth), 0) + 0.3;
}

/**
 * Posisi dasar dan lebar foto dalam px untuk ukuran layar tertentu.
 * Di layar potret (HP) kolase dilebarkan/ditinggikan dan foto diperbesar supaya enak dilihat.
 */
export function baseFor(slot: Slot, vw: number, vh: number): Base {
  const portrait = vh > vw * 1.05;
  if (slot.ref) {
    const ux = portrait ? vw * 0.0125 : vw * 0.01;
    const uy = portrait ? vh * 0.013 : vw * 0.01;
    const sz = portrait ? ux * 1.7 : ux;
    return { bx: slot.ref.x * ux, by: slot.ref.y * uy, width: slot.ref.w * sz };
  }
  const u = portrait ? vw * 0.34 : Math.max(Math.min(vw, vh) * 0.22, vw * 0.16);
  return { bx: slot.x * vw * 0.5, by: slot.y * vh * 0.5, width: slot.size * u };
}

export function frameAt(slot: Slot, cam: number): Frame {
  const r = slot.depth - cam;
  const inv = 1 / Math.max(r, FADE_OUT_END);
  const fadeIn = smooth((FADE_IN_FAR - r) / (FADE_IN_FAR - FADE_IN_NEAR));
  const fadeOut = smooth((r - FADE_OUT_END) / (FADE_OUT_START - FADE_OUT_END));
  return { inv, opacity: fadeIn * fadeOut };
}
