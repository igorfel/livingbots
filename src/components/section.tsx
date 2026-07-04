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
