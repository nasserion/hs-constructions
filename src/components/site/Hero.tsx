"use client";

import { useEffect, useState } from "react";
import { ArrowRight, HardHat, Ruler, ShieldCheck, Users } from "lucide-react";
import { Container } from "./Container";
import { LinkButton } from "../ui/Button";
import { BUSINESS, waLink } from "@/lib/business";
import { db, seedIfEmpty } from "@/lib/store";

const CREDIBILITY = [
  { icon: Users, label: `${BUSINESS.workforce.fundi} Professional Fundi & Builders` },
  { icon: HardHat, label: `${BUSINESS.workforce.porters} Porters` },
  { icon: ShieldCheck, label: "Professional Construction Team" },
  { icon: Ruler, label: "Engineering & Site Survey Support" },
];

export function Hero() {
  const [heroImage, setHeroImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    seedIfEmpty();
    setHeroImage(db.settings.get().heroImage);
  }, []);

  return (
    <section
      className="relative bg-ink text-white overflow-hidden bg-cover bg-center"
      style={heroImage ? { backgroundImage: `url(${heroImage})` } : undefined}
    >
      {/* Blueprint grid accent (subtle even over a photo) */}
      <div className="absolute inset-0 blueprint-grid opacity-30" aria-hidden="true" />
      {/* Dark gradient overlay so text stays legible over any photo */}
      {heroImage && (
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(20,24,28,0.94) 0%, rgba(20,24,28,0.82) 45%, rgba(20,24,28,0.55) 100%)",
          }}
          aria-hidden="true"
        />
      )}

      <Container className="relative py-20 sm:py-28 lg:py-32">
        <div className="max-w-3xl">
          <p className="text-rust font-medium text-sm mb-5 tracking-wide">
            {BUSINESS.director.title} — {BUSINESS.director.name}
          </p>
          <h1 className="font-display font-semibold text-5xl sm:text-6xl lg:text-7xl leading-[0.95]">
            Building your vision with strength, precision &amp; quality
          </h1>
          <p className="mt-6 text-lg text-steel-light leading-relaxed max-w-xl">
            {BUSINESS.name} provides professional construction, engineering consultation, site
            surveying, building and related construction services for projects of different
            sizes and requirements.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-4">
            <LinkButton href="/quote" size="lg">
              Request a Quote <ArrowRight size={18} />
            </LinkButton>
            <LinkButton
              href={waLink()}
              target="_blank"
              variant="outline"
              size="lg"
              className="border-white/30 text-white hover:bg-white hover:text-ink"
            >
              WhatsApp Us
            </LinkButton>
          </div>
        </div>
      </Container>

      <div className="relative border-t border-white/10">
        <Container>
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {CREDIBILITY.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 py-6 border-r border-white/10 last:border-r-0 pr-3"
              >
                <Icon size={22} className="text-rust shrink-0" />
                <span className="text-sm text-white leading-snug">{label}</span>
              </div>
            ))}
          </div>
        </Container>
      </div>
    </section>
  );
}
