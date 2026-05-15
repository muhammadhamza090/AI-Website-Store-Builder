import { pgSchema, text, jsonb, timestamp, boolean, uuid, index, uniqueIndex } from "drizzle-orm/pg-core";
import { createId } from "./cuid";

/**
 * Database schema name — read from DB_SCHEMA env var.
 */
// DB_SCHEMA is validated at runtime (inside request handlers).
// Using a placeholder at module-eval time prevents Next.js build from
// failing when it statically analyses routes that import this module.
const schemaName = process.env.DB_SCHEMA ?? "__build_placeholder__";
export const ecomStore = pgSchema(schemaName);

// ── Organizations ────────────────────────────────────────────────────────────

export const organizations = ecomStore.table(
  "organizations",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    logoUrl: text("logo_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdateFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("organizations_slug_idx").on(table.slug),
  ]
);

// ── Sites ────────────────────────────────────────────────────────────────────

export const sites = ecomStore.table(
  "sites",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    orgId: text("org_id").references(() => organizations.id, { onDelete: "cascade" }),
    businessName: text("business_name").notNull(),
    slug: text("slug").unique(),
    published: boolean("published").notNull().default(false),
    customDomain: text("custom_domain").unique(),
    briefJson: jsonb("brief_json").notNull(),
    websiteJson: jsonb("website_json").notNull(),
    generatedHtml: text("generated_html"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdateFn(() => new Date()),
  },
  (table) => [
    index("sites_org_id_idx").on(table.orgId),
    index("sites_slug_idx").on(table.slug),
    index("sites_custom_domain_idx").on(table.customDomain),
  ]
);

// ── Generation Logs ──────────────────────────────────────────────────────────

export const generationLogs = ecomStore.table(
  "generation_logs",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    siteId: text("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    nodeName: text("node_name").notNull(),
    status: text("status").notNull(),
    inputJson: jsonb("input_json"),
    outputJson: jsonb("output_json"),
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("generation_logs_site_id_idx").on(table.siteId),
  ]
);

// ── Org Members (for auth) ───────────────────────────────────────────────────

export const orgMembers = ecomStore.table(
  "org_members",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    userId: uuid("user_id").notNull(),
    orgId: text("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("admin"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("org_members_user_org_idx").on(table.userId, table.orgId),
  ]
);

// ── Type helpers ─────────────────────────────────────────────────────────────

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type Site = typeof sites.$inferSelect;
export type NewSite = typeof sites.$inferInsert;
export type GenerationLog = typeof generationLogs.$inferSelect;
export type NewGenerationLog = typeof generationLogs.$inferInsert;
export type OrgMember = typeof orgMembers.$inferSelect;
export type NewOrgMember = typeof orgMembers.$inferInsert;

