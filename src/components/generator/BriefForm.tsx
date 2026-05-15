"use client";

import * as React from "react";
import { z } from "zod";
import { GenerationProgress } from "@/components/generator/GenerationProgress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { websiteBriefSchema } from "@/lib/validation";

type FormState = z.infer<typeof websiteBriefSchema>;
type GenerateResponse = {
  siteId: string;
  website: unknown;
  savedToDb?: boolean;
};

type StageEvent = {
  type: "stage";
  nodeName: string;
  status: "start" | "success" | "error";
  data?: unknown;
};

type ResultEvent = {
  type: "result";
} & GenerateResponse & {
  error?: string;
  message?: string;
  details?: string[];
};

type ErrorEvent = {
  type: "error";
  message?: string;
};

const defaultBrief: FormState = {
  businessName: "LuxeNest",
  industry: "Premium home decor",
  targetAudience: "Modern homeowners who value elegant design",
  productsOrServices: "Furniture, candles, wall art",
  preferredStyle: "",
  preferredColors: "Warm neutrals with a rich accent",
  ecommerceType: "DTC ecommerce store",
  brandTone: "",
  variationStrength: 5
};

export function BriefForm({ initialError = null, orgId }: { initialError?: string | null; orgId?: string }) {
  const [form, setForm] = React.useState<FormState>(defaultBrief);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(initialError);
  const [progress, setProgress] = React.useState<string[]>([]);
  const [estimatedRemainingSec, setEstimatedRemainingSec] = React.useState<number | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setProgress([]);
    setEstimatedRemainingSec(null);

    const parsed = websiteBriefSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setSubmitting(true);
    setEstimatedRemainingSec(240);

    let requestTimeout: number | undefined;
    try {
      const controller = new AbortController();
      requestTimeout = window.setTimeout(() => controller.abort(), 900_000); // 15 minutes — AI graph (5min) + HTML generation (5min) + DB save

      const res = await fetch("/api/generate?stream=1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...parsed.data, orgId }),
        signal: controller.signal
      });
      if (!res.ok || !res.body) {
        window.clearTimeout(requestTimeout);
        const json = (await res.json()) as ResultEvent;
        throw new Error(json?.message || json?.error || "Generation failed");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finished = false;

      while (!finished) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          const event = JSON.parse(trimmed) as StageEvent | ResultEvent | ErrorEvent;

          if (event.type === "stage") {
            handleStageEvent(event, setProgress, setEstimatedRemainingSec);
            continue;
          }

          if (event.type === "error") {
            throw new Error(event.message || "Generation failed");
          }

          if (event.type === "result") {
            if (requestTimeout) {
              window.clearTimeout(requestTimeout);
            }
            try {
              sessionStorage.setItem(
                `generatedWebsite:${event.siteId}`,
                JSON.stringify({
                  website: event.website,
                  generatedHtml: (event as Record<string, unknown>).generatedHtml ?? null,
                  savedToDb: Boolean(event?.savedToDb),
                  createdAt: Date.now()
                })
              );
            } catch {
              // Ignore session storage failures and continue to preview.
            }

            setProgress((current) => finalizeVisibleSteps(current));
            setEstimatedRemainingSec(0);
            finished = true;
            window.location.assign(`/preview/${event.siteId}`);
            break;
          }
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setError("Generation request took too long. Please try again.");
      } else {
        setError(err instanceof Error ? err.message : "Generation failed");
      }
    } finally {
      if (requestTimeout) {
        window.clearTimeout(requestTimeout);
      }
      setEstimatedRemainingSec(null);
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-5">
      <Card className="md:col-span-3">
        <CardHeader className="border-zinc-200">
          <div className="text-sm font-medium">Business brief</div>
          <div className="mt-1 text-sm text-zinc-600">
            Keep it short but specific. The more context, the more unique the result.
          </div>
        </CardHeader>
        <CardContent className="border-zinc-200">
          <form className="space-y-4" action="/generate/submit" method="post" onSubmit={onSubmit}>
            <Field label="Business name">
              <Input
                name="businessName"
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Industry">
                <Input
                  name="industry"
                  value={form.industry}
                  onChange={(e) => setForm({ ...form, industry: e.target.value })}
                />
              </Field>
              <Field label="Ecommerce type">
                <Input
                  name="ecommerceType"
                  value={form.ecommerceType}
                  onChange={(e) => setForm({ ...form, ecommerceType: e.target.value })}
                />
              </Field>
            </div>

            <Field label="Target audience">
              <Textarea
                name="targetAudience"
                value={form.targetAudience}
                onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
              />
            </Field>

            <Field label="Products / services">
              <Textarea
                name="productsOrServices"
                value={form.productsOrServices}
                onChange={(e) => setForm({ ...form, productsOrServices: e.target.value })}
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Preferred colors (optional)">
                <Input
                  name="preferredColors"
                  placeholder="e.g. Warm neutrals, Dark mode, Vibrant..."
                  value={form.preferredColors ?? ""}
                  onChange={(e) => setForm({ ...form, preferredColors: e.target.value })}
                />
              </Field>
            </div>
            <input type="hidden" name="variationStrength" value={String(form.variationStrength)} />

            {error ? (
              <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Generating..." : "Generate website"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={submitting}
                onClick={() => setForm(defaultBrief)}
              >
                Use demo brief
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="md:col-span-2">
        <GenerationProgress
          running={submitting}
          steps={progress}
          totalSteps={10}
          estimatedRemainingSec={estimatedRemainingSec}
        />
        <Card className="mt-4">
          <CardHeader className="border-zinc-200">
            <div className="text-sm font-medium">What you will get</div>
            <div className="mt-1 text-sm text-zinc-600">A dynamic ecommerce preview rendered from JSON.</div>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-700">
              <li>Navbar + footer with business-specific links</li>
              <li>Homepage sections with varied ordering</li>
              <li>Shop + product + cart + checkout page structure</li>
              <li>Color palette + typography guidance</li>
              <li>Product catalog for demos</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const STAGE_LABELS: Record<string, string> = {
  designVariant: "Selecting a distinct design direction",
  analyzeBusiness: "Analyzing business, audience, and brand",
  createStrategy: "Creating conversion-focused store strategy",
  createSitemap: "Planning sitemap and storefront flow",
  createPagePlans: "Planning page layouts and section intent",
  generateContent: "Writing premium website copy",
  generateProducts: "Generating product catalog and descriptions",
  createDesignSystem: "Designing store-specific visual system",
  buildWebsiteHTML: "Building website with AI — writing HTML, CSS & JS",
  validateWebsite: "Validating UX, trust, and professionalism",
  reviseWebsite: "Refining website after validation feedback",
  saveWebsite: "Saving generated website",
  fallbackGenerator: "Preparing safe fallback website"
};

const PROGRESS_SEQUENCE = [
  STAGE_LABELS.analyzeBusiness,
  STAGE_LABELS.createStrategy,
  STAGE_LABELS.createSitemap,
  STAGE_LABELS.createPagePlans,
  STAGE_LABELS.generateContent,
  STAGE_LABELS.generateProducts,
  STAGE_LABELS.createDesignSystem,
  STAGE_LABELS.buildWebsiteHTML,
  STAGE_LABELS.validateWebsite,
  STAGE_LABELS.saveWebsite
];

function handleStageEvent(
  event: StageEvent,
  setProgress: React.Dispatch<React.SetStateAction<string[]>>,
  setEstimatedRemainingSec: React.Dispatch<React.SetStateAction<number | null>>
) {
  if (event.status !== "start" && event.nodeName !== "fallbackGenerator") {
    return;
  }

  const label = STAGE_LABELS[event.nodeName];
  if (!label) return;

  setProgress((current) => {
    if (current.includes(label)) {
      return current;
    }

    const next = [...current, label];
    const remainingCount = Math.max(0, PROGRESS_SEQUENCE.length - next.length);
    setEstimatedRemainingSec(remainingCount * 15);
    return next;
  });
}

function finalizeVisibleSteps(current: string[]) {
  const next = [...current];
  for (const label of PROGRESS_SEQUENCE) {
    if (!next.includes(label)) {
      next.push(label);
    }
  }
  return next;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <div className="text-xs font-medium text-zinc-700">{label}</div>
      {children}
    </label>
  );
}
