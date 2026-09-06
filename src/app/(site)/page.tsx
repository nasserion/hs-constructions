import { ArrowRight } from "lucide-react";
import { Container } from "@/components/site/Container";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Hero } from "@/components/site/Hero";
import { LinkButton } from "@/components/ui/Button";

const SERVICE_PREVIEW = [
  {
    title: "Building Construction",
    description: "Residential, commercial and institutional buildings built to last.",
  },
  {
    title: "Structural & Civil Works",
    description: "Foundations, concrete, masonry, reinforcement and roofing.",
  },
  {
    title: "Engineering Consultation",
    description: "Professional guidance at every stage of your project.",
  },
  {
    title: "Site Survey",
    description: "Ground assessment and planning before construction begins.",
  },
];

const PROCESS = [
  { step: "Enquire", detail: "Reach us by WhatsApp, call, or the quote request form." },
  { step: "Site review", detail: "We review your requirements and, where needed, the site itself." },
  { step: "Quotation", detail: "You receive a clear, itemized quotation for the work." },
  { step: "Construction", detail: "Our fundi and site team carry out the agreed work." },
];

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* Services preview */}
      <section className="py-20 sm:py-24">
        <Container>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <SectionHeading
              kicker="What we do"
              title="Construction services built around your project"
              description="From the first site visit to the final finish, H S Constructions handles every stage of the build."
            />
            <LinkButton href="/services" variant="outline" size="sm" className="shrink-0">
              View all services <ArrowRight size={16} />
            </LinkButton>
          </div>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-line">
            {SERVICE_PREVIEW.map((s) => (
              <div key={s.title} className="bg-paper p-7">
                <h3 className="font-display font-semibold text-2xl text-ink">{s.title}</h3>
                <p className="mt-3 text-sm text-steel leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Process */}
      <section className="py-20 sm:py-24 bg-ink-soft text-white">
        <Container>
          <SectionHeading
            kicker="How it works"
            title="From enquiry to completed project"
            dark
          />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {PROCESS.map((p, i) => (
              <div key={p.step} className="border-t-2 border-rust pt-5">
                <span className="text-xs text-steel-light font-medium">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="font-display font-semibold text-2xl mt-2">{p.step}</h3>
                <p className="mt-2 text-sm text-steel-light leading-relaxed">{p.detail}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-24">
        <Container>
          <div className="corner-marks border border-line bg-white p-10 sm:p-14 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div>
              <h2 className="font-display font-semibold text-3xl sm:text-4xl text-ink max-w-lg">
                Ready to start your next project?
              </h2>
              <p className="mt-3 text-steel max-w-md">
                Tell us about your project and we&apos;ll get back to you with a clear plan and
                quotation.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              <LinkButton href="/quote" size="lg">
                Request a Quote
              </LinkButton>
              <LinkButton href="/contact" variant="outline" size="lg">
                Contact Us
              </LinkButton>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
