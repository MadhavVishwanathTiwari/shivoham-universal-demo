import type { ReactNode } from "react";

/** The gold-hairline surface, as a component rather than a className every
 *  caller has to remember. See `surface-astral` in globals.css. */
export default function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`surface-astral p-6 ${className}`}>{children}</div>
  );
}
