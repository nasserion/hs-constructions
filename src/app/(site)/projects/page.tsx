"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, FolderKanban, ImageOff, X } from "lucide-react";
import { Container } from "@/components/site/Container";
import { LinkButton } from "@/components/ui/Button";
import { db, seedIfEmpty } from "@/lib/store";
import type { PortfolioProject } from "@/lib/types";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [openProject, setOpenProject] = useState<PortfolioProject | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    seedIfEmpty();
    setProjects(db.portfolio.all());
  }, []);

  function openGallery(p: PortfolioProject) {
    setOpenProject(p);
    setPhotoIndex(0);
  }

  const photos = openProject?.images || [];

  return (
    <>
      <section className="bg-ink text-white py-16 sm:py-20">
        <Container>
          <p className="text-rust font-medium text-sm mb-3">Projects</p>
          <h1 className="font-display font-semibold text-5xl sm:text-6xl max-w-2xl">
            Our project portfolio
          </h1>
          <p className="mt-5 text-steel-light max-w-xl">
            Completed and ongoing work carried out by the H S Constructions team.
          </p>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          {projects.length === 0 ? (
            <div className="corner-marks border border-line bg-white p-14 text-center max-w-xl mx-auto">
              <FolderKanban size={32} className="mx-auto text-rust" />
              <h2 className="font-display font-semibold text-2xl mt-4">Projects coming soon</h2>
              <p className="mt-2 text-sm text-steel leading-relaxed">
                Our project portfolio is being prepared. In the meantime, get in touch to discuss
                your project directly with our team.
              </p>
              <LinkButton href="/quote" className="mt-6">
                Request a Quote
              </LinkButton>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => p.images?.length && openGallery(p)}
                  className="text-left bg-white border border-line overflow-hidden group"
                >
                  {p.images && p.images.length > 0 ? (
                    <div className="relative w-full aspect-[4/3] bg-paper-dim overflow-hidden">
                      <Image
                        src={p.images[0]}
                        alt={p.name}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {p.images.length > 1 && (
                        <span className="absolute bottom-2 right-2 text-xs bg-ink/80 text-white px-2 py-0.5 rounded-sm">
                          +{p.images.length - 1} photos
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="w-full aspect-[4/3] bg-paper-dim flex items-center justify-center">
                      <ImageOff size={24} className="text-steel-light" />
                    </div>
                  )}
                  <div className="p-6">
                    <p className="text-xs font-medium text-rust uppercase tracking-wide">{p.category}</p>
                    <h3 className="font-display font-semibold text-2xl mt-2">{p.name}</h3>
                    {p.location && <p className="text-xs text-steel mt-1">{p.location}</p>}
                    <p className="mt-3 text-sm text-steel leading-relaxed">{p.description}</p>
                    <span className="inline-block mt-4 text-xs font-medium px-2.5 py-1 border border-line rounded-sm text-steel">
                      {p.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Container>
      </section>

      {openProject && photos.length > 0 && (
        <div className="fixed inset-0 z-50 bg-ink/95 flex items-center justify-center p-4">
          <button
            onClick={() => setOpenProject(null)}
            aria-label="Close gallery"
            className="absolute top-5 right-5 text-white hover:text-rust"
          >
            <X size={28} />
          </button>
          <div className="relative w-full max-w-3xl aspect-[4/3]">
            <Image
              src={photos[photoIndex]}
              alt={`${openProject.name} photo ${photoIndex + 1}`}
              fill
              unoptimized
              className="object-contain"
            />
          </div>
          {photos.length > 1 && (
            <>
              <button
                onClick={() => setPhotoIndex((i) => (i - 1 + photos.length) % photos.length)}
                aria-label="Previous photo"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-rust"
              >
                <ChevronLeft size={36} />
              </button>
              <button
                onClick={() => setPhotoIndex((i) => (i + 1) % photos.length)}
                aria-label="Next photo"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-rust"
              >
                <ChevronRight size={36} />
              </button>
              <p className="absolute bottom-6 text-white text-sm">
                {photoIndex + 1} / {photos.length}
              </p>
            </>
          )}
        </div>
      )}
    </>
  );
}
