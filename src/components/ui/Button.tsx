import Link from "next/link";
import { clsx } from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "dark" | "outline" | "ghost";
type Size = "md" | "lg" | "sm";

const base =
  "inline-flex items-center justify-center gap-2 font-medium transition-colors duration-150 rounded-sm disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary: "bg-rust text-white hover:bg-rust-dark",
  dark: "bg-ink text-white hover:bg-ink-soft",
  outline: "border border-ink text-ink hover:bg-ink hover:text-white",
  ghost: "text-ink hover:text-rust",
};

const sizes: Record<Size, string> = {
  sm: "text-sm px-3 py-1.5",
  md: "text-sm px-5 py-2.5",
  lg: "text-base px-7 py-3.5",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  className,
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={clsx(base, variants[variant], sizes[size], className)} {...rest}>
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  children,
  className,
  target,
}: CommonProps & { href: string; target?: string }) {
  const isExternal = href.startsWith("http") || href.startsWith("tel:") || href.startsWith("mailto:");
  if (isExternal) {
    return (
      <a
        href={href}
        target={target}
        rel={target === "_blank" ? "noopener noreferrer" : undefined}
        className={clsx(base, variants[variant], sizes[size], className)}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={clsx(base, variants[variant], sizes[size], className)}>
      {children}
    </Link>
  );
}
