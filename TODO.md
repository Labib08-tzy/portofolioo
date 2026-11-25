# TODO — Data yang Perlu Dilengkapi Pemilik

Daftar seluruh placeholder `TODO` yang saat ini ada di kode dan perlu diisi dengan data asli oleh Mohammad Labib Nayla Fahmi:

## 1. Profil & Identitas (`src/data/site.ts` & `index.html`)
- [ ] **Positioning Hero:** Ganti `SITE_INFO.positioning` dengan satu kalimat positioning yang menjelaskan fokus dan nilai utama.
- [ ] **Domisili:** Isi `Domisili` pada `SITE_INFO.aboutFacts`.
- [ ] **Target Audiens:** Pilih dan tulis target utama (`magang/kerja`, `freelance`, atau `kuliah`) pada `SITE_INFO.aboutParagraphs` dan `SITE_INFO.aboutFacts`.
- [ ] **Bio HUD Eye Scan:** Isi `profileHud.bio` dengan bio singkat.
- [ ] **Foto Profil (Opsional):** Jika ingin menampilkan foto di section About, ganti placeholder pada `src/components/About.tsx`.

## 2. Kontak & CV (`src/data/site.ts` & `public/cv/`)
- [ ] **Email:** Isi `CONTACT_INFO.email`.
- [ ] **GitHub:** Isi `CONTACT_INFO.github`.
- [ ] **LinkedIn:** Isi `CONTACT_INFO.linkedin`.
- [ ] **File CV:** Ganti placeholder `public/cv/cv-labib.pdf` dengan file CV PDF asli.

## 3. Projects (`src/data/projects.ts`)
- [ ] **UsahaKu:** Lengkapi `stack` (database/state yang dipakai), detail peran jika berkelompok, hasil/metrik nyata, `demoUrl`/`repoUrl`, dan `caseStudy.images` bila tersedia.
- [ ] **Google Notes:** Isi `description`, `stack`, `demoUrl`, `repoUrl`, dan seluruh field `caseStudy` (`problem`, `role`, `solution`, `result`).
- [ ] **ShowSkill:** Isi `description` (tujuan & fitur utama) dan `stack`.
- [ ] **Landing page sewa boardgame:** Isi `stack` dan tautan bila sudah ada.

## 4. Skills (`src/data/skills.ts`)
- [ ] **Tools:** Ganti atau tambah item `TODO: Tools lain` pada kategori `Tools`.

## 5. Pencapaian & Sertifikat (`src/data/achievements.ts`)
- [ ] **LKS Web Technology:** Isi `year` (tahun pelaksanaan) dan nama penyelenggara resmi pada `issuer`.
- [ ] **Sertifikat 1 (`cert-1`):** Isi `title`, `issuer`, `year`, dan `link` verifikasi jika ada.
- [ ] **Sertifikat 2 (`cert-2`):** Isi `title`, `issuer`, `year`, dan `link` verifikasi jika ada.

## 6. Pengalaman (`src/data/experience.ts`)
- [ ] **PKL:** Isi `organization` (nama instansi/perusahaan), `period`, dan `description` tugas/kontribusi nyata.
- [ ] **Kompetisi LKS:** Isi `period` (tahun pelaksanaan).

## 7. Domain & SEO (`index.html`)
- [ ] **Domain Kustom:** Tambahkan `<meta property="og:url" ...>` setelah domain Vercel/kustom aktif.
- [ ] **Gambar Open Graph:** Buat gambar OG (mis. `public/og-image.png`) dan tambahkan tag `og:image` serta `twitter:image` di `index.html`.
