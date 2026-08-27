import { ArrowUpRight } from "lucide-react";

import { POWERED_BY_URL } from "@/lib/constants";

type ResultErrorProps = {
  title: string;
  message: string;
  upgradeRequired?: boolean;
};

export function ResultError({ title, message, upgradeRequired }: ResultErrorProps) {
  return (
    <section
      className={`rounded-[32px] border bg-white p-6 shadow-sm sm:p-8 ${
        upgradeRequired ? "border-amber-200" : "border-red-200"
      }`}
    >
      <p
        className={`text-sm font-semibold uppercase tracking-[0.08em] ${
          upgradeRequired ? "text-amber-600" : "text-red-600"
        }`}
      >
        {title}
      </p>
      <h2 className="mt-3 text-2xl font-semibold text-slate-950 sm:text-3xl">
        {upgradeRequired
          ? "IP Security data needs a paid plan"
          : "The security check could not be completed."}
      </h2>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">{message}</p>
      {upgradeRequired ? (
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={`${POWERED_BY_URL}/pricing`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <span className="whitespace-nowrap text-white">View ipgeolocation.io plans</span>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-white" />
          </a>
        </div>
      ) : null}
    </section>
  );
}
