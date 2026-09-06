import type { Metadata } from "next";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/barlow-condensed/500.css";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "H S Constructions | Building & Engineering, Uganda",
  description:
    "H S Constructions provides professional building construction, structural & civil works, engineering consultation and site survey services, delivered by a team of 50+ fundi and 80+ porters.",
  keywords: [
    "H S Constructions",
    "construction company Uganda",
    "building contractors Uganda",
    "engineering consultation",
    "site survey",
    "construction services Uganda",
  ],
  openGraph: {
    title: "H S Constructions | Building & Engineering, Uganda",
    description:
      "Professional construction, engineering consultation and site survey services for projects of every size.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased bg-paper text-ink">{children}</body>
    </html>
  );
}
