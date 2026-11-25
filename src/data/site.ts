export const TOTAL_FRAMES = 97;
export const SCAN_END_FRAME = 73;
export const FRAME_WIDTH = 862;
export const FRAME_HEIGHT = 756;

export function frameSrc(index: number): string {
  const clamped = Math.max(1, Math.min(TOTAL_FRAMES, Math.round(index)));
  return `/frames/frame-${String(clamped).padStart(4, "0")}.webp`;
}

export interface ProfileHud {
  name: string;
  nickname: string;
  role: string;
  school: string;
  skills: string[];
  achievement: string;
  bio: string;
}

export interface ContactInfo {
  email: string;
  github: string;
  linkedin: string;
}

export interface AboutFact {
  label: string;
  value: string;
}

export const SITE_INFO = {
  brand: "LABIB",
  fullName: "Mohammad Labib Nayla Fahmi",
  nickname: "Abi",
  role: "Creative Developer / Full-Stack Developer",
  positioning:
    "TODO: Tulis satu kalimat positioning yang menjelaskan fokus dan nilai utama.",
  school: "SMK Umar Fatah Rembang",
  major: "Rekayasa Perangkat Lunak (RPL)",
  cvUrl: "/cv/cv-labib.pdf",
  aboutParagraphs: [
    "Saya Mohammad Labib Nayla Fahmi (Abi), siswa jurusan Rekayasa Perangkat Lunak (RPL) di SMK Umar Fatah Rembang yang berfokus pada pengembangan web dan aplikasi mobile.",
    "Di RPL saya mempelajari dasar pemrograman, pengembangan antarmuka web modern, pengelolaan basis data, serta pembangunan aplikasi Android untuk kebutuhan nyata.",
    "TODO: Lengkapi paragraf tentang target yang sedang dicari (magang/kerja, freelance, atau kuliah) dan fokus pengembangan saat ini.",
  ],
  aboutFacts: [
    { label: "Nama", value: "Mohammad Labib Nayla Fahmi (Abi)" },
    { label: "Sekolah", value: "SMK Umar Fatah Rembang" },
    { label: "Jurusan", value: "Rekayasa Perangkat Lunak (RPL)" },
    { label: "Domisili", value: "TODO: Isi domisili" },
    { label: "Target", value: "TODO: Magang / Kerja / Freelance / Kuliah" },
  ] satisfies AboutFact[],
};

export const profileHud: ProfileHud = {
  name: "Mohammad Labib Nayla Fahmi",
  nickname: "Abi",
  role: "Creative Developer / Full-Stack Developer",
  school: "SMK Umar Fatah Rembang — RPL",
  skills: ["React", "TypeScript", "Tailwind CSS", "Laravel", "Flutter"],
  achievement: "Juara 3 LKS Web Technology (Tingkat Kabupaten)",
  bio: "TODO: Isi bio singkat untuk panel HUD Eye Scan.",
};

export const CONTACT_INFO: ContactInfo = {
  email: "TODO: email@domain.com",
  github: "TODO: https://github.com/username",
  linkedin: "TODO: https://linkedin.com/in/username",
};

export const TECH_CREDITS = [
  "React",
  "TypeScript",
  "Tailwind CSS",
  "Framer Motion",
  "GSAP",
];

