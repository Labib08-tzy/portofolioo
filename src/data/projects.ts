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

export const PROJECTS: Project[] = [
  {
    id: "usahaku",
    title: "UsahaKu",
    type: "Android",
    status: "done",
    description:
      "Aplikasi pembukuan UMKM berbasis Android untuk mencatat penghasilan, modal, dan rugi secara terstruktur.",
    stack: ["Flutter", "Dart", "TODO: Database/State"],
    featured: true,
    caseStudy: {
      problem:
        "Pelaku UMKM sering mencatat pemasukan, modal, dan kerugian secara manual sehingga sulit memantau kondisi keuangan usaha dengan cepat.",
      role: "Mobile Developer (TODO: detail peran spesifik bila ada tim).",
      solution:
        "Membangun aplikasi Android menggunakan Flutter untuk pencatatan transaksi harian meliputi penghasilan, modal, dan perhitungan rugi.",
      result:
        "Aplikasi selesai dibangun dan dapat digunakan untuk pencatatan pembukuan dasar UMKM. TODO: Tambahkan metrik/hasil nyata dan screenshot jika tersedia.",
    },
  },
  {
    id: "google-notes",
    title: "Google Notes",
    type: "Web",
    status: "done",
    description: "TODO: Tambahkan deskripsi singkat project Google Notes.",
    stack: ["TODO: Stack utama"],
    featured: true,
    caseStudy: {
      problem: "TODO: Jelaskan masalah yang diselesaikan oleh Google Notes.",
      role: "TODO: Jelaskan peran Abi dalam project ini.",
      solution: "TODO: Jelaskan solusi dan fitur utama yang dibangun.",
      result: "TODO: Jelaskan hasil atau pembelajaran dari project ini.",
    },
  },
  {
    id: "showskill",
    title: "ShowSkill",
    type: "Web",
    status: "in-progress",
    description:
      "TODO: Tambahkan deskripsi tujuan dan fitur utama platform ShowSkill.",
    stack: ["TODO: Stack yang digunakan"],
  },
  {
    id: "sewa-boardgame",
    title: "Landing page sewa boardgame",
    type: "Web",
    status: "in-progress",
    description:
      "Landing page untuk layanan sewa boardgame yang menampilkan katalog permainan dan informasi penyewaan.",
    stack: ["TODO: Stack yang digunakan"],
  },
];
