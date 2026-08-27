"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

type CopyButtonProps = {
  value: string;
  label?: string;
  copiedLabel?: string;
};

export function CopyButton({
  value,
  label = "Copy",
  copiedLabel = "Copied",
}: CopyButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setStatus("copied");
      window.setTimeout(() => setStatus("idle"), 1800);
    } catch {
      setStatus("error");
      window.setTimeout(() => setStatus("idle"), 1800);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex min-w-32 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
    >
      {status === "copied" ? (
        <Check className="h-4 w-4 shrink-0 text-slate-900" />
      ) : (
        <Copy className="h-4 w-4 shrink-0 text-slate-900" />
      )}
      <span className="whitespace-nowrap text-slate-900">
        {status === "copied"
          ? copiedLabel
          : status === "error"
            ? "Copy failed"
            : label}
      </span>
    </button>
  );
}
