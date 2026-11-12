export function Section({
  id,
  children,
  className,
  navSection,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
  /** Which nav item the companion bot perches on while this section is in view. */
  navSection?: string;
}) {
  return (
    <section
      id={id}
      data-nav-section={navSection}
      className={`scroll-mt-20 px-6 py-20 sm:py-28 ${className ?? ""}`}
    >
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

/**
 * Eyebrow label + display heading. `tone` picks the accent: gold for Arcanes,
 * cyan for the studio's own work.
 */
export function SectionHeading({
  label,
  children,
  tone = "studio",
  as: Tag = "h2",
}: {
  label: string;
  children: React.ReactNode;
  tone?: "arcane" | "studio";
  as?: "h1" | "h2";
}) {
  return (
    <div className="flex flex-col gap-3">
      <p
        className={
          tone === "arcane"
            ? "font-pixel text-sm uppercase tracking-[0.2em] text-arcane"
            : "font-mono text-xs uppercase tracking-[0.2em] text-worker"
        }
      >
        {label}
      </p>
      <Tag className="max-w-3xl text-balance font-display text-4xl font-semibold tracking-tight text-fg sm:text-5xl">
        {children}
      </Tag>
    </div>
  );
}

export function ExternalArrow() {
  return (
    <span aria-hidden="true" className="inline-block translate-y-[-1px]">
      ↗
    </span>
  );
}
