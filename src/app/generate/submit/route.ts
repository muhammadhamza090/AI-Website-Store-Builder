import { NextResponse } from "next/server";
import { websiteBriefSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const formData = await req.formData();
  const candidate = {
    businessName: String(formData.get("businessName") ?? ""),
    industry: String(formData.get("industry") ?? ""),
    targetAudience: String(formData.get("targetAudience") ?? ""),
    productsOrServices: String(formData.get("productsOrServices") ?? ""),
    preferredStyle: String(formData.get("preferredStyle") ?? ""),
    preferredColors: String(formData.get("preferredColors") ?? ""),
    ecommerceType: String(formData.get("ecommerceType") ?? ""),
    brandTone: String(formData.get("brandTone") ?? "")
  };

  const parsed = websiteBriefSchema.safeParse(candidate);
  const baseUrl = new URL(req.url);

  if (!parsed.success) {
    const url = new URL("/generate", baseUrl);
    url.searchParams.set("error", parsed.error.issues[0]?.message ?? "Invalid input");
    return NextResponse.redirect(url, 303);
  }

  const apiUrl = new URL("/api/generate", baseUrl);
  const res = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
    cache: "no-store"
  });

  const json = (await res.json()) as {
    siteId?: string;
    error?: string;
    message?: string;
  };

  if (!res.ok || !json.siteId) {
    const url = new URL("/generate", baseUrl);
    url.searchParams.set("error", json.message || json.error || "Generation failed");
    return NextResponse.redirect(url, 303);
  }

  const previewUrl = new URL(`/preview/${json.siteId}`, baseUrl);
  return NextResponse.redirect(previewUrl, 303);
}
