import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost" | "link";

const VARIANT_CLASS: Record<Variant, string> = {
  primary:
    "bg-astral-gold text-void-black hover:bg-astral-gold/90 rounded-astral px-6 py-3 font-semibold",
  ghost:
    "border-astral-gold/40 text-astral-gold hover:bg-astral-gold/10 rounded-astral border px-6 py-3",
  link: "text-astral-gold underline-offset-4 hover:underline",
};

interface CommonProps {
  variant?: Variant;
  children: ReactNode;
  className?: string;
}

/** Rendered as a <button> when there is no href. */
interface ButtonAsButton
  extends CommonProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> {
  href?: undefined;
}

/** Rendered as a <Link> when href is present — a navigation, not an action,
 *  so it should be a real link: middle-click, right-click "open in new tab",
 *  and crawlers all depend on it being an <a>, not a button with an
 *  onClick(router.push(...)). */
interface ButtonAsLink extends CommonProps {
  href: string;
  target?: string;
}

type Props = ButtonAsButton | ButtonAsLink;

export default function Button({
  variant = "primary",
  children,
  className = "",
  ...rest
}: Props) {
  const cls = `focus-astral font-inter inline-flex items-center justify-center text-sm tracking-wide whitespace-nowrap transition-colors ${VARIANT_CLASS[variant]} ${className}`;

  if ("href" in rest && rest.href !== undefined) {
    const { href, target } = rest;
    return (
      <Link href={href} target={target} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button className={cls} {...(rest as ButtonAsButton)}>
      {children}
    </button>
  );
}
