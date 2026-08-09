import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost" | "link";

/* `btn-sheen` only on primary: the sweep is a white gradient and it needs a
   filled, opaque surface to read against. On the ghost variant it washes over
   the page background showing through the button and looks like a rendering
   artefact. Ghost gets the border-brightening hover instead. */
const VARIANT_CLASS: Record<Variant, string> = {
  primary:
    "btn-sheen bg-astral-gold text-void-black hover:bg-astral-gold/90 rounded-astral px-6 py-3 font-semibold",
  ghost:
    "border-astral-gold/40 text-astral-gold hover:border-astral-gold/80 hover:bg-astral-gold/10 rounded-astral border px-6 py-3",
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
  /* `active:scale-[0.97]` is the press. Tiny on purpose — it exists to confirm
     the tap landed on a touch device, where there is no hover state to do it. */
  const cls = `focus-astral font-inter inline-flex items-center justify-center text-sm tracking-wide whitespace-nowrap transition-[color,background-color,border-color,transform] duration-200 active:scale-[0.97] motion-reduce:active:scale-100 ${VARIANT_CLASS[variant]} ${className}`;

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
