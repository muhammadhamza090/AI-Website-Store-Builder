-- ============================================================
-- AI Ecommerce Website Builder — Phase 1: ecom_store2 Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Step 1: Create new schema
CREATE SCHEMA IF NOT EXISTS ecom_store2;

-- Step 2: Organizations table
CREATE TABLE IF NOT EXISTS ecom_store2.organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS org_slug_idx ON ecom_store2.organizations (slug);

-- Step 3: Sites table (with new columns: slug, published, custom_domain)
CREATE TABLE IF NOT EXISTS ecom_store2.sites (
  id TEXT PRIMARY KEY,
  org_id TEXT REFERENCES ecom_store2.organizations(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  slug TEXT UNIQUE,
  published BOOLEAN NOT NULL DEFAULT false,
  custom_domain TEXT UNIQUE,
  brief_json JSONB NOT NULL,
  website_json JSONB NOT NULL,
  generated_html TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS sites_org_id_idx ON ecom_store2.sites (org_id);
CREATE INDEX IF NOT EXISTS sites_slug_idx ON ecom_store2.sites (slug);
CREATE INDEX IF NOT EXISTS sites_custom_domain_idx ON ecom_store2.sites (custom_domain);

-- Step 4: Generation logs table
CREATE TABLE IF NOT EXISTS ecom_store2.generation_logs (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL REFERENCES ecom_store2.sites(id) ON DELETE CASCADE,
  node_name TEXT NOT NULL,
  status TEXT NOT NULL,
  input_json JSONB,
  output_json JSONB,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS gen_logs_site_id_idx ON ecom_store2.generation_logs (site_id);

-- Step 5: Org members table (for auth — Phase 2)
CREATE TABLE IF NOT EXISTS ecom_store2.org_members (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID NOT NULL,
  org_id TEXT NOT NULL REFERENCES ecom_store2.organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, org_id)
);

-- Step 6: Copy data from ecom_store to ecom_store2
INSERT INTO ecom_store2.organizations (id, name, slug, logo_url, created_at, updated_at)
SELECT id, name, slug, logo_url, created_at, updated_at
FROM ecom_store.organizations
ON CONFLICT (id) DO NOTHING;

INSERT INTO ecom_store2.sites (id, org_id, business_name, brief_json, website_json, generated_html, created_at, updated_at)
SELECT id, org_id, business_name, brief_json, website_json, generated_html, created_at, updated_at
FROM ecom_store.sites
ON CONFLICT (id) DO NOTHING;

-- Step 7: Generate slugs for existing sites
UPDATE ecom_store2.sites 
SET slug = LOWER(REGEXP_REPLACE(business_name, '[^a-z0-9]+', '-', 'gi'))
WHERE slug IS NULL;

-- Step 8: Copy generation logs
INSERT INTO ecom_store2.generation_logs (id, site_id, node_name, status, input_json, output_json, error, created_at)
SELECT id, site_id, node_name, status, input_json, output_json, error, created_at
FROM ecom_store.generation_logs
ON CONFLICT (id) DO NOTHING;

-- Verify
SELECT 'organizations' as tbl, count(*) FROM ecom_store2.organizations
UNION ALL
SELECT 'sites', count(*) FROM ecom_store2.sites
UNION ALL
SELECT 'generation_logs', count(*) FROM ecom_store2.generation_logs;
