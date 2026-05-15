"use client";

import * as React from "react";

const STAGE_ICONS: Record<string, string> = {
  "Analyzing business, audience, and brand": "🔍",
  "Creating conversion-focused store strategy": "📈",
  "Planning sitemap and storefront flow": "🗺️",
  "Planning page layouts and section intent": "📐",
  "Writing premium website copy": "✍️",
  "Generating product catalog and descriptions": "🛍️",
  "Designing store-specific visual system": "🎨",
  "Building website with AI — writing HTML, CSS & JS": "⚡",
  "Validating UX, trust, and professionalism": "✅",
  "Refining website after validation feedback": "🔧",
  "Saving generated website": "💾",
  "Preparing safe fallback website": "🛡️"
};

export function GenerationProgress({
  running,
  steps,
  totalSteps
}: {
  running: boolean;
  steps: string[];
  totalSteps: number;
  estimatedRemainingSec?: number | null;
}) {
  const progressPct = totalSteps > 0 ? Math.min(100, Math.round((steps.length / totalSteps) * 100)) : 0;

  if (!running && steps.length === 0) return null;

  const activeStep = running ? steps[steps.length - 1] : null;
  const doneSteps = running ? steps.slice(0, -1) : steps;

  return (
    <div className="overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-white via-indigo-50/40 to-violet-50/40 shadow-sm">

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-indigo-100 px-5 py-4">
        {running ? (
          <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-indigo-500" />
          </span>
        ) : (
          <span className="flex h-2.5 w-2.5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500" />
        )}
        <span className="text-sm font-semibold text-zinc-800">
          {running ? "Generating your website…" : "Generation complete"}
        </span>
      </div>

      {/* Progress bar */}
      <div className="px-5 pt-4">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-indigo-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-0.5 px-5 pb-5 pt-3">

        {/* Completed steps */}
        {doneSteps.map((step) => (
          <div
            key={step}
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-zinc-500"
          >
            <span className="text-base leading-none opacity-60">{STAGE_ICONS[step] ?? "◆"}</span>
            <span className="flex-1">{step}</span>
            <span className="text-[10px] font-semibold text-emerald-600">done</span>
          </div>
        ))}

        {/* Active (loading) step */}
        {activeStep && (
          <div className="flex items-center gap-3 rounded-xl bg-indigo-50 px-3 py-2.5 text-sm shadow-sm">
            <span className="animate-bounce text-base leading-none">
              {STAGE_ICONS[activeStep] ?? "◆"}
            </span>
            <span className="flex-1 font-semibold text-indigo-800">{activeStep}</span>
            {/* Loading dots */}
            <span className="flex items-center gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </span>
          </div>
        )}

        {/* Empty state */}
        {running && steps.length === 0 && (
          <div className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-zinc-400">
            <span className="animate-spin text-base">⏳</span>
            <span>Starting pipeline…</span>
          </div>
        )}
      </div>
    </div>
  );
}
