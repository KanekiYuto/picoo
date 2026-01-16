"use client";

import Image from "next/image";
import { Image as ImageIcon, Upload, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface ImageUploadProps {
  label?: string;
  description?: string;
  name?: string;
  accept?: string;
  maxSizeMB?: number;
  required?: boolean;
  disabled?: boolean;
  value?: File | null;
  onChange?: (file: File | null) => void;
  strings?: {
    remove: string;
    change: string;
    cta: string;
    recommendation: string;
    previewAlt: string;
    maxSizeHint: string;
    errors: {
      invalidType: string;
      maxSize: string;
    };
  };
  className?: string;
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"] as const;
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** index;
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

export function ImageUpload({
  label = "Upload Image",
  description = "PNG, JPG, WEBP",
  name,
  accept = "image/*",
  maxSizeMB = 10,
  required,
  disabled,
  value,
  onChange,
  strings,
  className,
}: ImageUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [internalFile, setInternalFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const file = value !== undefined ? value : internalFile;
  const maxSizeHint =
    strings?.maxSizeHint?.replace("{maxSizeMB}", String(maxSizeMB)) ??
    `Up to ${maxSizeMB}MB`;
  const constraintsText =
    description +
    (maxSizeMB > 0
      ? `${description ? " • " : ""}${maxSizeHint}`
      : "");

  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function setFile(next: File | null) {
    if (onChange) onChange(next);
    if (value === undefined) setInternalFile(next);
  }

  function validateAndSet(next: File | null) {
    setError(null);
    if (!next) {
      setFile(null);
      return;
    }
    if (!next.type.startsWith("image/")) {
      setError(strings?.errors.invalidType ?? "Please upload an image file.");
      return;
    }
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (maxSizeMB > 0 && next.size > maxBytes) {
      setError(
        (strings?.errors.maxSize ?? `Max file size is ${maxSizeMB} MB.`).replace(
          "{maxSizeMB}",
          String(maxSizeMB),
        ),
      );
      return;
    }
    setFile(next);
  }

  function openPicker() {
    inputRef.current?.click();
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-3">
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-foreground"
          >
            {label}
            {required ? <span className="text-primary"> *</span> : null}
          </label>
          {file ? (
            <button
              type="button"
              onClick={() => validateAndSet(null)}
              disabled={disabled}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/10 px-3 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <X className="h-4 w-4" aria-hidden />
              {strings?.remove ?? "Remove"}
            </button>
          ) : null}
        </div>
      </div>

      <div
        className={cn(
          "relative overflow-hidden rounded-3xl border border-dashed border-border bg-muted/10",
          disabled
            ? "opacity-70"
            : "cursor-pointer transition-colors hover:bg-muted/20",
          isDragging ? "border-primary bg-muted/20" : null,
        )}
        onClick={() => {
          if (!disabled) openPicker();
        }}
        onDragEnter={(event) => {
          if (disabled) return;
          event.preventDefault();
          event.stopPropagation();
          setIsDragging(true);
        }}
        onDragOver={(event) => {
          if (disabled) return;
          event.preventDefault();
          event.stopPropagation();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          if (disabled) return;
          event.preventDefault();
          event.stopPropagation();
          setIsDragging(false);
        }}
        onDrop={(event) => {
          if (disabled) return;
          event.preventDefault();
          event.stopPropagation();
          setIsDragging(false);
          const dropped = event.dataTransfer.files?.[0] ?? null;
          validateAndSet(dropped);
        }}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(event) => {
          if (disabled) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openPicker();
          }
        }}
        aria-disabled={disabled ? true : undefined}
      >
        <input
          ref={inputRef}
          id={inputId}
          name={name}
          type="file"
          accept={accept}
          required={required}
          disabled={disabled}
          className="sr-only"
          onChange={(event) => {
            const next = event.target.files?.[0] ?? null;
            validateAndSet(next);
          }}
        />

        {file && previewUrl ? (
          <div className="grid gap-4 p-4 sm:grid-cols-[140px_1fr] sm:items-center sm:p-5">
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border bg-muted/30">
              <Image
                src={previewUrl}
                alt={strings?.previewAlt ?? "Selected image preview"}
                fill
                unoptimized
                className="object-cover"
                sizes="140px"
              />
            </div>

            <div className="min-w-0 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatBytes(file.size)}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={(event) => {
                    event.stopPropagation();
                    openPicker();
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Upload className="h-4 w-4" aria-hidden />
                  {strings?.change ?? "Change"}
                </button>
              </div>

              {error ? (
                <p className="text-xs font-medium text-primary">{error}</p>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="flex min-h-48 flex-col items-center justify-center gap-3 p-6 text-center sm:min-h-56">
            <span className="grid h-12 w-12 place-items-center rounded-full border border-border bg-muted/20 text-muted-foreground">
              <ImageIcon className="h-5 w-5" aria-hidden />
            </span>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                {strings?.cta ?? "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-muted-foreground">{constraintsText}</p>
              <p className="text-xs text-muted-foreground">
                {strings?.recommendation ??
                  "We recommend a clear, front-facing photo in good lighting."}
              </p>
              {error ? (
                <p className="pt-2 text-xs font-medium text-primary">{error}</p>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
