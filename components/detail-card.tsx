type DetailCardProps = {
  label: string;
  value: string;
  compact?: boolean;
};

export function DetailCard({ label, value, compact = false }: DetailCardProps) {
  return (
    <div
      className={[
        "border border-slate-200 bg-white shadow-sm",
        compact ? "rounded-xl p-2.5" : "rounded-2xl p-5",
      ].join(" ")}
    >
      <dt
        className={[
          "font-medium text-slate-500",
          compact ? "text-[10px] uppercase tracking-[0.1em]" : "text-sm",
        ].join(" ")}
      >
        {label}
      </dt>
      <dd
        className={[
          "break-words font-semibold text-slate-950",
          compact ? "mt-1 text-[13px] leading-5" : "mt-2 text-base",
        ].join(" ")}
      >
        {value}
      </dd>
    </div>
  );
}
