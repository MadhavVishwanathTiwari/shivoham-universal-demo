/**
 * The small tracked-caps gold label the hero uses above its headline
 * ("SHIVOHAM UNIVERSAL SOL"). Lifted here so every page's section intro
 * matches it exactly rather than approximating it.
 */
export default function Eyebrow({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`text-astral-gold/75 font-inter text-[11px] tracking-[0.4em] uppercase ${className}`}
    >
      {children}
    </p>
  );
}
