import { POWERED_BY_URL } from "@/lib/constants";

type PoweredByBadgeProps = {
  className?: string;
};

export function PoweredByBadge({ className }: PoweredByBadgeProps) {
  return (
    <a
      href={POWERED_BY_URL}
      target="_blank"
      rel="noreferrer"
      className={[
        "inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 shadow-sm transition hover:border-slate-400 hover:text-slate-950 sm:text-sm",
        className ?? "",
      ].join(" ")}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"
        aria-hidden="true"
      />
      Powered by ipgeolocation.io
    </a>
  );
}
