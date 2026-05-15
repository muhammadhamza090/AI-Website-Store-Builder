import { db, eq, schema } from "@/lib/db";
import { CmsSidebar } from "@/components/cms/CmsSidebar";
import { notFound } from "next/navigation";

export default async function CmsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;

  // Fetch site data
  const [site] = await db
    .select({
      id: schema.sites.id,
      businessName: schema.sites.businessName,
      published: schema.sites.published,
    })
    .from(schema.sites)
    .where(eq(schema.sites.id, siteId))
    .limit(1);

  if (!site) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-900">
      <CmsSidebar
        siteId={site.id}
        siteName={site.businessName}
        published={site.published}
      />
      <main className="ml-64 min-h-screen p-6">
        {children}
      </main>
    </div>
  );
}
