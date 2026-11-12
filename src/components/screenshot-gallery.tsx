"use client";

import Image, { type StaticImageData } from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

export interface GalleryItem {
  id: string;
  image: StaticImageData;
  caption: string;
}

interface ScreenshotGalleryProps {
  items: GalleryItem[];
  labels: {
    open: string; // contains "{caption}"
    close: string;
    previous: string;
    next: string;
    count: string; // contains "{current}" and "{total}"
  };
}

/**
 * Bento grid of screenshots; each opens a native <dialog> lightbox with
 * arrow-key / swipe navigation. Esc and focus return come from <dialog>.
 */
export function ScreenshotGallery({ items, labels }: ScreenshotGalleryProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState<number | null>(null);
  const touchX = useRef<number | null>(null);

  const open = (i: number) => {
    setIndex(i);
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();
  const step = useCallback(
    (delta: number) =>
      setIndex((i) => (i === null ? i : (i + delta + items.length) % items.length)),
    [items.length],
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, step]);

  const current = index === null ? null : items[index];

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {items.map((item, i) => (
          <li key={item.id} className={i === 0 ? "col-span-2 row-span-2" : ""}>
            <button
              type="button"
              onClick={() => open(i)}
              aria-label={labels.open.replace("{caption}", item.caption)}
              className="group relative block aspect-video w-full overflow-hidden rounded-lg arcane-frame focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arcane"
            >
              <Image
                src={item.image}
                alt=""
                placeholder="blur"
                sizes={
                  i === 0
                    ? "(min-width: 1024px) 560px, 100vw"
                    : "(min-width: 1024px) 280px, 50vw"
                }
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              />
              <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 to-transparent px-3 pb-2 pt-8 text-left text-xs text-fg opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                {item.caption}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        onClose={() => setIndex(null)}
        onClick={(e) => {
          if (e.target === dialogRef.current) close();
        }}
        className="lightbox m-auto max-h-none max-w-none bg-transparent p-0 text-fg backdrop:bg-transparent"
        aria-label={current?.caption}
      >
        {current && index !== null && (
          <figure
            className="flex w-[min(92vw,1400px)] flex-col gap-3"
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
              touchX.current = null;
            }}
          >
            <div className="relative aspect-video w-full overflow-hidden rounded-lg arcane-frame bg-night">
              <Image
                key={current.id}
                src={current.image}
                alt={current.caption}
                placeholder="blur"
                sizes="92vw"
                className="h-full w-full object-contain"
              />
            </div>
            <figcaption className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <span className="text-fg">{current.caption}</span>
              <span className="flex items-center gap-2">
                <span className="mr-2 font-mono text-xs text-fg-muted">
                  {labels.count
                    .replace("{current}", String(index + 1))
                    .replace("{total}", String(items.length))}
                </span>
                <LightboxButton onClick={() => step(-1)} label={labels.previous}>
                  ←
                </LightboxButton>
                <LightboxButton onClick={() => step(1)} label={labels.next}>
                  →
                </LightboxButton>
                <LightboxButton onClick={close} label={labels.close}>
                  ✕
                </LightboxButton>
              </span>
            </figcaption>
          </figure>
        )}
      </dialog>
    </>
  );
}

function LightboxButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-10 w-10 place-items-center rounded-md border border-fg/20 bg-ink/70 text-fg transition-colors hover:border-arcane hover:text-arcane"
    >
      <span aria-hidden="true">{children}</span>
    </button>
  );
}
