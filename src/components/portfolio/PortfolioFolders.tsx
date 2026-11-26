import { motion } from "framer-motion";
import { FolderCard } from "./FolderCard";
import {
  PORTFOLIO_CATEGORIES,
  type PortfolioCategory,
} from "./portfolioData";

interface PortfolioFoldersProps {
  activeCategory: PortfolioCategory;
  reducedMotion: boolean;
  onSelectCategory: (category: PortfolioCategory) => void;
}

export function PortfolioFolders({
  activeCategory,
  reducedMotion,
  onSelectCategory,
}: PortfolioFoldersProps) {
  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: reducedMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
      role="group"
      aria-label="Kategori Portofolio"
      className="grid grid-cols-3 gap-[clamp(8px,2.2vw,28px)]"
    >
      {PORTFOLIO_CATEGORIES.map((category) => (
        <FolderCard
          key={category.id}
          category={category}
          isActive={activeCategory === category.id}
          reducedMotion={reducedMotion}
          onSelect={() => onSelectCategory(category.id)}
        />
      ))}
    </motion.div>
  );
}
