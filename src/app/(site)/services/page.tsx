"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/site/Container";
import { SectionHeading } from "@/components/site/SectionHeading";
import { LinkButton } from "@/components/ui/Button";
import { db, seedIfEmpty } from "@/lib/store";
import type { Service } from "@/lib/types";

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    seedIfEmpty();
    setServices(db.services.all().sort((a, b) => a.order - b.order));
  }, []);

  return (
    <>
      <section className="bg-ink text-white py-16 sm:py-20">
        <Container>
          <p className="text-rust font-medium text-sm mb-3">Services</p>
          <h1 className="font-display font-semibold text-5xl sm:text-6xl max-w-2xl">
            Construction services for every stage of your project
          </h1>
          <p className="mt-5 text-steel-light max-w-xl">
            From engineering consultation and site survey through to finishing, H S Constructions
            covers the full construction lifecycle.
          </p>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <div className="grid sm:grid-cols-2 gap-px bg-line">
            {services.map((s) => (
              <div key={s.id} className="bg-paper p-8 flex flex-col">
                <p className="text-xs font-medium text-rust uppercase tracking-wide">{s.category}</p>
                <h3 className="font-display font-semibold text-3xl mt-2">{s.title}</h3>
                <p className="mt-3 text-sm text-steel leading-relaxed flex-1">{s.description}</p>
                <LinkButton href="/quote" variant="ghost" size="sm" className="mt-5 px-0! justify-start">
                  Request a quote for this <ArrowRight size={15} />
                </LinkButton>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20 bg-ink-soft text-white">
        <Container className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <SectionHeading
            title="Not sure which service you need?"
            description="Send us your project details and we'll recommend the right approach."
            dark
          />
          <LinkButton href="/quote" size="lg" className="shrink-0">
            Request a Quote
          </LinkButton>
        </Container>
      </section>
    </>
  );
}
