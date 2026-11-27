export interface GalleryPhoto {
  src: string;
  alt: string;
}

/**
 * Foto untuk galeri "terbang menembus foto".
 * Taruh file di public/images/gallery/ dengan nama foto-01.webp, foto-02.webp, dst
 * (atau ganti daftar di bawah). Urutan = urutan foto yang dilewati saat scroll.
 * Kalau file belum ada, tampil kartu kaca kosong sebagai pengganti.
 */
const PHOTO_COUNT = 12;

export const GALLERY_PHOTOS: GalleryPhoto[] = Array.from(
  { length: PHOTO_COUNT },
  (_, i) => ({
    src: `/images/gallery/foto-${String(i + 1).padStart(2, "0")}.webp`,
    alt: "Dokumentasi kegiatan",
  })
);
