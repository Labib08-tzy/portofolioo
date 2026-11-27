export interface Geo {
  hx: number; // titik fokus zoom: tengah garis atas huruf "o" (koordinat lokal judul)
  hy: number;
  ox: number; // titik fokus (koordinat stage)
  oy: number;
  vw: number;
  vh: number;
  smax: number; // skala akhir: garis huruf "o" hampir menutupi layar
}

/** Mengukur garis tebal huruf "o" dengan menggambarnya di canvas, jadi akurat untuk font apa pun. */
export function measureStroke(h2: HTMLElement, oSpan: HTMLElement, mark: HTMLElement, wrap: HTMLElement): Geo {
  const cs = getComputedStyle(h2);
  const fs = parseFloat(cs.fontSize);
  const SIZE = 400;
  const X0 = 100;
  const Y0 = 500;

  // perkiraan jika pengukuran canvas gagal
  let focusX = 0.3 * fs;
  let focusAbove = 0.5 * fs; // tinggi titik fokus di atas baseline
  let thick = 0.12 * fs; // tebal garis atas huruf

  try {
    const canvas = document.createElement("canvas");
    canvas.width = 700;
    canvas.height = 700;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (ctx) {
      ctx.font = `${cs.fontWeight} ${SIZE}px ${cs.fontFamily}`;
      ctx.textBaseline = "alphabetic";
      ctx.fillText("o", X0, Y0);
      const m = ctx.measureText("o");
      const cx = Math.round(X0 + (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2);
      const cy = Math.round(Y0 + (m.actualBoundingBoxDescent - m.actualBoundingBoxAscent) / 2);
      const { data, width } = ctx.getImageData(0, 0, 700, 700);
      const ink = (x: number, y: number) => data[(y * width + x) * 4 + 3] > 127;
      if (!ink(cx, cy)) {
        const scan = (dx: number, dy: number) => {
          let n = 0;
          while (n < 390) {
            const x = cx + dx * (n + 1);
            const y = cy + dy * (n + 1);
            if (x < 0 || y < 0 || x >= 700 || y >= 700 || ink(x, y)) break;
            n++;
          }
          return n;
        };
        const hl = scan(-1, 0);
        const hr = scan(1, 0);
        const hu = scan(0, -1);
        const hd = scan(0, 1);
        if (hl + hr > 4 && hu + hd > 4) {
          const cxh = Math.round(cx + (hr - hl) / 2);
          const yFirst = cy - hu - 1; // piksel tinta pertama di atas lubang
          let n = 0;
          while (n < 200 && yFirst - n >= 0 && ink(cxh, yFirst - n)) n++;
          if (n > 2) {
            const k = fs / SIZE;
            focusX = (cxh - X0) * k;
            focusAbove = (Y0 - (yFirst - (n - 1) / 2)) * k;
            thick = n * k;
          }
        }
      }
    }
  } catch {
    // pakai perkiraan di atas
  }

  const hx = oSpan.offsetLeft + focusX;
  const hy = mark.offsetTop - focusAbove;
  const ox = h2.offsetLeft + hx;
  const oy = h2.offsetTop + hy;
  const vw = wrap.clientWidth;
  const vh = wrap.clientHeight;
  const smax = Math.max(8, (0.9 * vh) / thick);
  return { hx, hy, ox, oy, vw, vh, smax };
}

export const DEFAULT_GEO: Geo = { hx: 0, hy: 0, ox: 640, oy: 360, vw: 1280, vh: 720, smax: 60 };
