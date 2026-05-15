"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Org = {
  id: string;
  name: string;
  slug: string;
  siteCount: number;
  createdAt: string;
};

export default function OrgsPage() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orgs")
      .then((r) => r.json())
      .then((data) => setOrgs(data.organizations ?? []))
      .catch(() => setOrgs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Organizations</h1>
            <p className="mt-1 text-sm text-zinc-600">
              Manage your organizations and their websites.
            </p>
          </div>
          <Button asChild>
            <Link href="/orgs/new">New Organization</Link>
          </Button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="border-zinc-200 animate-pulse">
                <CardHeader className="border-zinc-200">
                  <div className="h-5 w-32 rounded bg-zinc-200" />
                  <div className="mt-2 h-4 w-20 rounded bg-zinc-100" />
                </CardHeader>
                <CardContent>
                  <div className="h-4 w-24 rounded bg-zinc-100" />
                </CardContent>
              </Card>
            ))
          ) : orgs.length === 0 ? (
            <Card className="md:col-span-2 lg:col-span-3">
              <CardContent className="py-12 text-center">
                <div className="text-4xl mb-3">🏢</div>
                <div className="text-sm font-medium">No organizations yet</div>
                <div className="mt-1 text-sm text-zinc-600">
                  Create your first organization to start building websites.
                </div>
                <Button asChild className="mt-4">
                  <Link href="/orgs/new">Create Organization</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            orgs.map((org) => (
              <Link
                key={org.id}
                href={`/orgs/${org.slug}`}
                className="block transition-transform hover:scale-[1.02]"
              >
                <Card className="border-zinc-200 hover:border-zinc-400 hover:shadow-md transition-all h-full">
                  <CardHeader className="border-zinc-200">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 text-white text-sm font-bold">
                        {org.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{org.name}</div>
                        <div className="text-xs text-zinc-500">/{org.slug}</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-zinc-600">
                      <span className="flex items-center gap-1">
                        <span className="text-base">🌐</span>
                        {org.siteCount} {org.siteCount === 1 ? "website" : "websites"}
                      </span>
                      <span className="text-xs text-zinc-400">
                        {new Date(org.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </main>
    </>
  );
}
