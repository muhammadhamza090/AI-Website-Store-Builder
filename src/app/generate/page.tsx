import { Navbar } from "@/components/layout/Navbar";
import { BriefForm } from "@/components/generator/BriefForm";

export default function GeneratePage({
  searchParams
}: {
  searchParams?: { error?: string };
}) {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Generate a site</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Fill out a brief and we will generate a unique ecommerce website JSON + live preview.
          </p>
        </div>
        <BriefForm initialError={searchParams?.error ?? null} />
      </main>
    </>
  );
}
