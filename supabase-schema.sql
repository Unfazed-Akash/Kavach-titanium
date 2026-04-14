-- ============================================================
-- KAVACH TITANIUM — SUPABASE DATABASE SCHEMA
-- ============================================================
-- Run this ENTIRE script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/vdcvyhnqrxrugaipjupz/sql
-- ============================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    user_id         TEXT PRIMARY KEY,
    name            TEXT,
    email           TEXT UNIQUE,
    phone           TEXT,
    account_numbers JSONB DEFAULT '[]',
    risk_score      FLOAT DEFAULT 0.0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ATMs TABLE
CREATE TABLE IF NOT EXISTS public.atms (
    id       TEXT PRIMARY KEY,
    city     TEXT NOT NULL,
    location TEXT NOT NULL,
    lat      FLOAT NOT NULL,
    lng      FLOAT NOT NULL,
    status   TEXT DEFAULT 'ONLINE'
);

-- 3. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.transactions (
    txn_id              TEXT PRIMARY KEY,
    user_id             TEXT REFERENCES public.users(user_id) ON DELETE SET NULL,
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

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_transactions_is_fraud  ON public.transactions(is_fraud);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON public.transactions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_city      ON public.transactions(city);

-- 4. FRAUD ALERTS TABLE
CREATE TABLE IF NOT EXISTS public.fraud_alerts (
    alert_id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    transaction_id     TEXT REFERENCES public.transactions(txn_id) ON DELETE CASCADE,
    severity           TEXT DEFAULT 'HIGH',
    description        TEXT,
    predicted_location JSONB,
    timestamp          TIMESTAMPTZ DEFAULT NOW(),
    status             TEXT DEFAULT 'NEW'
);

-- 5. COMPLAINTS TABLE
CREATE TABLE IF NOT EXISTS public.complaints (
    ticket_id     TEXT PRIMARY KEY,
    user_id       TEXT REFERENCES public.users(user_id) ON DELETE SET NULL,
    reporter_name TEXT,
    contact_email TEXT,
    mobile_no     TEXT,
    account_no    TEXT,
    fraud_type    TEXT,
    description   TEXT,
    evidence_path TEXT,
    status        TEXT DEFAULT 'OPEN',
    priority      TEXT DEFAULT 'MEDIUM',
    timestamp     TIMESTAMPTZ DEFAULT NOW()
);

-- 6. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    log_id    BIGSERIAL PRIMARY KEY,
    action    TEXT,
    entity_id TEXT,
    details   JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DISABLE Row Level Security (this is a simulation/demo app)
-- ============================================================
ALTER TABLE public.users        DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.atms         DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_alerts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints   DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs   DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- Done! Run the Python feeder to seed users and ATMs.
-- ============================================================
