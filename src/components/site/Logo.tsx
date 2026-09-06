"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { db, seedIfEmpty } from "@/lib/store";

export function Logo({
  className = "",
  imageHeight = 36,
  textClassName = "font-display font-semibold text-2xl tracking-tight",
}: {
  className?: string;
  imageHeight?: number;
  textClassName?: string;
}) {
  const [logoImage, setLogoImage] = useState<string | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    seedIfEmpty();
    setLogoImage(db.settings.get().logoImage);
    setLoaded(true);
  }, []);

  // Avoid a flash of the text wordmark before we know whether a logo image
  // exists; render nothing for one tick, then the correct version.
  if (!loaded) return <span className={className} style={{ display: "inline-block", width: 140, height: imageHeight }} />;

  if (logoImage) {
    return (
      <Image
        src={logoImage}
        alt="H S Constructions logo"
        height={imageHeight}
        width={imageHeight * 3}
        unoptimized
        className={`${className} h-9 w-auto object-contain`}
        style={{ height: imageHeight, width: "auto" }}
      />
    );
  }

  return (
    <span className={`${textClassName} ${className}`}>
      H S <span className="text-rust">CONSTRUCTIONS</span>
    </span>
  );
}
