"use client";

// Compresses an image file into a resized JPEG data URL so it can be stored
// directly in localStorage (there is no file/object storage backend yet).
//
// IMPORTANT: localStorage typically caps out around 5-10MB per origin.
// Keep this to a handful of images per project — this is a stopgap, not a
// real media pipeline. Before production, replace this with real uploads to
// object storage (e.g. S3-compatible storage, or the VPS filesystem served
// via Nginx) and store URLs instead of base64 data in PortfolioProject.images.

const MAX_DIMENSION = 1280;
const JPEG_QUALITY = 0.75;

export function fileToCompressedDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not decode image."));
      img.onload = () => {
        let { width, height } = img;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          const scale = MAX_DIMENSION / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas not supported."));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export async function filesToCompressedDataUrls(files: FileList | File[]): Promise<string[]> {
  const list = Array.from(files);
  const results: string[] = [];
  for (const file of list) {
    if (!file.type.startsWith("image/")) continue;
    try {
      results.push(await fileToCompressedDataUrl(file));
    } catch {
      // Skip files that fail to decode rather than failing the whole batch.
    }
  }
  return results;
}
