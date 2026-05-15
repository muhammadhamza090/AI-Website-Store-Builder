"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type OrgSite = {
  id: string;
  businessName: string;
  createdAt: string;
  updatedAt: string;
};

type OrgData = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
};

export default function OrgDashboardPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [org, setOrg] = useState<OrgData | null>(null);
  const [sites, setSites] = useState<OrgSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/orgs/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("Organization not found");
        return r.json();
      })
      .then((data) => {
        setOrg(data.organization);
        setSites(data.sites ?? []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 py-10">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 rounded bg-zinc-200" />
            <div className="h-5 w-32 rounded bg-zinc-100" />
            <div className="grid gap-4 md:grid-cols-2 mt-6">
              {[1, 2].map((i) => (
                <div key={i} className="h-32 rounded-lg bg-zinc-100" />
              ))}
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error || !org) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 py-10">
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-4xl mb-3">❌</div>
              <div className="text-sm font-medium">{error || "Organization not found"}</div>
              <Button asChild className="mt-4" variant="outline">
                <Link href="/orgs">Back to Organizations</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-10">
        {/* Header */}
        <div className="flex items-end justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 text-white text-lg font-bold">
              {org.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{org.name}</h1>
              <p className="text-sm text-zinc-500">
                {sites.length} {sites.length === 1 ? "website" : "websites"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href={`/orgs/${slug}/generate`}>Generate Website</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/orgs">All Orgs</Link>
            </Button>
          </div>
        </div>

        {/* Sites grid */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {sites.length === 0 ? (
            <Card className="md:col-span-2">
              <CardContent className="py-12 text-center">
                <div className="text-4xl mb-3">🌐</div>
                <div className="text-sm font-medium">No websites yet</div>
                <div className="mt-1 text-sm text-zinc-600">
                  Generate your first website for {org.name}.
                </div>
                <Button asChild className="mt-4">
                  <Link href={`/orgs/${slug}/generate`}>Generate Website</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            sites.map((site) => (
              <Card key={site.id} className="border-zinc-200 hover:border-zinc-400 hover:shadow-md transition-all">
                <CardHeader className="border-zinc-200">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">{site.businessName}</div>
                      <div className="mt-1 text-xs text-zinc-500">
                        {new Date(site.createdAt).toLocaleDateString()} at{" "}
                        {new Date(site.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" asChild>
                        <Link href={`/cms/${site.id}`}>CMS</Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/preview/${site.id}?view=design`}>Design</Link>
                      </Button>
                      <Button variant="secondary" size="sm" asChild>
                        <Link href={`/preview/${site.id}?view=code`}>Code</Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-zinc-600">
                    Manage content, products, and theme in the CMS panel.
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </>
  );
}
