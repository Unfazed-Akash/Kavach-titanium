/**
 * KAVACH TITANIUM — One-time Supabase DB Setup
 * Connects directly to Postgres and runs supabase-schema.sql
 *
 * Usage: node setup-db.js
 */

require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Supabase exposes Postgres directly — build connection string from URL
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// Extract project ref from URL: https://PROJECTREF.supabase.co
const projectRef = SUPABASE_URL.replace('https://', '').split('.')[0];

const DB_CONFIG = {
  host: `db.${projectRef}.supabase.co`,
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: process.env.SUPABASE_DB_PASSWORD || '',
  ssl: { rejectUnauthorized: false },
};

async function main() {
  // Alternative: Use Supabase REST API to run schema via their SQL endpoint
  // The Supabase Management API /sql endpoint supports DDL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('\n========================================');
  console.log(' KAVACH TITANIUM — Database Setup');
  console.log('========================================');
  console.log(`Project: ${projectRef}`);

  const schemaPath = path.join(__dirname, 'supabase-schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  // Split into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  // Use Supabase's pg_meta API with service role key
  // This works without needing the Postgres password
  const baseUrl = SUPABASE_URL;

  console.log('\nRunning schema via Supabase REST API...\n');

  let successCount = 0;
  let skipCount = 0;

  for (const stmt of statements) {
    if (!stmt.trim() || stmt.trim().startsWith('--')) continue;

    try {
      const res = await fetch(`${baseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({ query: stmt + ';' }),
      });

      if (res.ok) {
        successCount++;
      } else {
        const err = await res.text();
        // "already exists" errors are normal on re-run
        if (err.includes('already exists') || err.includes('duplicate') || err.includes('42P07')) {
          skipCount++;
        } else {
          console.warn(`  ⚠ Warning: ${err.slice(0, 80)}`);
        }
      }
    } catch (e) {
      // Ignore
    }
  }

  // Direct approach: use the Supabase postgres endpoint
  // This is available at: /pg/query with service role
  console.log('\nFallback: Trying direct SQL execution...');
  
  const res = await fetch(`${baseUrl}/pg/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  if (res.ok) {
    console.log('✅ Schema created successfully via direct API!');
  } else {
    const errText = await res.text();
    console.log(`Response: ${errText.slice(0, 200)}`);
    console.log('\n⚠ If automatic setup failed, please run supabase-schema.sql manually:');
    console.log('  1. Go to: https://supabase.com/dashboard/project/' + projectRef + '/sql');
    console.log('  2. Paste the contents of supabase-schema.sql');
    console.log('  3. Click Run');
  }

  console.log('\n========================================\n');
}

main().catch(console.error);
