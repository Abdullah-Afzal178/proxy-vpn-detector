import { ShieldAlert, ShieldCheck } from "lucide-react";

import { DetailCard } from "@/components/detail-card";
import type { SecurityData } from "@/lib/security-types";

type Tone = "danger" | "warn" | "clean";

type SecurityReportProps = {
  data: SecurityData;
};

const HERO_TONE: Record<Tone, string> = {
  danger: "border-red-200",
  warn: "border-amber-200",
  clean: "border-emerald-200",
};

const HERO_ICON_TONE: Record<Tone, string> = {
  danger: "bg-red-50 text-red-600",
  warn: "bg-amber-50 text-amber-600",
  clean: "bg-emerald-50 text-emerald-700",
};

const METER_TONE: Record<Tone, string> = {
  danger: "bg-red-500",
  warn: "bg-amber-500",
  clean: "bg-emerald-500",
};

const PILL_ACTIVE_TONE: Record<Exclude<Tone, "clean">, string> = {
  danger: "border-red-200 bg-red-50 text-red-700",
  warn: "border-amber-200 bg-amber-50 text-amber-700",
};

const PILL_INACTIVE = "border-slate-200 bg-slate-50 text-slate-500";

export function SecurityReport({ data }: SecurityReportProps) {
  const detected = [
    data.isVpn ? "VPN" : null,
    data.isProxy ? "Proxy" : null,
    data.isResidentialProxy ? "Residential proxy" : null,
    data.isTor ? "Tor" : null,
    data.isRelay ? "Relay" : null,
  ].filter((value): value is string => value !== null);

  const band = threatBand(data.threatScore);
  const tone = overallTone(data, band.tone);

  const headline =
    detected.length > 0
      ? `${detected.join(" · ")} detected`
      : "No VPN, proxy, or Tor detected";

  const subline =
    tone === "danger"
      ? "This IP shows anonymization or threat signals — treat traffic from it with caution."
      : tone === "warn"
        ? "This IP shows some signals worth reviewing before you trust it."
        : "No VPN, proxy, Tor, or known-threat signals were found for this IP.";

  const HeroIcon = tone === "clean" ? ShieldCheck : ShieldAlert;

  const signals: Array<{
    label: string;
    active: boolean;
    tone: Exclude<Tone, "clean">;
    detail?: string;
  }> = [
    { label: "VPN", active: data.isVpn, tone: "danger", detail: providerDetail(data.vpnProviderNames, data.vpnConfidenceScore) },
    { label: "Proxy", active: data.isProxy, tone: "danger", detail: providerDetail(data.proxyProviderNames, data.proxyConfidenceScore) },
    { label: "Residential Proxy", active: data.isResidentialProxy, tone: "danger" },
    { label: "Tor Exit Node", active: data.isTor, tone: "danger" },
    { label: "Relay", active: data.isRelay, tone: "warn", detail: emptyToUndefined(data.relayProviderName) },
    { label: "Anonymous", active: data.isAnonymous, tone: "warn" },
    { label: "Known Attacker", active: data.isKnownAttacker, tone: "danger" },
    { label: "Bot", active: data.isBot, tone: "warn" },
    { label: "Spam", active: data.isSpam, tone: "danger" },
    { label: "Cloud / Hosting", active: data.isCloudProvider, tone: "warn", detail: emptyToUndefined(data.cloudProviderName) },
  ];

  const details = [
    { label: "Threat Score", value: `${data.threatScore} / 100` },
    { label: "VPN Provider", value: listOrDash(data.vpnProviderNames) },
    { label: "VPN Confidence", value: data.isVpn ? `${data.vpnConfidenceScore}%` : "—" },
    { label: "Proxy Provider", value: listOrDash(data.proxyProviderNames) },
    { label: "Proxy Confidence", value: data.isProxy ? `${data.proxyConfidenceScore}%` : "—" },
    { label: "Cloud / Hosting Provider", value: dash(data.cloudProviderName) },
    { label: "Relay Provider", value: dash(data.relayProviderName) },
    { label: "Last Seen", value: dash(data.vpnLastSeen || data.proxyLastSeen) },
  ];

  return (
    <div className="space-y-6">
      <section
        className={`rounded-[28px] border ${HERO_TONE[tone]} bg-white p-6 shadow-sm sm:p-8`}
        aria-labelledby="verdict-heading"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <span
              className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${HERO_ICON_TONE[tone]}`}
            >
              <HeroIcon className="h-6 w-6" />
            </span>
            <div>
              <h2
                id="verdict-heading"
                className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl"
              >
                {headline}
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">{subline}</p>
            </div>
          </div>

          <div className="w-full max-w-xs shrink-0">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-medium uppercase tracking-[0.1em] text-slate-500">
                Threat score
              </span>
              <span className="text-sm font-semibold text-slate-950">
                {data.threatScore}/100 · {band.label}
              </span>
            </div>
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${METER_TONE[band.tone]}`}
                style={{ width: `${clampPercent(data.threatScore)}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="signals-heading">
        <h2 id="signals-heading" className="mb-4 text-lg font-semibold text-slate-950">
          Detection signals
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {signals.map((signal) => (
            <div
              key={signal.label}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-slate-700">{signal.label}</span>
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                    signal.active ? PILL_ACTIVE_TONE[signal.tone] : PILL_INACTIVE
                  }`}
                >
                  {signal.active ? "Yes" : "No"}
                </span>
              </div>
              {signal.active && signal.detail ? (
                <p className="mt-2 break-words text-xs text-slate-500">{signal.detail}</p>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="details-heading">
        <h2 id="details-heading" className="mb-4 text-lg font-semibold text-slate-950">
          Details
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {details.map((detail) => (
            <DetailCard key={detail.label} label={detail.label} value={detail.value} />
          ))}
        </dl>
      </section>
    </div>
  );
}

function threatBand(score: number): { label: string; tone: Tone } {
  if (score >= 65) {
    return { label: "High risk", tone: "danger" };
  }

  if (score >= 25) {
    return { label: "Medium risk", tone: "warn" };
  }

  return { label: "Low risk", tone: "clean" };
}

function overallTone(data: SecurityData, threatTone: Tone): Tone {
  if (
    data.isVpn ||
    data.isProxy ||
    data.isResidentialProxy ||
    data.isTor ||
    data.isKnownAttacker ||
    data.isSpam ||
    threatTone === "danger"
  ) {
    return "danger";
  }

  if (
    data.isRelay ||
    data.isAnonymous ||
    data.isCloudProvider ||
    data.isBot ||
    threatTone === "warn"
  ) {
    return "warn";
  }

  return "clean";
}

function providerDetail(names: string[], confidence: number): string | undefined {
  const parts: string[] = [];

  if (names.length > 0) {
    parts.push(names.join(", "));
  }

  if (confidence > 0) {
    parts.push(`${confidence}% confidence`);
  }

  return parts.length > 0 ? parts.join(" · ") : undefined;
}

function listOrDash(values: string[]) {
  return values.length > 0 ? values.join(", ") : "—";
}

function dash(value: string) {
  return value.trim() ? value : "—";
}

function emptyToUndefined(value: string) {
  return value.trim() ? value : undefined;
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}
