import Link from "next/link";
import { Phone, Mail, MessageCircle } from "lucide-react";
import { Container } from "./Container";
import { BUSINESS, mailLink, telLink, waLink } from "@/lib/business";

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/quote", label: "Request a Quote" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="bg-ink text-white no-print">
      <Container className="py-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display font-semibold text-2xl">
            H S <span className="text-rust">CONSTRUCTIONS</span>
          </p>
          <p className="mt-3 text-sm text-steel-light leading-relaxed max-w-xs">
            Professional construction, building, engineering consultation and site survey
            services.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white mb-4">Quick links</h3>
          <ul className="space-y-2.5">
            {QUICK_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-steel-light hover:text-rust transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white mb-4">Contact</h3>
          <ul className="space-y-3 text-sm text-steel-light">
            <li className="flex items-center gap-2">
              <MessageCircle size={16} className="text-rust shrink-0" />
              <a href={waLink()} target="_blank" rel="noopener noreferrer" className="hover:text-rust">
                {BUSINESS.whatsappDisplay}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} className="text-rust shrink-0" />
              <a href={telLink()} className="hover:text-rust">
                {BUSINESS.phoneDisplay}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} className="text-rust shrink-0" />
              <a href={mailLink()} className="hover:text-rust break-all">
                {BUSINESS.email}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white mb-4">Leadership</h3>
          <p className="text-sm text-steel-light">{BUSINESS.director.name}</p>
          <p className="text-sm text-steel-light">{BUSINESS.director.title}</p>
        </div>
      </Container>

      <div className="border-t border-line-dark">
        <Container className="py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-steel-light">
            © {new Date().getFullYear()} {BUSINESS.name}. All rights reserved.
          </p>
          <Link href="/admin" className="text-xs text-steel-light hover:text-rust">
            Admin Portal
          </Link>
        </Container>
      </div>
    </footer>
  );
}
