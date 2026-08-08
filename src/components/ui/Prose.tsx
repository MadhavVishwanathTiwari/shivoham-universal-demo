/** Renders the `string[]` body copy the content modules store. A separate
 *  component so paragraph rhythm is decided once rather than per page. */
export default function Prose({
  paragraphs,
  className = "",
}: {
  paragraphs: readonly string[];
  className?: string;
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      {paragraphs.map((p, i) => (
        <p
          key={i}
          className="font-inter text-parchment-white/70 max-w-3xl leading-relaxed text-pretty"
        >
          {p}
        </p>
      ))}
    </div>
  );
}
