"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PhotoGalleryPhoto {
  url: string;
  alt: string | null;
}

export interface PhotoGalleryProps {
  photos: PhotoGalleryPhoto[];
  fallbackAlt: string;
  className?: string;
}

export function PhotoGallery({ photos, fallbackAlt, className }: PhotoGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (photos.length === 0) {
    return (
      <div className={cn("flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border border-border bg-bg-elevated text-text-subtle", className)}>
        <ImageOff className="size-8" aria-hidden="true" />
        <p className="text-sm">No photos available yet</p>
      </div>
    );
  }

  const active = photos[activeIndex] ?? photos[0];

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-bg-elevated">
        <Image
          src={active.url}
          alt={active.alt ?? fallbackAlt}
          fill
          priority
          sizes="(min-width: 1024px) 768px, 100vw"
          className="object-cover"
        />
      </div>
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {photos.map((photo, i) => (
            <button
              key={photo.url + i}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-label={`Show photo ${i + 1} of ${photos.length}`}
              aria-current={i === activeIndex}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-lg border transition-colors motion-reduce:transition-none",
                i === activeIndex ? "border-primary" : "border-border opacity-70 hover:opacity-100"
              )}
            >
              <Image src={photo.url} alt={photo.alt ?? fallbackAlt} fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
