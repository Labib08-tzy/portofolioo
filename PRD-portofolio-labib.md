# PRD — Portofolio "LABIB"

> Dokumen ini adalah sumber kebenaran untuk agent di Antigravity. Baca seluruhnya sebelum menulis kode. Jika ada konflik antara dokumen ini dan asumsi agent, dokumen ini yang menang. Tanda `TODO` berarti data asli belum ada: pakai placeholder yang jelas, jangan mengarang.

---

## 1. Ringkasan

**Produk:** situs portofolio pribadi satu halaman (single page) untuk Mohammad Labib Nayla Fahmi (Abi), siswa RPL SMK Umar Fatah Rembang.

**Peran yang ditampilkan:** Creative Developer / Full-Stack Developer.

**Tujuan utama:** membuat rekruter, calon klien, atau dosen berpikir "orang ini serius dan bisa dipercaya" dalam 10 detik pertama, lalu memberi bukti lewat project nyata.

**Target audiens:** `TODO` (pilih: magang/kerja, freelance, kuliah). Default: magang/kerja di bidang web.

**Arah desain:** struktur brutalist (tipografi besar, grid tegas, border keras, tanpa template umum) dengan suasana sinematik hangat-dingin dari palet baru (hijau gelap, krem, emas kuningan). Latar punya cahaya ambient amber di satu sisi dan emerald di sisi lain.

**Referensi:** tutorial YouTube website portofolio beranimasi scroll. Teknik yang ditiru: urutan gambar (image sequence) yang berganti frame mengikuti scroll, preloader sebelum konten tampil, dan animasi landing dengan Framer Motion. Semua kode ditulis sendiri, bukan menyalin source code pihak lain.

---

## 2. Sasaran dan Metrik Keberhasilan

| Sasaran | Metrik |
|---|---|
| Terasa premium dan unik | Tidak mirip template umum; ada 1 momen "wow" di hero |
| Cepat dan stabil | Lighthouse Performance ≥ 90 (desktop) dan ≥ 80 (mobile) |
| Aksesibel | Lighthouse Accessibility ≥ 95; kontras teks lolos WCAG AA |
| Meyakinkan | Minimal 2 project selesai dengan studi kasus, ada link demo/repo |
| Mudah dihubungi | CTA kontak terlihat tanpa scroll jauh; tombol unduh CV |

---

## 3. Design System

### 3.1 Palet warna (token wajib)

| Token | Hex | Peran |
|---|---|---|
| `--c-ink` | `#0B0F0D` | Background utama (hitam kehijauan) |
| `--c-forest-900` | `#1F2A1F` | Permukaan kartu, panel, navbar |
| `--c-forest-600` | `#3E5A3F` | Border, garis timeline, hover surface |
| `--c-sage` | `#8CA98C` | Teks sekunder, ikon, label |
| `--c-sand` | `#D9C7A3` | Teks utama, judul besar |
| `--c-brass` | `#B08D57` | Aksen utama: CTA, highlight, status penting |

Aturan pemakaian:
- Teks utama: `--c-sand` di atas `--c-ink`. Teks sekunder: `--c-sage`.
- `--c-forest-600` **hanya untuk border/dekorasi**, bukan teks (kontrasnya rendah di atas background gelap).
- `--c-brass` untuk satu aksi utama per layar (CTA, hover penting). Jangan dipakai berlebihan.
- Tidak boleh menambah warna di luar tabel ini, kecuali turunan opacity dari warna di atas.
- Glow ambient: radial gradient `--c-brass` (kiri/bawah) dan `#3FBF9A` dengan opacity rendah (kanan/atas), hanya sebagai dekorasi background di hero. Boleh memakai warna glow ini hanya untuk efek cahaya, bukan untuk teks atau UI.

### 3.2 Implementasi token

Definisikan sebagai CSS variables di `src/styles/tokens.css` dan petakan ke Tailwind.

```css
:root {
  --c-ink: #0b0f0d;
  --c-forest-900: #1f2a1f;
  --c-forest-600: #3e5a3f;
  --c-sage: #8ca98c;
  --c-sand: #d9c7a3;
  --c-brass: #b08d57;
}
```

- Tailwind v4: daftarkan di blok `@theme` (mis. `--color-ink`, `--color-sand`, dst.).
- Tailwind v3: daftarkan di `theme.extend.colors` pada `tailwind.config.ts`.
- Dilarang hardcode hex di komponen; selalu pakai token.

### 3.3 Tipografi

- Display (judul raksasa): font grotesk/condensed tebal, `TODO: pilih` (rekomendasi: "Space Grotesk", "Unbounded", atau "Anton"). Ukuran fluid dengan `clamp()`.
- Body: sans-serif bersih (rekomendasi: "Inter" atau "DM Sans").
- Mono untuk label kecil, tahun, status: "JetBrains Mono" atau "IBM Plex Mono".
- Muat font lewat `@fontsource` atau self-host; gunakan `font-display: swap`.

### 3.4 Bentuk dan komponen

- Elemen interaktif (tombol, tag, chip status) berbentuk **pill** (`rounded-full`), terinspirasi dari referensi palet.
- Kartu dan jendela project: sudut tegas atau radius kecil, border 1px `--c-forest-600`, bayangan keras (offset solid) ala brutalist.
- Grid 12 kolom, garis grid tipis opsional sebagai dekorasi.
- Spasi konsisten kelipatan 4/8px.

---

## 4. Animasi dan Motion

### 4.1 Hero: cursor swarm (WAJIB DIPERTAHANKAN)

- Canvas 2D berisi banyak kursor kecil yang bergerak sebagai swarm.
- Urutan: swarm berkeliaran → berkumpul membentuk teks **"LABIB"** → lalu "menyusun" antarmuka (judul, role, navigasi muncul).
- Swarm bereaksi pada pergerakan mouse/touch (tertarik atau menghindar, pilih satu dan konsisten).
- Warna kursor memakai token palet (utama `--c-sand`, sebagian `--c-brass`).
- Performa: gunakan `requestAnimationFrame`, hentikan loop saat tab tidak aktif atau hero keluar viewport (`IntersectionObserver`), batasi jumlah partikel berdasar ukuran layar (mobile lebih sedikit), perhatikan `devicePixelRatio`.
- Fallback: jika `prefers-reduced-motion: reduce`, tampilkan teks "LABIB" statis tanpa swarm. Di mobile low-end, kurangi jumlah partikel atau pakai versi statis.

### 4.2 Animasi sumber (GIF hasil konversi)

- Sumber: GIF 9 adegan (431x378 px) yang sudah diekstrak menjadi **97 frame WebP** berwarna hijau sesuai palet (`frames-halus-hijau`). GIF/video **tidak diputar langsung di halaman**.
- Isi adegan (indeks frame 1-97 di set halus): menoleh (1-25), wajah menghadap depan (25-37), HUD muncul (37-49), sinar scan melintas di mata (49-61), mata menyala (61-73), mata menutup (73-85), berbalik membelakangi (85-97).
- Frame ke-73 (mata menyala) dipakai sebagai poster dan fallback reduced-motion.

### 4.3 Motion umum

- Reveal saat scroll (GSAP ScrollTrigger atau Framer Motion `whileInView`), sekali saja, durasi 0.5–0.8s, easing halus.
- Jendela project mengambang (parallax ringan + hover lift).
- Timeline experience: garis tergambar saat scroll.
- Transisi antar section halus; tidak ada animasi yang memblokir interaksi.
- Semua animasi **wajib** menghormati `prefers-reduced-motion` (matikan atau ganti dengan fade sederhana).

### 4.4 Eye Scan: scroll menggerakkan frame + reveal informasi (WAJIB)

Teknik mengikuti tutorial referensi: animasi diubah menjadi urutan gambar, lalu posisi scroll dipetakan ke nomor frame. Terasa seperti video yang bisa di-scrub, padahal hanya gambar yang berganti. Scroll ke atas membalik animasinya.

Adegan scan mata **sudah ada di dalam frame** (sinar scan melintas, lalu mata menyala). Jangan menambah garis scan buatan di atasnya.

**Alur (satu scroll track, `SCAN_END_FRAME = 73`):**

| Progress scroll | Yang terjadi |
|---|---|
| 0-65% | Frame 1 sampai 73 berganti mengikuti scroll: menoleh, HUD muncul, scan, mata menyala |
| 65-75% | Tahan di frame 73 (mata menyala); opsional zoom sangat pelan; label mono kecil "SCAN COMPLETE" |
| 75-100% | Panel informasi tentang Abi muncul bertahap (stagger) |

Frame 74-97 (mata menutup, berbalik) **tidak dipakai** kecuali opsi transisi keluar disetujui (lihat pertanyaan terbuka). Setelah 100%, sticky dilepas dan halaman lanjut ke section berikutnya.

**Aset frame:**
1. Set yang dipakai: `frames-halus-hijau` (97 frame WebP, 431x378 px, total sekitar 2 MB). Ekstrak ke `public/frames/` dengan nama `frame-0001.webp` sampai `frame-0097.webp`.
2. Nama file wajib berurutan tanpa lompatan.
3. Jika perlu membuat ulang dari sumber lain: `ffmpeg -i sumber.mp4 -vf "fps=24,scale=1280:-2" -c:v libwebp -quality 75 public/frames/frame-%04d.webp`.
4. Konfigurasi di `src/data/site.ts`: `TOTAL_FRAMES = 97`, `SCAN_END_FRAME = 73`, `frameSrc(i)`. Jangan hardcode angka ini di komponen.
5. Resolusi sumber rendah. Jika ada versi lebih tajam, ganti set frame tanpa mengubah kode.

**Tampilan:**
- Gambar **tidak** dibentangkan layar penuh (akan buram). Tampilkan di tengah sebagai bingkai: lebar `min(90vw, 720px)`, rasio asli 431:378, border 1px `--c-forest-600`, bayangan keras offset ala brutalist.
- Latar section memakai cahaya ambient (amber di satu sisi, emerald di sisi lain) dan tekstur noise halus agar blur tidak terlihat.
- Desktop: panel info di sebelah kanan bingkai. Mobile: panel di bawah bingkai. Panel tidak boleh menutupi wajah.

**Implementasi (Vite + React + Framer Motion):**
- Container scroll track `height: 400vh` (mobile 250-300vh). Di dalamnya elemen `position: sticky; top: 0; height: 100vh` berisi bingkai canvas dan panel info.
- `useScroll({ target: containerRef, offset: ["start start", "end end"] })` menghasilkan `scrollYProgress`.
- `useTransform(scrollYProgress, [0, 0.65], [0, SCAN_END_FRAME - 1])` menghasilkan indeks frame (0-based). Bulatkan saat menggambar.
- Gambar frame ke `<canvas>` lewat `requestAnimationFrame`. **Indeks frame tidak boleh disimpan di React state**; pakai MotionValue supaya tidak rerender setiap scroll.
- Opsional: `useSpring` pada progres untuk memperhalus. Setel stiffness/damping agar tidak terasa tertinggal.
- Canvas mengikuti `devicePixelRatio`; jaga rasio aspek bingkai.
- Preload semua frame ke memori (`Image` + `decode()`) sebelum animasi aktif (lihat 4.5). Jangan memuat frame sambil scroll.
- Panel info mulai muncul saat progres melewati 0.75, dikendalikan `useTransform` agar ikut mundur saat scroll balik. Styling brutalist: border `--c-forest-600`, surface `--c-forest-900` semi-transparan, label mono. Isi dari `profileHud` di `site.ts`: nama, role, sekolah, 3-5 skill utama, 1 pencapaian utama (Juara 3 LKS Web Technology), bio singkat (`TODO`), tombol **Hubungi** dan **Lihat Project**.
- Posisi: setelah Hero, sebelum About (`TODO: konfirmasi`).

**Aksesibilitas dan fallback:**
- Seluruh teks panel ada di DOM sebagai teks asli dan terbaca screen reader. Canvas dekoratif (`aria-hidden`).
- `prefers-reduced-motion`: tanpa sticky dan scroll track; tampilkan frame 73 statis dengan panel sudah terlihat.
- Mobile: track lebih pendek, uji FPS di perangkat nyata. Untuk perangkat low-end, pakai setiap frame ke-2.

### 4.5 Preloader dan animasi landing

- Preloader layar penuh (warna token) menampilkan progres 0-100% (mono, besar) selama semua frame dan aset penting dimuat. Konten situs baru muncul setelah selesai, jadi tidak ada konten yang loncat atau "loading sambil tampil".
- Setelah selesai, preloader keluar (wipe/fade dengan `AnimatePresence`), lalu animasi landing: nav, judul, role, dan CTA hero muncul bertahap (Framer Motion), kemudian swarm "LABIB" mulai (4.1).
- Preload dengan batas konkurensi agar jaringan tidak terbanjiri; sediakan state error yang ramah jika ada frame gagal dimuat.
- Reduced motion: preloader tetap ada tanpa animasi besar, lalu konten langsung tampil.
- Kunjungan berikutnya (cek `sessionStorage`): preloader boleh lebih singkat karena aset sudah di-cache.
- Hosting statis (Vercel). Beri header cache panjang untuk folder `frames/`.


---

## 5. Struktur Halaman dan Konten

Navigasi tetap (sticky): Home, About, Skills, Projects, Achievements, Experience, Contact. Mobile: menu hamburger/overlay. Tombol **Unduh CV** terlihat di nav atau hero.

### 5.1 Hero
- Swarm → "LABIB", role "Creative Developer / Full-Stack Developer", satu kalimat positioning (`TODO: tulis`), 2 CTA: **Lihat Project** (brass, pill) dan **Hubungi Saya** (outline).

### 5.1b Eye Scan
- Section scroll track sesuai bagian 4.4: urutan frame → mata → scan → HUD informasi tentang Abi.

### 5.2 About
- 2–3 paragraf singkat: siapa, belajar apa di RPL, apa yang dicari (`TODO` sesuai target).
- Foto (opsional) `TODO`.
- Fakta ringkas: SMK Umar Fatah Rembang, jurusan RPL, domisili `TODO`.

### 5.3 Skills
- Kelompokkan: Frontend (React, TypeScript, Tailwind, GSAP, Framer Motion), Backend (PHP, Laravel, MySQL), Mobile (Flutter), Tools (Git, Vercel, dll. `TODO`).
- Tampilkan sebagai chip pill, bukan bar persentase (persentase tidak kredibel).

### 5.4 Projects
Setiap project tampil sebagai **jendela browser mengambang** (title bar dengan tiga titik, URL palsu/nama project, area preview). Klik membuka detail/studi kasus.

Data memakai skema di bagian 7. Label status wajib jujur: `Selesai` atau `Dalam pengembangan`.

| Project | Tipe | Status | Catatan |
|---|---|---|---|
| UsahaKu | Android (Flutter) | Selesai | Aplikasi pembukuan UMKM: catat penghasilan, modal, rugi. Featured |
| Google Notes | Web | Selesai | `TODO` stack, deskripsi, link demo/repo. Featured |
| ShowSkill | Web | Dalam pengembangan | `TODO` tujuan dan stack |
| Landing page sewa boardgame | Web | Dalam pengembangan | Landing page layanan sewa boardgame |
| *(Opsional)* Face Biometric Attendance | Web | `TODO` | Proyek PKL; sertakan hanya jika boleh dipublikasikan |
| *(Opsional)* Kopi Den Porro | Web | `TODO` | Website promosi kedai kopi |
| *(Opsional)* Biurope AI Agent | Bot Telegram | `TODO` | Python + Gemini |

Setiap studi kasus berisi: masalah, peran Abi, solusi, stack, hasil/pembelajaran, link demo, link repo, 1–3 screenshot. Item `Dalam pengembangan` cukup versi ringkas.

### 5.5 Achievements
- Kartu: **Juara 3 LKS Web Technology** (tingkat kabupaten, tahun `TODO`) + 2 sertifikat (`TODO` nama, penerbit, tahun, link verifikasi jika ada).
- Dirancang agar mudah menambah item baru lewat data file.

### 5.6 Experience
- Timeline vertikal. Isi awal: PKL (`TODO` instansi, periode, apa yang dikerjakan), kompetisi LKS.
- Hanya cantumkan yang benar-benar terjadi.

### 5.7 Contact
- Email, GitHub, LinkedIn `TODO`. Opsional: form sederhana (mailto atau layanan form).
- Footer: tahun, kredit teknologi, kredit untuk kode/ide pihak lain jika ada.

---

## 6. Tech Stack

- React + Vite + TypeScript (strict)
- Tailwind CSS
- GSAP (+ ScrollTrigger) dan Framer Motion
- Canvas API untuk swarm
- Deploy: Vercel (`TODO` domain kustom)

Aturan teknis:
- Komponen fungsional + hooks; tidak ada `any` tanpa alasan.
- Efek memakai library resmi lewat npm; jangan menyalin kode utuh dari repo tanpa lisensi jelas. Jika mengadaptasi, tulis ulang dan cantumkan kredit.
- Struktur folder:

```
src/
  components/    # Nav, Hero, About, Skills, Projects, Achievements, Experience, Contact, ui/
  canvas/        # SwarmCanvas.tsx, swarm logic
  data/          # projects.ts, achievements.ts, skills.ts, experience.ts, site.ts
  hooks/         # useReducedMotion, useInView, useMediaQuery
  styles/        # tokens.css, globals.css
  assets/
public/
  frames/        # frame-0001.webp, frame-0002.webp, ... (hasil ekstraksi video)
  media/source/  # hero-source.mp4 (bahan saja, tidak dipakai langsung)
  cv/            # cv-labib.pdf (TODO)
```

---

## 7. Model Data

```ts
export type ProjectStatus = "done" | "in-progress";

export interface Project {
  id: string;
  title: string;
  type: "Android" | "Web" | "Bot";
  status: ProjectStatus;
  description: string;
  stack: string[];
  demoUrl?: string;
  repoUrl?: string;
  featured?: boolean;
  caseStudy?: {
    problem: string;
    role: string;
    solution: string;
    result: string;
    images?: string[];
  };
}

export interface Achievement {
  id: string;
  title: string;
  issuer: string;
  year: string;
  kind: "competition" | "certificate";
  link?: string;
}
```

Semua konten diisi lewat file data, bukan hardcode di komponen.

---

## 8. Kebutuhan Non-Fungsional

- **Responsif:** 360px sampai desktop lebar; tidak ada scroll horizontal.
- **Aksesibilitas:** HTML semantik, urutan fokus logis, focus ring terlihat (`--c-brass`), alt text, kontras AA, navigasi keyboard penuh, skip link.
- **Reduced motion:** wajib, lihat bagian 4.
- **SEO:** `<title>`, meta description, Open Graph + Twitter card (gambar OG `TODO`), favicon, `lang="id"`.
- **Performa:** lazy-load gambar dan video, ukuran gambar dioptimalkan (WebP/AVIF), kode di-split bila perlu, hindari layout shift.
- **Bahasa:** konten utama Bahasa Indonesia (`TODO` opsi toggle EN).
- **Privasi:** jangan mencantumkan nomor telepon, alamat rumah, atau data sensitif kecuali diminta.

---

## 9. Aturan Konten (Penting untuk Agent)

1. Jangan mengarang pencapaian, angka, testimoni, atau nama perusahaan.
2. Jika data tidak ada, pakai placeholder yang jelas (`TODO`) dan daftar semuanya di `TODO.md`.
3. Project yang belum selesai wajib berlabel "Dalam pengembangan".
4. Jangan memakai gambar/logo milik pihak lain tanpa izin; pakai placeholder atau mockup buatan sendiri.

---

## 10. Milestone untuk Antigravity

Kerjakan berurutan; setiap fase harus bisa dijalankan (`npm run dev`) dan di-commit sebelum lanjut.

1. **Setup:** Vite + React + TS + Tailwind, token warna, font, struktur folder, layout dasar, nav.
2. **Hero:** `SwarmCanvas` (swarm → "LABIB" → UI), fallback reduced-motion dan mobile.
   - 2b. **Preloader + Eye Scan:** preloader dan preload frame (4.5), sticky 400vh + scroll ke frame (4.4), overlay scan, HUD informasi.
3. **Konten statis:** About, Skills, Contact, footer, dengan data dari `src/data`.
4. **Projects:** jendela browser mengambang, filter/status, halaman/modal studi kasus.
5. **Achievements + Experience:** kartu dan timeline animasi.
6. **Polish motion:** ScrollTrigger/Framer, transisi, hover state.
7. **QA:** Lighthouse, a11y, uji 360px/768px/1280px, uji reduced-motion, cek link.
8. **Deploy:** Vercel, domain, meta/OG, README.

---

## 11. Kriteria Penerimaan

- [ ] Semua warna berasal dari token; tidak ada hex di komponen.
- [ ] Swarm membentuk "LABIB" dan menyusun UI; berhenti saat di luar viewport.
- [ ] Frame berganti mulus mengikuti scroll (tanpa lag setelah preload), berhenti di frame 73 (mata menyala), lalu panel informasi muncul; scroll balik membalik animasinya.
- [ ] Preloader tampil sampai semua frame termuat; konten baru muncul setelah itu.
- [ ] Teks HUD terbaca screen reader; saat reduced-motion tampil statis tanpa pin.
- [ ] Bingkai gambar tidak terdistorsi dan panel tidak menutupi wajah pada 360px, 768px, dan 1280px.
- [ ] Lighthouse Performance ≥ 90 desktop, Accessibility ≥ 95.
- [ ] Tidak ada scroll horizontal di 360px.
- [ ] Semua project punya status yang jujur; tidak ada konten palsu.
- [ ] Semua `TODO` tercatat di `TODO.md`.
- [ ] Bisa tambah project/sertifikat hanya dengan mengedit file data.

---

## 12. Pertanyaan Terbuka (untuk dijawab pemilik)

1. Apakah ada efek lain dari video referensi yang ingin ditambahkan selain yang ada di 4.4 dan 4.5?
2. Isi panel informasi yang ingin ditampilkan, dan apakah frame 74-97 (mata menutup, berbalik) dipakai sebagai transisi keluar.
3. Nama, penerbit, dan tahun 2 sertifikat.
4. Stack, deskripsi, dan link Google Notes; tujuan ShowSkill.
5. Target audiens (magang/kerja, freelance, atau kuliah).
6. Font display pilihan, domain, email/GitHub/LinkedIn, CV.
