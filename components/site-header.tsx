import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { PoweredByBadge } from "@/components/powered-by-badge";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

type SiteHeaderProps = {
  title?: string;
  description?: string;
};

export function SiteHeader({
  title = SITE_NAME,
  description = SITE_TAGLINE,
}: SiteHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="max-w-2xl">
        <Link href="/" className="inline-flex items-center gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            {title}
          </h1>
        </Link>
        <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
          {description}
        </p>
      </div>
      <div className="shrink-0 sm:pt-1">
        <PoweredByBadge />
      </div>
    </header>
  );
}
