export function Section({
  id,
  children,
  className,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-20 border-b border-hairline px-6 py-20 ${className ?? ""}`}
    >
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

/**
 * Numbered display heading — the site's sections read as stations on the
 * factory line, so each carries a mono ticket index next to display type.
 */
export function SectionHeading({
  index,
  children,
}: {
  index: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline gap-4">
      <span aria-hidden="true" className="font-mono text-sm text-worker">
        {index}
      </span>
      <h2 className="font-display text-4xl font-semibold tracking-tight text-fg sm:text-5xl">
        {children}
      </h2>
    </div>
  );
}
