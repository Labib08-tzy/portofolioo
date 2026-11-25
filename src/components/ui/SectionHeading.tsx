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
    <div className="mb-10 border-b border-forest-600 pb-6 md:mb-14">
      <div className="mb-3 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-sage">
        <span className="inline-flex items-center rounded-full border border-forest-600 bg-forest-900 px-3 py-1 text-brass">
          {index}
        </span>
        <span>{eyebrow}</span>
      </div>
      <h2 className="font-display text-3xl font-bold tracking-tight text-sand sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-3 max-w-2xl text-base text-sage md:text-lg">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
