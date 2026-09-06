import Link from "next/link";
import { HardHat } from "lucide-react";
import { Container } from "@/components/site/Container";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { LinkButton } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-28">
        <Container className="max-w-lg text-center">
          <HardHat size={44} className="mx-auto text-rust" />
          <h1 className="font-display font-semibold text-5xl mt-5">Page not found</h1>
          <p className="mt-3 text-steel leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or may have moved.
          </p>
          <LinkButton href="/" className="mt-8">
            Back to Home
          </LinkButton>
          <p className="mt-4 text-sm text-steel">
            or <Link href="/contact" className="text-rust hover:underline">contact us</Link> for help.
          </p>
        </Container>
      </main>
      <Footer />
    </>
  );
}
