import type { ReactNode } from "react";

interface PillButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md";
  download?: boolean | string;
  target?: string;
  rel?: string;
  className?: string;
  type?: "button" | "submit" | "reset";
  ariaLabel?: string;
}

export function PillButton({
  children,
  href,
  onClick,
  variant = "primary",
  size = "md",
  download,
  target,
  rel,
  className = "",
  type = "button",
  ariaLabel,
}: PillButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-ui font-semibold tracking-[0.02em] transition-transform duration-150 active:translate-y-0.5 focus-visible:outline-2 focus-visible:outline-brass focus-visible:outline-offset-3";

  const sizeClasses =
    size === "sm" ? "px-4 py-1.5 text-xs" : "px-6 py-3 text-sm";

  const variantClasses = {
    primary:
      "bg-brass text-ink border border-brass hover:-translate-y-0.5 shadow-[4px_4px_0_0_var(--c-forest-600)]",
    outline:
      "bg-forest-900/80 text-sand border border-forest-600 hover:border-brass hover:-translate-y-0.5 shadow-[4px_4px_0_0_var(--c-forest-600)]",
    ghost:
      "bg-transparent text-sand border border-forest-600/70 hover:border-sand hover:bg-forest-900/50",
  }[variant];

  const combined = `${base} ${sizeClasses} ${variantClasses} ${className}`.trim();

  if (href) {
    return (
      <a
        href={href}
        onClick={onClick}
        download={download}
        target={target}
        rel={rel}
        aria-label={ariaLabel}
        className={combined}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
      className={combined}
    >
      {children}
    </button>
  );
}

