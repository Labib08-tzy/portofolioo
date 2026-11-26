import { ACHIEVEMENTS, type Achievement } from "../../data/achievements";
import { PROJECTS, type Project } from "../../data/projects";

export type PortfolioCategory = "projects" | "certificates" | "awards";

export interface FolderCategoryMeta {
  id: PortfolioCategory;
  label: string;
  subtitle: string;
  count: number;
}

export const CERTIFICATE_ITEMS: Achievement[] = ACHIEVEMENTS.filter(
  (item) => item.kind === "certificate"
);

export const AWARD_ITEMS: Achievement[] = ACHIEVEMENTS.filter(
  (item) => item.kind === "competition"
);

export const PORTFOLIO_CATEGORIES: FolderCategoryMeta[] = [
  {
    id: "projects",
    label: "Projects",
    subtitle: "Aplikasi Web & Mobile",
    count: PROJECTS.length,
  },
  {
    id: "certificates",
    label: "Certificates",
    subtitle: "Pelatihan & Kompetensi",
    count: CERTIFICATE_ITEMS.length,
  },
  {
    id: "awards",
    label: "Awards",
    subtitle: "Kompetisi & Prestasi",
    count: AWARD_ITEMS.length,
  },
];

export type PortfolioDataMap = {
  projects: Project[];
  certificates: Achievement[];
  awards: Achievement[];
};

export const PORTFOLIO_DATA: PortfolioDataMap = {
  projects: PROJECTS,
  certificates: CERTIFICATE_ITEMS,
  awards: AWARD_ITEMS,
};
