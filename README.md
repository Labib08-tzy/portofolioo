# Portofolio LABIB

Situs portofolio pribadi satu halaman untuk **Mohammad Labib Nayla Fahmi (Abi)**, siswa RPL SMK Umar Fatah Rembang — *Creative Developer / Full-Stack Developer*.

## Menjalankan Secara Lokal

```bash
npm install
npm run dev
```

Build produksi dan type-check:

```bash
npm run build
npm run preview
```

## Struktur Folder

```text
public/
  cv/            # File CV (cv-labib.pdf)
  frames/        # 97 frame WebP (frame-0001.webp .. frame-0097.webp)
  favicon.svg    # Favicon situs
src/
  canvas/        # SwarmCanvas.tsx dan swarmEngine.ts (Hero Canvas 2D)
  components/    # Nav, Preloader, Hero, EyeScan, About, Skills, Projects, Achievements, Experience, Contact, ui/
  data/          # site.ts, projects.ts, achievements.ts, skills.ts, experience.ts
  hooks/         # useFramePreloader, useReducedMotion, useMediaQuery, useInView
  styles/        # tokens.css (design token wajib), globals.css
```

## Mengelola Konten Lewat File Data

Seluruh konten dibaca dari `src/data/` tanpa hardcode di komponen:

- **Menambah/mengubah project:** edit `src/data/projects.ts` (`PROJECTS`). Gunakan `status: "done"` untuk project selesai dan `status: "in-progress"` untuk yang masih dalam pengembangan.
- **Menambah/mengubah pencapaian & sertifikat:** edit `src/data/achievements.ts` (`ACHIEVEMENTS`).
- **Mengubah skill:** edit `src/data/skills.ts` (`SKILL_GROUPS`).
- **Mengubah pengalaman:** edit `src/data/experience.ts` (`EXPERIENCE_ITEMS`).
- **Mengubah profil, HUD Eye Scan, dan kontak:** edit `src/data/site.ts` (`SITE_INFO`, `profileHud`, `CONTACT_INFO`).

## Mengganti Set Frame Eye Scan

1. Siapkan urutan gambar berurutan `frame-0001.webp` sampai `frame-0097.webp` di `public/frames/`.
2. Contoh perintah ekstraksi dari video:
   ```bash
   ffmpeg -i sumber.mp4 -vf "fps=24,scale=1280:-2" -c:v libwebp -quality 75 public/frames/frame-%04d.webp
   ```
3. Sesuaikan `TOTAL_FRAMES`, `SCAN_END_FRAME`, `FRAME_WIDTH`, dan `FRAME_HEIGHT` di `src/data/site.ts` bila jumlah atau rasio frame berubah.

## Deploy ke Vercel (Situs Statis)

1. Push repositori ke GitHub/GitLab/Bitbucket.
2. Import project di Vercel.
3. Build command: `npm run build`, Output directory: `dist`.
4. `vercel.json` sudah dikonfigurasi untuk memberi header `Cache-Control: public, max-age=31536000, immutable` pada `/frames/*`.

## Keputusan Desain

- **Swarm Hero (Intro 3-Baris + Boids):** Saat kunjungan pertama di sesi, pecahan kursor mengalir membentuk 3 baris headline (`CREATIVE` / `FULL-STACK` outline / `DEVELOPER.`) di posisi tepat teks DOM, menahan sebentar, lalu melebur (*crossfade* ke `<h1>` DOM) menjadi kawanan *boids* interaktif (*spatial grid* $O(n)$, tolak saat hover, pusaran saat tekan-tahan, ledakan saat lepas). Kunjungan ulang di sesi yang sama memakai intro singkat (`sessionStorage`).
- **Navbar Hide-on-Scroll:** Navbar `fixed` bersembunyi saat scroll turun melewati 80px, muncul kembali saat scroll naik atau saat fokus keyboard berada di dalamnya, serta menyorot section aktif via `IntersectionObserver`.
- **Eye Scan Layar Penuh:** Menggunakan frame 862×756 yang dilebur dengan CSS `mask-image` tanpa bingkai kartu, dilengkapi busur bar dekoratif, garis scan tunggal (50–68%), 3 callout skill dengan garis penunjuk SVG (70–90%), dan kartu HUD identitas kaca (80–100%).
- **Skills Grid Logo (`simple-icons`):** Menampilkan ikon resmi CC0 dari paket `simple-icons` dalam grid ubin brutalist tanpa bar persentase; item berawalan `TODO` di `src/data/skills.ts` disaring dari UI.
- **Projects & Achievements sebagai Folder Interaktif:** Kedua direktori disajikan sebagai folder manila dengan mini-card yang mengintip saat hover/fokus (ketuk pertama pada perangkat sentuh) dan membesar menjadi panel dialog layar penuh (`layoutId`, focus trap, tombol `Kembali`, dan pemulihan fokus ke tombol folder).
- **About Foto Interaktif:** Memakai `about-me.webp` dan `about-hover.webp` dengan rasio `4:5` terkunci, transisi `clip-path` + crossfade saat hover/fokus/tap, serta preload gambar kedua saat masuk viewport.
- **Preloader & Sesi:** Semua 97 frame di-preload dengan batas konkurensi 8 (`Image` + `decode()`), menyimpan penanda di `sessionStorage` agar kunjungan ulang dalam sesi yang sama tampil lebih cepat.
- **Target Audiens Default:** Difokuskan ke peluang magang/kerja web sesuai default PRD sampai pemilik mengisi preferensi final di `src/data/site.ts`.

