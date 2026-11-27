/*
 * Memperkecil foto besar (mis. dari kamera HP) ke maksimal 1000px lalu menyimpannya sebagai webp ringan.
 * Foto 4000px memakai puluhan MB memori GPU per foto; 12 foto sekaligus membuat scroll berat.
 * Dikerjakan satu per satu supaya memori tidak melonjak. Kalau gagal, pakai berkas asli.
 */
const MAX_SIDE = 1000;
const cache = new Map<string, Promise<string>>();
let chain: Promise<unknown> = Promise.resolve();

async function shrink(src: string): Promise<string> {
  const img = new Image();
  img.decoding = "async";
  img.src = src;
  await img.decode();
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const scale = Math.min(1, MAX_SIDE / Math.max(w, h));
  if (!w || !h || scale >= 1) return src; // sudah kecil, tidak perlu diubah

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return src;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  let blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/webp", 0.85));
  if (!blob || blob.type !== "image/webp") {
    blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.85));
  }
  canvas.width = 0; // lepas memori kanvas
  canvas.height = 0;
  return blob ? URL.createObjectURL(blob) : src;
}

export function lightImage(src: string): Promise<string> {
  let task = cache.get(src);
  if (!task) {
    task = chain.then(() => shrink(src)).catch(() => src);
    chain = task;
    cache.set(src, task);
  }
  return task;
}
