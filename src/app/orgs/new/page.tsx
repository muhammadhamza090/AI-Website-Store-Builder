"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NewOrgPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/orgs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create organization");
        return;
      }

      router.push(`/orgs/${data.organization.slug}`);
    } catch {
      setError("Failed to create organization");
    } finally {
      setCreating(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-lg px-4 py-10">
        <Card className="border-zinc-200">
          <CardHeader className="border-zinc-200">
            <div className="text-lg font-semibold">Create Organization</div>
            <div className="mt-1 text-sm text-zinc-600">
              Organizations group your generated websites together.
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label htmlFor="org-name" className="block text-sm font-medium text-zinc-700 mb-1">
                  Organization Name
                </label>
                <Input
                  id="org-name"
                  placeholder="e.g., My Brand"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
                {slug && (
                  <div className="mt-1.5 text-xs text-zinc-500">
                    URL: <span className="font-mono text-zinc-700">/orgs/{slug}</span>
                  </div>
                )}
              </div>

              {error && (
                <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button type="submit" disabled={creating || name.trim().length < 2}>
                  {creating ? "Creating..." : "Create Organization"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/orgs")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
