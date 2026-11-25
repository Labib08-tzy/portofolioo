export interface ExperienceItem {
  id: string;
  title: string;
  organization: string;
  period: string;
  kind: "pkl" | "competition" | "other";
  description: string;
}

export const EXPERIENCE_ITEMS: ExperienceItem[] = [
  {
    id: "pkl",
    title: "Praktik Kerja Lapangan (PKL)",
    organization: "TODO: Nama instansi / perusahaan PKL",
    period: "TODO: Periode (mis. Bulan Tahun - Bulan Tahun)",
    kind: "pkl",
    description:
      "TODO: Jelaskan tugas, teknologi yang digunakan, dan kontribusi nyata selama PKL.",
  },
  {
    id: "lks-web-technology",
    title: "Peserta & Juara 3 LKS Web Technology",
    organization: "Lomba Kompetensi Siswa Tingkat Kabupaten",
    period: "TODO: Tahun pelaksanaan",
    kind: "competition",
    description:
      "Mengikuti kompetisi pengembangan web tingkat kabupaten dan meraih peringkat Juara 3 pada bidang Web Technology.",
  },
];

