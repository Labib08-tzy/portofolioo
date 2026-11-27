interface SectionHeadingProps {
  title: string;
}

export function SectionHeading({ title }: SectionHeadingProps) {
  return (
    <h2 className="mb-[clamp(28px,4vw,56px)] text-center font-display text-[clamp(1.75rem,4.4vw,2.75rem)] font-bold tracking-tight text-sand">
      {title}
    </h2>
  );
}
