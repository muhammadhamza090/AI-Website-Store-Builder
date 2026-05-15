"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { BriefForm } from "@/components/generator/BriefForm";

export default function OrgGeneratePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [orgId, setOrgId] = useState<string | null>(null);
  const [orgName, setOrgName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orgs/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setOrgId(data.organization?.id ?? null);
        setOrgName(data.organization?.name ?? "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 py-10">
          <div className="animate-pulse h-8 w-48 rounded bg-zinc-200" />
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2">
            <Link href="/orgs" className="hover:text-zinc-700">Organizations</Link>
            <span>/</span>
            <Link href={`/orgs/${slug}`} className="hover:text-zinc-700">{orgName}</Link>
            <span>/</span>
            <span className="text-zinc-700">Generate</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Generate a website</h1>
          <p className="mt-1 text-sm text-zinc-600">
            This website will be saved to <strong>{orgName}</strong>.
          </p>
        </div>
        <BriefForm orgId={orgId ?? undefined} />
      </main>
    </>
  );
}
