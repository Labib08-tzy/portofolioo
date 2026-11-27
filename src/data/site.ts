export interface FrameSet {
  dir: string;
  total: number;
  scanEnd: number;
  w: number;
  h: number;
}

export const FRAME_SETS = {
  desktop: {
    dir: "/frames",
    total: 97,
    scanEnd: 73,
    w: 862,
    h: 756,
  },
  mobile: {
    dir: "/frames-mobile",
    total: 49,
    scanEnd: 37,
    w: 560,
    h: 491,
  },
} as const satisfies Record<string, FrameSet>;

/**
 * Pilih set frame sekali saat halaman dimuat: viewport <= 768px, mode hemat data,
 * jaringan 2g/3g, atau deviceMemory <= 4 memakai set ringan (mobile).
 */
function shouldUseMobileFrames(): boolean {
  if (typeof window === "undefined") return false;
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean; effectiveType?: string };
  };
  const narrow = window.matchMedia("(max-width: 768px)").matches;
  const saveData = nav.connection?.saveData === true;
  const slowNet =
    nav.connection?.effectiveType === "2g" ||
    nav.connection?.effectiveType === "3g";
  const lowMemory =
    typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4;
  return narrow || saveData || slowNet || lowMemory;
}

const ACTIVE_FRAMES: FrameSet = shouldUseMobileFrames()
  ? FRAME_SETS.mobile
  : FRAME_SETS.desktop;

export const IS_MOBILE_FRAMES = ACTIVE_FRAMES === FRAME_SETS.mobile;
export const TOTAL_FRAMES = ACTIVE_FRAMES.total;
export const SCAN_END_FRAME = ACTIVE_FRAMES.scanEnd;
export const FRAME_WIDTH = ACTIVE_FRAMES.w;
export const FRAME_HEIGHT = ACTIVE_FRAMES.h;

export function frameSrc(index: number): string {
  const clamped = Math.max(1, Math.min(ACTIVE_FRAMES.total, Math.round(index)));
  return `${ACTIVE_FRAMES.dir}/frame-${String(clamped).padStart(4, "0")}.webp`;
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
  instagram: string;
  telegram: string;
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
  aboutPhoto: "/images/about-me.webp",
  aboutHoverPhoto: "/images/about-hover.webp",
  aboutHoverAlt: "TODO: deskripsi foto",
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
  instagram: "TODO: https://instagram.com/username",
  telegram: "TODO: https://t.me/username",
};

export const TECH_CREDITS = [
  "React",
  "TypeScript",
  "Tailwind CSS",
  "Framer Motion",
  "GSAP",
];

