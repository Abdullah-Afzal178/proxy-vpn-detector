import type { LucideIcon } from "lucide-react";
import {
  Ban,
  Bot,
  Cloud,
  Globe,
  House,
  Lock,
  Radar,
  RadioTower,
  Server,
  ShieldAlert,
  ShieldCheck,
  Skull,
  VenetianMask,
} from "lucide-react";

import type { SecurityData } from "@/lib/security-types";

type Tone = "danger" | "warn" | "clean";
type SignalState = "dangerActive" | "warnActive" | "inactive";
type MetaRow = { label: string; value: string };

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

const SIGNAL_CARD_TONE: Record<SignalState, string> = {
  dangerActive: "border-red-200",
  warnActive: "border-amber-200",
  inactive: "border-slate-200",
};

const SIGNAL_ICON_TONE: Record<SignalState, string> = {
  dangerActive: "bg-red-50 text-red-600",
  warnActive: "bg-amber-50 text-amber-600",
  inactive: "bg-slate-100 text-slate-400",
};

const SIGNAL_STATUS: Record<SignalState, { text: string; dot: string; label: string }> = {
  dangerActive: { text: "text-red-700", dot: "bg-red-500", label: "Detected" },
  warnActive: { text: "text-amber-700", dot: "bg-amber-500", label: "Detected" },
  inactive: { text: "text-slate-400", dot: "bg-slate-300", label: "Clear" },
};

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
    description: string;
    active: boolean;
    tone: Exclude<Tone, "clean">;
    icon: LucideIcon;
    meta?: MetaRow[];
  }> = [
    {
      label: "VPN",
      description: "Commercial VPN endpoint",
      active: data.isVpn,
      tone: "danger",
      icon: Lock,
      meta: providerMeta(data.vpnProviderNames, data.vpnConfidenceScore, data.vpnLastSeen),
    },
    {
      label: "Proxy",
      description: "Anonymizing or open proxy",
      active: data.isProxy,
      tone: "danger",
      icon: Server,
      meta: providerMeta(data.proxyProviderNames, data.proxyConfidenceScore, data.proxyLastSeen),
    },
    {
      label: "Residential Proxy",
      description: "Proxy routed through residential IPs",
      active: data.isResidentialProxy,
      tone: "danger",
      icon: House,
    },
    {
      label: "Tor Exit Node",
      description: "Exit node on the Tor network",
      active: data.isTor,
      tone: "danger",
      icon: Globe,
    },
    {
      label: "Relay",
      description: "Private relay (e.g. iCloud Private Relay)",
      active: data.isRelay,
      tone: "warn",
      icon: RadioTower,
      meta: [{ label: "Provider", value: data.relayProviderName || "Not disclosed" }],
    },
    {
      label: "Anonymous",
      description: "General anonymization signal",
      active: data.isAnonymous,
      tone: "warn",
      icon: VenetianMask,
    },
    {
      label: "Known Attacker",
      description: "Seen in recent attack activity",
      active: data.isKnownAttacker,
      tone: "danger",
      icon: Skull,
    },
    {
      label: "Bot",
      description: "Automated or bot traffic",
      active: data.isBot,
      tone: "warn",
      icon: Bot,
    },
    {
      label: "Spam",
      description: "Seen in spam activity",
      active: data.isSpam,
      tone: "danger",
      icon: Ban,
    },
    {
      label: "Cloud / Hosting",
      description: "Datacenter or hosting IP",
      active: data.isCloudProvider,
      tone: "warn",
      icon: Cloud,
      meta: [{ label: "Provider", value: data.cloudProviderName || "Not disclosed" }],
    },
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
        <div className="mb-4 flex items-center gap-2">
          <Radar className="h-5 w-5 text-slate-400" />
          <h2 id="signals-heading" className="text-lg font-semibold text-slate-950">
            Detection signals
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {signals.map((signal) => {
            const state: SignalState = signal.active
              ? signal.tone === "danger"
                ? "dangerActive"
                : "warnActive"
              : "inactive";
            const status = SIGNAL_STATUS[state];
            const Icon = signal.icon;
            const meta = signal.active ? signal.meta : undefined;

            return (
              <div
                key={signal.label}
                className={`flex h-full flex-col rounded-2xl border bg-white p-4 shadow-sm ${SIGNAL_CARD_TONE[state]}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${SIGNAL_ICON_TONE[state]}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold ${status.text}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} aria-hidden="true" />
                    {status.label}
                  </span>
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-900">{signal.label}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{signal.description}</p>
                {meta && meta.length > 0 ? (
                  <dl className="mt-4 space-y-1.5 border-t border-slate-100 pt-3">
                    {meta.map((row) => (
                      <div
                        key={row.label}
                        className="flex items-start justify-between gap-3 text-xs"
                      >
                        <dt className="shrink-0 text-slate-500">{row.label}</dt>
                        <dd className="break-words text-right font-medium text-slate-700">
                          {row.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function providerMeta(names: string[], confidence: number, lastSeen: string): MetaRow[] {
  const rows: MetaRow[] = [
    { label: "Provider", value: names.length > 0 ? names.join(", ") : "Not disclosed" },
    { label: "Confidence", value: `${confidence}%` },
  ];

  if (lastSeen.trim()) {
    rows.push({ label: "Last seen", value: lastSeen });
  }

  return rows;
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

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}
