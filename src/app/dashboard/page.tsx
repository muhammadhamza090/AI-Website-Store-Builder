import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { db, desc, schema } from "@/lib/db";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  let sites: Array<{ id: string; businessName: string; createdAt: Date }> = [];
  try {
    sites = await db
      .select({
        id: schema.sites.id,
        businessName: schema.sites.businessName,
        createdAt: schema.sites.createdAt
      })
      .from(schema.sites)
      .orderBy(desc(schema.sites.createdAt));
  } catch {
    sites = [];
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <p className="mt-1 text-sm text-zinc-600">Your generated sites.</p>
          </div>
          <Button asChild>
            <Link href="/generate">Generate</Link>
          </Button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {sites.length === 0 ? (
            <Card>
              <CardHeader className="border-zinc-200">
                <div className="text-sm font-medium">No sites yet</div>
                <div className="mt-1 text-sm text-zinc-600">Generate your first ecommerce website.</div>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/generate">Go to generator</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            sites.map((s) => (
              <Card key={s.id} className="border-zinc-200">
                <CardHeader className="border-zinc-200">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium">{s.businessName}</div>
                      <div className="mt-1 text-xs text-zinc-500">
                        Created {new Date(s.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" asChild>
                        <Link href={`/preview/${s.id}?view=design`}>Design</Link>
                      </Button>
                      <Button variant="secondary" asChild>
                        <Link href={`/preview/${s.id}?view=code`}>Code</Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-zinc-600">
                    Saved in the dashboard with both rendered design preview and downloadable code files.
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
