import type { Metadata } from "next";
import { Phone, Mail, MessageCircle, Send } from "lucide-react";
import { Container } from "@/components/site/Container";
import { LinkButton } from "@/components/ui/Button";
import { BUSINESS, mailLink, telLink, waLink } from "@/lib/business";

export const metadata: Metadata = {
  title: "Contact Us | H S Constructions",
  description: "Get in touch with H S Constructions by WhatsApp, phone or email.",
};

export default function ContactPage() {
  return (
    <>
      <section className="bg-ink text-white py-16 sm:py-20">
        <Container>
          <p className="text-rust font-medium text-sm mb-3">Contact</p>
          <h1 className="font-display font-semibold text-5xl sm:text-6xl max-w-2xl">
            Let&apos;s talk about your project
          </h1>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="grid lg:grid-cols-3 gap-8">
          <ContactCard
            icon={<MessageCircle size={24} className="text-rust" />}
            title="WhatsApp Us"
            value={BUSINESS.whatsappDisplay}
            href={waLink()}
            cta="Chat on WhatsApp"
            external
          />
          <ContactCard
            icon={<Phone size={24} className="text-rust" />}
            title="Call Us"
            value={BUSINESS.phoneDisplay}
            href={telLink()}
            cta="Call Now"
          />
          <ContactCard
            icon={<Mail size={24} className="text-rust" />}
            title="Email Us"
            value={BUSINESS.email}
            href={mailLink("Enquiry from website")}
            cta="Send an Email"
          />
        </Container>
      </section>

      <section className="pb-16 sm:pb-20">
        <Container>
          <div className="corner-marks border border-line bg-white p-10 sm:p-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
            <div>
              <h2 className="font-display font-semibold text-3xl">
                {BUSINESS.director.name}
              </h2>
              <p className="text-steel mt-1">{BUSINESS.director.title}</p>
              <p className="text-sm text-steel mt-4 max-w-md leading-relaxed">
                For project enquiries, quotations and consultations, reach the {BUSINESS.name}{" "}
                team directly through WhatsApp, phone or email.
              </p>
            </div>
            <LinkButton href="/quote" size="lg" className="shrink-0">
              <Send size={16} /> Send an Inquiry
            </LinkButton>
          </div>
        </Container>
      </section>
    </>
  );
}

function ContactCard({
  icon,
  title,
  value,
  href,
  cta,
  external,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  href: string;
  cta: string;
  external?: boolean;
}) {
  return (
    <div className="border border-line bg-white p-8 flex flex-col">
      <div className="w-12 h-12 rounded-full bg-rust/10 flex items-center justify-center">{icon}</div>
      <h3 className="font-display font-semibold text-2xl mt-5">{title}</h3>
      <p className="mt-1 text-sm text-steel">{value}</p>
      <LinkButton
        href={href}
        target={external ? "_blank" : undefined}
        variant="outline"
        size="sm"
        className="mt-6 self-start"
      >
        {cta}
      </LinkButton>
    </div>
  );
}
