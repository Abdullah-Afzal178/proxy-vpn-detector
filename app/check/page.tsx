import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

import { CopyButton } from "@/components/copy-button";
import { ResultError } from "@/components/result-error";
import { SecurityReport } from "@/components/security-report";
import { SiteHeader } from "@/components/site-header";
import { getIpSecurity } from "@/lib/security";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Proxy & VPN Checker — Check Any IP for VPN, Proxy & Tor",
  description:
    "Enter any IPv4 or IPv6 address to check whether it is a VPN, proxy, Tor exit node, or known threat — with a risk score and provider details. Powered by the ipgeolocation.io IP Security API.",
  alternates: {
    canonical: "/check",
  },
};

const EXAMPLES = [
  { label: "VPN", ip: "2.56.188.34" },
  { label: "Tor exit", ip: "185.220.101.1" },
  { label: "Clean", ip: "8.8.8.8" },
];

type PageProps = {
  searchParams: Promise<{
    ip?: string | string[];
  }>;
};

function IpSearchForm({ ip }: { ip: string }) {
  return (
    <form action="/check" method="get" className="mt-6">
      <label htmlFor="ip" className="sr-only">
        IP address
      </label>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <input
          id="ip"
          name="ip"
          type="text"
          defaultValue={ip}
          placeholder="2.56.188.34 or 2606:4700:4700::1111"
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          <Search className="h-4 w-4 shrink-0 text-white" />
          <span className="whitespace-nowrap text-white">Check IP</span>
        </button>
      </div>
    </form>
  );
}

function ExampleLinks() {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <span className="text-sm text-slate-500">Try an example:</span>
      {EXAMPLES.map((example) => (
        <Link
          key={example.ip}
          href={`/check?ip=${example.ip}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
        >
          {example.label}
          <span className="font-mono text-slate-400">{example.ip}</span>
        </Link>
      ))}
    </div>
  );
}

export default async function CheckPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const rawIp = Array.isArray(params.ip) ? params.ip[0] : params.ip;
  const ip = rawIp?.trim() ?? "";
  const result = ip ? await getIpSecurity(ip) : null;

  return (
    <main className="min-h-screen bg-stone-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <SiteHeader />

        {!ip ? (
          <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-sky-700">
              Server-side IP security check
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">
              Proxy &amp; VPN checker
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Enter any IPv4 or IPv6 address to check whether it is a VPN, proxy, Tor exit
              node, relay, or known threat. Requests are made on the server so the API key
              stays private.
            </p>

            <IpSearchForm ip={ip} />
            <ExampleLinks />

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4 shrink-0 text-slate-900" />
                <span className="whitespace-nowrap text-slate-900">Check Your Own IP</span>
              </Link>
            </div>
          </section>
        ) : result && !result.ok ? (
          <>
            <ResultError
              title={result.error.title}
              message={result.error.message}
              upgradeRequired={result.error.upgradeRequired}
            />
            <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <IpSearchForm ip={ip} />
              <ExampleLinks />
            </section>
          </>
        ) : result?.ok ? (
          <>
            <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.08em] text-sky-700">
                    Security check result
                  </p>
                  <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                    {result.data.ip}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <CopyButton value={result.data.ip} label="Copy IP" />
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
                  >
                    <ArrowLeft className="h-4 w-4 shrink-0 text-slate-900" />
                    <span className="whitespace-nowrap text-slate-900">Check Your Own IP</span>
                  </Link>
                </div>
              </div>

              <IpSearchForm ip={ip} />
            </section>

            <SecurityReport data={result.data} />
          </>
        ) : null}
      </div>
    </main>
  );
}
