import "../../styles/blur-theme.css";

/** Latar blur lembut untuk section (tema yang sama dengan Home). Taruh sebagai anak pertama section `relative isolate overflow-hidden`. */
export function BlurBackdrop({ variant = "a" }: { variant?: "a" | "b" | "c" }) {
  return (
    <div aria-hidden="true" className="blur-backdrop" data-v={variant}>
      <i className="b1" />
      <i className="b2" />
      <i className="b3" />
    </div>
  );
}
