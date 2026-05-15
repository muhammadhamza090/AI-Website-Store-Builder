/**
 * Seed script: Create "ExcelsTech" org and link all existing sites to it.
 * Run: node scripts/seed-org.mjs
 */
import postgres from "postgres";
import "dotenv/config";

const DATABASE_URL = process.env.DATABASE_URL;
const DB_SCHEMA = process.env.DB_SCHEMA || "ecom_store";

if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const sql = postgres(DATABASE_URL);

const ORG_ID = "org_excelstech";
const ORG_NAME = "ExcelsTech";
const ORG_SLUG = "excelstech";

async function seed() {
  console.log(`Seeding "${ORG_NAME}" organization...`);

  // Create org if not exists
  const existing = await sql`
    SELECT id FROM ${sql(DB_SCHEMA)}.organizations WHERE slug = ${ORG_SLUG}
  `;

  if (existing.length === 0) {
    await sql`
      INSERT INTO ${sql(DB_SCHEMA)}.organizations (id, name, slug, created_at, updated_at)
      VALUES (${ORG_ID}, ${ORG_NAME}, ${ORG_SLUG}, NOW(), NOW())
    `;
    console.log(`✅ Created org "${ORG_NAME}" (${ORG_SLUG})`);
  } else {
    console.log(`⏭️  Org "${ORG_NAME}" already exists`);
  }

  // Link all existing sites with null org_id to ExcelsTech
  const result = await sql`
    UPDATE ${sql(DB_SCHEMA)}.sites
    SET org_id = ${ORG_ID}
    WHERE org_id IS NULL
  `;
  console.log(`✅ Linked ${result.count} existing sites to "${ORG_NAME}"`);

  await sql.end();
  console.log("Done!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
