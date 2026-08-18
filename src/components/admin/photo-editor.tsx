"use client";

import { useState } from "react";
import type { UseFieldArrayReturn, UseFormRegister, UseFormWatch } from "react-hook-form";
import { Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ListingFormValues } from "@/lib/listing-schema";

// URL-based only for this MVP — no upload infra / external bucket needed.
// Persists straight to the Photo model. A real uploader (Vercel Blob /
// UploadThing) can replace the "Add photo" input later without touching
// the rest of this component: it would just append {url, alt} the same way.
export interface PhotoEditorProps {
  fieldArray: UseFieldArrayReturn<ListingFormValues, "photos">;
  register: UseFormRegister<ListingFormValues>;
  watch: UseFormWatch<ListingFormValues>;
}

export function PhotoEditor({ fieldArray, register, watch }: PhotoEditorProps) {
  const { fields, append, remove, move } = fieldArray;
  const [newUrl, setNewUrl] = useState("");

  function handleAdd() {
    const url = newUrl.trim();
    if (!url) return;
    append({ url, alt: "" });
    setNewUrl("");
  }

  return (
    <div className="flex flex-col gap-3">
      {fields.length === 0 && <p className="text-sm text-text-muted">No photos yet.</p>}

      {fields.map((field, index) => {
        const liveUrl = watch(`photos.${index}.url`);
        return (
          <div key={field.id} className="flex items-center gap-2 rounded-lg border border-border bg-bg-elevated p-2">
            <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-bg-surface">
              {liveUrl && (
                // Arbitrary admin-entered URLs won't be in next.config's
                // remotePatterns allowlist — a plain <img> avoids that for
                // this admin-only preview thumbnail.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={liveUrl}
                  alt=""
                  className="size-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.visibility = "hidden";
                  }}
                />
              )}
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <Input {...register(`photos.${index}.url`)} placeholder="https://…" className="text-xs" />
              <Input {...register(`photos.${index}.alt`)} placeholder="Alt text (optional)" className="text-xs" />
            </div>
            <div className="flex flex-col gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                title="Make primary"
                aria-label="Make primary photo"
                disabled={index === 0}
                onClick={() => move(index, 0)}
              >
                <Star className={index === 0 ? "size-3.5 fill-primary text-primary" : "size-3.5"} />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                title="Move up"
                aria-label="Move photo up"
                disabled={index === 0}
                onClick={() => move(index, index - 1)}
              >
                ↑
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                title="Move down"
                aria-label="Move photo down"
                disabled={index === fields.length - 1}
                onClick={() => move(index, index + 1)}
              >
                ↓
              </Button>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              title="Remove"
              aria-label="Remove photo"
              onClick={() => remove(index)}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        );
      })}

      <div className="flex gap-2">
        <Input
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder="https://example.com/photo.jpg"
        />
        <Button type="button" variant="outline" onClick={handleAdd}>
          Add photo
        </Button>
      </div>
    </div>
  );
}
