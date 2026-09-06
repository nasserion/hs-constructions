"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, MessageCircle } from "lucide-react";
import { clsx } from "clsx";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { LinkButton } from "../ui/Button";
import { waLink } from "@/lib/business";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur border-b border-line no-print">
      <Container className="flex items-center justify-between py-3">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "text-sm font-medium transition-colors",
                pathname === link.href ? "text-rust" : "text-ink hover:text-rust"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <LinkButton href={waLink()} target="_blank" variant="outline" size="sm">
            <MessageCircle size={16} /> WhatsApp Us
          </LinkButton>
          <LinkButton href="/quote" variant="primary" size="sm">
            Get a Quote
          </LinkButton>
        </div>

        <button
          className="lg:hidden p-2 text-ink"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </Container>

      {open && (
        <div className="lg:hidden border-t border-line bg-paper">
          <Container className="py-4 flex flex-col gap-1">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={clsx(
                  "py-3 text-base font-medium border-b border-line/70 last:border-0",
                  pathname === link.href ? "text-rust" : "text-ink"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-3 mt-4">
              <LinkButton href={waLink()} target="_blank" variant="outline">
                <MessageCircle size={16} /> WhatsApp Us
              </LinkButton>
              <LinkButton href="/quote" variant="primary">
                Get a Quote
              </LinkButton>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
