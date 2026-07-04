"use client";

import { useState } from "react";
import { prefersReducedMotion } from "@/lib/bot-engine/config";

interface EmailCtaProps {
  label: string;
  email: string;
}

/** On click, a bot picks up an envelope and flies it off-screen — then the mailto fires. */
export function EmailCta({ label, email }: EmailCtaProps) {
  const [flying, setFlying] = useState(false);
  const mailto = `mailto:${email}`;

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (flying || prefersReducedMotion()) return;
    e.preventDefault();
    setFlying(true);
    window.setTimeout(() => {
      window.location.href = mailto;
    }, 650);
  }

  return (
    <span className="relative mt-8 inline-block">
      <a
        href={mailto}
        onClick={handleClick}
        className="inline-flex items-center gap-2 rounded-full bg-foreman px-6 py-3 font-medium text-ink transition-opacity hover:opacity-90"
      >
        {label}
        <span className="font-mono text-sm">{email}</span>
      </a>
      {flying && (
        <span
          aria-hidden="true"
          className="envelope-fly pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1"
        >
          <span className="block h-2 w-2 rounded-sm bg-worker" />
          <span className="block h-3 w-4 rounded-[1px] border border-fg bg-panel" />
        </span>
      )}
    </span>
  );
}
