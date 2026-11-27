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
    stack: ["Flutter", "Dart"],
    featured: true,
    caseStudy: {
      problem:
        "Pelaku UMKM sering mencatat pemasukan, modal, dan kerugian secara manual sehingga sulit memantau kondisi keuangan usaha dengan cepat.",
      role: "Mobile Developer",
      solution:
        "Membangun aplikasi Android menggunakan Flutter untuk pencatatan transaksi harian meliputi penghasilan, modal, dan perhitungan rugi.",
      result:
        "Aplikasi selesai dibangun dan dapat digunakan untuk pencatatan pembukuan dasar UMKM.",
      images: ["/images/usahaku.webp"],
    },
  },
  {
    id: "google-notes",
    title: "Google Notes",
    type: "Web",
    status: "done",
    description:
      "Aplikasi web pencatat pribadi yang ringkas untuk menulis, mengelompokkan, dan mengelola catatan harian dengan cepat.",
    stack: ["Web"],
    featured: true,
    caseStudy: {
      problem:
        "Pengguna membutuhkan tempat pencatatan yang cepat, ringan, dan mudah diakses dari browser untuk menyimpan ide maupun daftar tugas.",
      role: "Web Developer",
      solution:
        "Membangun aplikasi catatan berbasis web dengan antarmuka bersih untuk membuat, mengedit, dan menghapus catatan secara praktis.",
      result:
        "Menghasilkan aplikasi pencatat yang responsif dan siap dipakai untuk kebutuhan catatan sehari-hari.",
      images: ["/images/googlenotes.webp"],
    },
  },
  {
    id: "showskill",
    title: "ShowSkill",
    type: "Web",
    status: "in-progress",
    description:
      "Platform web untuk menampilkan keahlian, karya, dan portofolio keterampilan pengguna secara terstruktur.",
    stack: ["Web"],
    caseStudy: {
      problem:
        "Banyak pelajar dan kreator kesulitan merangkum keahlian serta bukti karyanya dalam satu tampilan yang rapi.",
      role: "Full-Stack Developer",
      solution:
        "Mengembangkan platform web ShowSkill agar pengguna dapat memamerkan profil keahlian dan karya mereka secara terpusat.",
      result:
        "Platform sedang dalam tahap pengembangan dengan fokus pada tampilan profil keahlian yang jelas.",
      images: ["/images/showskill.webp"],
    },
  },
];
