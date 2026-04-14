/**
 * KAVACH TITANIUM — Database Setup via Supabase Management API
 * 
 * Usage: node run-schema.js
 * 
 * This uses the Supabase Management API which supports DDL SQL
 * without needing browser login.
 */

require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Extract project ref: https://PROJECTREF.supabase.co → PROJECTREF
const PROJECT_REF = SUPABASE_URL.replace('https://', '').split('.')[0];

const SCHEMA_SQL = `
-- Users
CREATE TABLE IF NOT EXISTS public.users (
    user_id         TEXT PRIMARY KEY,
    name            TEXT,
    email           TEXT UNIQUE,
    phone           TEXT,
    account_numbers JSONB DEFAULT '[]',
    risk_score      FLOAT DEFAULT 0.0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ATMs
CREATE TABLE IF NOT EXISTS public.atms (
    id       TEXT PRIMARY KEY,
    city     TEXT NOT NULL,
    location TEXT NOT NULL,
    lat      FLOAT NOT NULL,
    lng      FLOAT NOT NULL,
    status   TEXT DEFAULT 'ONLINE'
);

-- Transactions
CREATE TABLE IF NOT EXISTS public.transactions (
    txn_id              TEXT PRIMARY KEY,
    user_id             TEXT,
    amount              FLOAT NOT NULL,
    currency            TEXT DEFAULT 'INR',
    merchant            TEXT,
    merchant_category   TEXT,
    timestamp           TIMESTAMPTZ DEFAULT NOW(),
    geo_lat             FLOAT,
    geo_lon             FLOAT,
    city                TEXT,
    device_fingerprint  TEXT,
    ip_address          TEXT,
    is_fraud            BOOLEAN DEFAULT FALSE,
    fraud_probability   FLOAT DEFAULT 0.0,
    fraud_type          TEXT,
    status              TEXT DEFAULT 'PROCESSING'
);

-- Indexes for speed
CREATE INDEX IF NOT EXISTS idx_txn_fraud     ON public.transactions(is_fraud);
CREATE INDEX IF NOT EXISTS idx_txn_timestamp ON public.transactions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_txn_city      ON public.transactions(city);

-- Complaints
CREATE TABLE IF NOT EXISTS public.complaints (
    ticket_id     TEXT PRIMARY KEY,
    user_id       TEXT,
    reporter_name TEXT,
    contact_email TEXT,
    mobile_no     TEXT,
    account_no    TEXT,
    fraud_type    TEXT,
    description   TEXT,
    status        TEXT DEFAULT 'OPEN',
    priority      TEXT DEFAULT 'MEDIUM',
    timestamp     TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS for demo/simulation use
ALTER TABLE public.users        DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.atms         DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints   DISABLE ROW LEVEL SECURITY;
`;

async function runSchema() {
  console.log('\n' + '='.repeat(55));
  console.log('  KAVACH TITANIUM — Database Setup');
  console.log('='.repeat(55));
  console.log(`  Project : ${PROJECT_REF}`);
  console.log(`  Method  : Supabase Management API`);
  console.log('='.repeat(55) + '\n');

  // Supabase Management API endpoint for running SQL
  const endpoint = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({ query: SCHEMA_SQL }),
    });

    const text = await res.text();

    if (res.ok) {
      console.log('✅  Schema created successfully!');
      console.log('\nTables created:');
      console.log('  ✓ users');
      console.log('  ✓ atms');
      console.log('  ✓ transactions');
      console.log('  ✓ complaints');
      console.log('  ✓ RLS disabled on all tables');
      return true;
    } else {
      console.log(`Response [${res.status}]: ${text.slice(0, 300)}`);
      return false;
    }
  } catch (err) {
    console.error('Error:', err.message);
    return false;
  }
}

runSchema().then(success => {
  if (!success) {
    console.log('\n' + '='.repeat(55));
    console.log('  MANUAL SETUP REQUIRED');
    console.log('='.repeat(55));
    console.log('  1. Open your browser and go to:');
    console.log(`     https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`);
    console.log('  2. Log in to Supabase');
    console.log('  3. Paste the contents of supabase-schema.sql');
    console.log('  4. Click Run (or Ctrl+Enter)');
    console.log('='.repeat(55) + '\n');
  }
});
