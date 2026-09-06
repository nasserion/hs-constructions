import type { Metadata } from "next";
import { Container } from "@/components/site/Container";
import { SectionHeading } from "@/components/site/SectionHeading";
import { LinkButton } from "@/components/ui/Button";
import { BUSINESS, waLink } from "@/lib/business";
import { HardHat, Users, Compass } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | H S Constructions",
  description: "Learn about H S Constructions and the team delivering our construction, engineering and site survey services.",
};

export default function AboutPage() {
  return (
    <>
      <section className="bg-ink text-white py-16 sm:py-20">
        <Container>
          <p className="text-rust font-medium text-sm mb-3">About Us</p>
          <h1 className="font-display font-semibold text-5xl sm:text-6xl max-w-2xl">
            A construction team built on precision and reliability
          </h1>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="grid lg:grid-cols-2 gap-12">
          <div>
            <SectionHeading title="Who we are" />
            <p className="mt-5 text-steel leading-relaxed">
              {BUSINESS.name} provides comprehensive construction services, working with skilled
              professionals to deliver building, structural, civil, and finishing work for
              projects of different sizes. The company also provides engineering consultation and
              site survey services to support clients through the planning stages of their
              project.
            </p>
            <p className="mt-4 text-steel leading-relaxed">
              Every project is approached with the same commitment: build with strength, work with
              precision, and deliver quality construction our clients can rely on.
            </p>
          </div>
          <div className="corner-marks border border-line p-8 bg-white">
            <Compass size={28} className="text-rust" />
            <h3 className="font-display font-semibold text-2xl mt-4">Our approach</h3>
            <ul className="mt-4 space-y-3 text-sm text-steel leading-relaxed">
              <li>Clear communication from enquiry through to project completion.</li>
              <li>Site survey and engineering consultation before major works begin.</li>
              <li>Itemized quotations so clients know exactly what they are paying for.</li>
              <li>A workforce sized and skilled for the demands of each project.</li>
            </ul>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20 bg-ink-soft text-white">
        <Container>
          <SectionHeading kicker="Leadership" title="Meet the director" dark />
          <div className="mt-10 grid sm:grid-cols-[auto_1fr] gap-8 items-start max-w-3xl">
            <div className="w-24 h-24 rounded-full bg-rust/20 border border-rust flex items-center justify-center shrink-0">
              <span className="font-display font-semibold text-3xl text-rust">
                {BUSINESS.director.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            </div>
            <div>
              <h3 className="font-display font-semibold text-3xl">{BUSINESS.director.name}</h3>
              <p className="text-rust text-sm font-medium mt-1">{BUSINESS.director.title}</p>
              <p className="mt-4 text-steel-light leading-relaxed max-w-xl">
                {BUSINESS.director.name} leads {BUSINESS.name} as co-founder, director and senior
                engineer, overseeing engineering direction, construction management and the
                quality of every project the company undertakes.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <SectionHeading kicker="Our team" title="A workforce built for the job" />
          <div className="mt-10 grid sm:grid-cols-2 gap-px bg-line max-w-3xl">
            <div className="bg-paper p-8 flex items-start gap-4">
              <Users size={26} className="text-rust shrink-0" />
              <div>
                <p className="font-display font-semibold text-3xl">{BUSINESS.workforce.fundi}</p>
                <p className="text-sm text-steel mt-1">Professional fundi &amp; builders</p>
              </div>
            </div>
            <div className="bg-paper p-8 flex items-start gap-4">
              <HardHat size={26} className="text-rust shrink-0" />
              <div>
                <p className="font-display font-semibold text-3xl">{BUSINESS.workforce.porters}</p>
                <p className="text-sm text-steel mt-1">Porters supporting site operations</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20 border-t border-line">
        <Container className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <h2 className="font-display font-semibold text-3xl max-w-md">
            Want to talk through your project with our team?
          </h2>
          <div className="flex gap-4">
            <LinkButton href="/quote">Request a Quote</LinkButton>
            <LinkButton href={waLink()} target="_blank" variant="outline">
              WhatsApp Us
            </LinkButton>
          </div>
        </Container>
      </section>
    </>
  );
}
