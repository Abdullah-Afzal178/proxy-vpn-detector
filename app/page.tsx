import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Suspense } from "react";

import { CopyButton } from "@/components/copy-button";
import { PageSkeleton } from "@/components/page-skeleton";
import { ResultError } from "@/components/result-error";
import { SecurityReport } from "@/components/security-report";
import { SiteHeader } from "@/components/site-header";
import { getMyIpSecurity } from "@/lib/security";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  const result = await getMyIpSecurity();

  return (
    <main className="min-h-screen bg-stone-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <SiteHeader />

        {result.ok ? (
          <>
            <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.08em] text-sky-700">
                    Your IP address
                  </p>
                  <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                    {result.data.ip}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <CopyButton value={result.data.ip} label="Copy IP" />
                  <Link
                    href="/check"
                    className="inline-flex min-w-44 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                  >
                    <span className="whitespace-nowrap text-white">Check Another IP</span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-white" />
                  </Link>
                </div>
              </div>
            </section>

            <SecurityReport data={result.data} />
          </>
        ) : (
          <ResultError
            title={result.error.title}
            message={result.error.message}
            upgradeRequired={result.error.upgradeRequired}
          />
        )}
      </div>
    </main>
  );
}
