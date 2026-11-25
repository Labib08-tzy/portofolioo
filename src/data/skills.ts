export interface SkillGroup {
  category: "Frontend" | "Backend" | "Mobile" | "Tools";
  items: string[];
}

export const SKILL_GROUPS: SkillGroup[] = [
  {
    category: "Frontend",
    items: ["React", "TypeScript", "Tailwind CSS", "GSAP", "Framer Motion"],
  },
  {
    category: "Backend",
    items: ["PHP", "Laravel", "MySQL"],
  },
  {
    category: "Mobile",
    items: ["Flutter"],
  },
  {
    category: "Tools",
    items: ["Git", "Vercel", "TODO: Tools lain"],
  },
];

