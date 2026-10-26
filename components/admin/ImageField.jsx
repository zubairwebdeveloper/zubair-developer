"use client";

import Image from "next/image";
import { useState } from "react";
import { Controller } from "react-hook-form";
import { FiExternalLink, FiImage, FiTrash2 } from "react-icons/fi";

import { MediaLibrary } from "@/components/admin/MediaLibrary";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils/cn";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/** Readable file name taken from an image URL, for display only. */
function getFileName(url) {
  try {
    const last = String(url)
      .split("?")[0]
      .split("#")[0]
      .split("/")
      .filter(Boolean)
      .pop();
    return last ? decodeURIComponent(last) : "";
  } catch {
    return "";
  }
}

export function ImageField({ control, name, label, description }) {
  const [open, setOpen] = useState(false);
  const [brokenUrl, setBrokenUrl] = useState(""); // last URL that failed to load

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const hasImage = Boolean(field.value);
        const previewFailed = hasImage && brokenUrl === field.value;
        const fileName = hasImage ? getFileName(field.value) : "";

        return (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={`${name}-choose`}>{label}</FieldLabel>

            {hasImage ? (
              <div className="flex w-full max-w-sm flex-col gap-3">
                <div
                  className={cn(
                    "relative aspect-video w-full overflow-hidden rounded-xl border bg-muted/40",
                    fieldState.invalid ? "border-destructive" : "border-border",
                  )}
                >
                  {previewFailed ? (
                    <div className="flex h-full flex-col items-center justify-center gap-1.5 p-4 text-center">
                      <FiImage
                        aria-hidden="true"
                        className="h-6 w-6 text-muted-foreground"
                      />
                      <p className="text-sm font-medium">Preview unavailable</p>
                      <p className="text-xs text-muted-foreground">
                        The image could not be loaded. Choose a different one.
                      </p>
                    </div>
                  ) : (
                    <Image
                      src={field.value}
                      alt={`${label} preview`}
                      fill
                      sizes="(max-width: 640px) 100vw, 384px"
                      className="object-cover"
                      onError={() => setBrokenUrl(field.value)}
                    />
                  )}
                </div>

                {fileName ? (
                  <p
                    className="truncate text-xs text-muted-foreground"
                    title={fileName}
                  >
                    {fileName}
                  </p>
                ) : null}
              </div>
            ) : (
              <button
                id={`${name}-choose`}
                type="button"
                onClick={() => setOpen(true)}
                aria-invalid={fieldState.invalid || undefined}
                className={cn(
                  "flex aspect-video w-full max-w-sm flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/30 p-4 text-center transition-colors motion-reduce:transition-none",
                  "hover:border-primary/50 hover:bg-primary/5",
                  fieldState.invalid ? "border-destructive" : "border-border",
                  focusRing,
                )}
              >
                <span
                  aria-hidden="true"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"
                >
                  <FiImage className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium">Choose image</span>
                <span className="text-xs text-muted-foreground">
                  Pick from your media library or upload a new one
                </span>
              </button>
            )}

            {hasImage ? (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  id={`${name}-choose`}
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(true)}
                >
                  Change image
                </Button>
                <Button  variant="ghost">
                  <a
                    href={field.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gap-1.5"
                  >
                    <span>View full size</span>
                    <FiExternalLink aria-hidden="true" className="h-4 w-4" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => field.onChange("")}
                  className="gap-1.5 text-muted-foreground hover:text-destructive"
                >
                  <FiTrash2 aria-hidden="true" className="h-4 w-4" />
                  <span>Remove</span>
                </Button>
              </div>
            ) : null}

            {description ? (
              <FieldDescription>{description}</FieldDescription>
            ) : null}
            {fieldState.invalid ? (
              <FieldError errors={[fieldState.error]} />
            ) : null}

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Media library</DialogTitle>
                  <DialogDescription>
                    Choose an existing image or upload a new one.
                  </DialogDescription>
                </DialogHeader>
                <MediaLibrary
                  mode="pick"
                  onSelect={(item) => {
                    field.onChange(item.url);
                    setOpen(false);
                  }}
                />
              </DialogContent>
            </Dialog>
          </Field>
        );
      }}
    />
  );
}
