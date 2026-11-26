interface SectionHeadingProps {
  index: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
}

export function SectionHeading({
  index,
  eyebrow,
  title,
  subtitle,
}: SectionHeadingProps) {
  return (
    <div className="mb-[clamp(24px,4vw,56px)] border-b border-forest-600 pb-[clamp(14px,2.5vw,24px)]">
      <div className="mb-[clamp(8px,1.5vw,12px)] flex items-center gap-3 font-ui text-[clamp(10px,1.6vw,12px)] font-semibold uppercase tracking-[0.08em] text-sage">
        <span className="inline-flex items-center rounded-full border border-forest-600 bg-forest-900 px-[clamp(8px,1.5vw,12px)] py-1 text-brass">
          {index}
        </span>
        <span>{eyebrow}</span>
      </div>
      <h2 className="font-display text-[clamp(1.35rem,4.4vw,3rem)] font-bold tracking-tight text-sand">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-2.5 max-w-2xl text-[clamp(0.78rem,2vw,1.125rem)] text-sage">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

