import { useState } from "react";
import { motion } from "framer-motion";
import type { Project } from "../../data/projects";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { SectionHeading } from "../ui/SectionHeading";
import { PortfolioFolders } from "./PortfolioFolders";
import { PortfolioGrid } from "./PortfolioGrid";
import { ProjectDetailModal } from "./ProjectDetailModal";
import type { PortfolioCategory } from "./portfolioData";

export function PortfolioSection() {
  const [activeCategory, setActiveCategory] =
    useState<PortfolioCategory>("projects");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const reducedMotion = useReducedMotion();

  return (
    <section
      id="projects"
      className="relative border-b border-forest-600 py-[clamp(48px,7vw,112px)]"
    >
      {/* Preserves #achievements navbar anchor */}
      <span id="achievements" className="sr-only" aria-hidden="true" />

      {/* Subtle emerald ambient glow consistent with site theme */}
      <div
        aria-hidden="true"
        className="ambient-glow-emerald pointer-events-none absolute inset-x-0 top-12 mx-auto h-72 max-w-4xl rounded-full opacity-40 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-[clamp(14px,3.2vw,32px)]">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: reducedMotion ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <SectionHeading
            index="04"
            eyebrow="Portofolio"
            title="Projects, Certificates & Awards"
            subtitle="Pilih folder kategori untuk menelusuri karya aplikasi, sertifikat kompetensi, dan pencapaian kompetisi."
          />
        </motion.div>

        <PortfolioFolders
          activeCategory={activeCategory}
          reducedMotion={reducedMotion}
          onSelectCategory={setActiveCategory}
        />

        <PortfolioGrid
          activeCategory={activeCategory}
          reducedMotion={reducedMotion}
          onSelectProject={setSelectedProject}
        />
      </div>

      <ProjectDetailModal
        project={selectedProject}
        reducedMotion={reducedMotion}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
}
