import postgres from 'postgres';

// Supabase pooler - username format variations
const password = 'Excelstech2026%24%24';
const project = 'yqgzbjnpresiebblnxlf';

const urls = [
  // Correct pooler format: username is postgres.[project-ref]
  `postgresql://postgres.${project}:${password}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${project}:${password}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`,
  // Try different AWS regions
  `postgresql://postgres.${project}:${password}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${project}:${password}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`,
  // Try with encoded password differently
  `postgresql://postgres.${project}:Excelstech2026$$@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
];

for (const url of urls) {
  const display = url.replace(/:([^@]+)@/, ':***@');
  console.log('\n🔗 Trying:', display);
  const sql = postgres(url, { connect_timeout: 10, max: 1 });
  try {
    const result = await sql`SELECT current_database() as db`;
    console.log('✅ SUCCESS! Connected to:', result[0].db);
    console.log('\n🎉 Working URL:');
    console.log('DATABASE_URL=' + url);
    await sql.end();
    process.exit(0);
  } catch (e) {
    console.error('❌', e.message);
    try { await sql.end(); } catch {}
  }
}

console.log('\n❌ All URLs failed. Check Supabase dashboard for correct pooler URL.');
