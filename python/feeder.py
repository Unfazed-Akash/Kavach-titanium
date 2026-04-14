"""
KAVACH TITANIUM — Python Data Feeder v3.0
==========================================
Generates realistic Indian financial fraud transactions,
inserts into Supabase, and emits real-time events via Socket.IO.

Run:
    pip install -r requirements.txt
    python feeder.py
"""

import os
import sys
import time
import math
import uuid
import random
import asyncio
import numpy as np
from datetime import datetime
from pathlib import Path

# --- Third-party (install via requirements.txt) ---
import socketio
from supabase import create_client, Client
from dotenv import load_dotenv

# --- Local ---
from prediction_engine import PredictionEngine
from data.atm_locations import ATM_LOCATIONS

# ============================================================
# CONFIG
# ============================================================
load_dotenv(dotenv_path=Path(__file__).parent.parent / '.env.local')

SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL', '')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '')
SOCKET_URL   = os.environ.get('NEXT_PUBLIC_SOCKET_URL', 'http://localhost:3001')

FRAUD_RATE        = 0.20   # 20% fraud for good demo visibility
INTERVAL_MIN      = 0.5    # seconds between transactions (min)
INTERVAL_MAX      = 1.5    # seconds between transactions (max)
PREDICTION_TOP_K  = 3      # predicted ATMs per fraud event

# ============================================================
# CONSTANTS
# ============================================================
MERCHANTS = [
    'ATM Withdrawal', 'BigBazaar', 'Amazon Pay', 'Paytm Mall',
    'Swiggy', 'Zomato', 'IRCTC', 'Flipkart', 'PhonePe',
    'BookMyShow', 'Ola', 'Myntra', 'Reliance Digital',
]
MERCHANT_CATS = [
    'Retail', 'Dining', 'Travel', 'Electronics',
    'Groceries', 'Utilities', 'Entertainment', 'Transport',
]
FRAUD_TYPES = [
    'VELOCITY_IMPOSSIBLE_TRAVEL',
    'GEOSPATIAL_ANOMALY',
    'PATTERN_CLONED_CARD',
    'DEVICE_MISMATCH',
    'HIGH_VALUE_ANOMALY',
]
BENFORD_PROBS = [math.log10(1 + 1 / d) for d in range(1, 10)]

# ============================================================
# DATABASE SEEDING
# ============================================================

def seed_supabase(sb: Client):
    """Seed users and ATMs into Supabase if empty."""
    # ATMs
    atm_count = sb.table('atms').select('id', count='exact').execute().count
    if not atm_count or atm_count == 0:
        print('[Database] Seeding ATMs...')
        sb.table('atms').insert(ATM_LOCATIONS).execute()

    # Users
    user_count = sb.table('users').select('user_id', count='exact').execute().count
    if not user_count or user_count == 0:
        print('[Database] Seeding 50 users...')
        users = []
        for i in range(50):
            users.append({
                'user_id': f'IS_USER_{1000 + i}',
                'name': f'Citizen {i}',
                'email': f'citizen{i}@kavach.in',
                'phone': f'987654{1000 + i}',
                'account_numbers': [f'ACCT{random.randint(10000000, 99999999)}'],
                'risk_score': round(random.uniform(0, 0.2), 3),
            })
        sb.table('users').insert(users).execute()

    print('[Database] Ready.')

# ============================================================
# TRANSACTION GENERATION
# ============================================================

def benford_amount() -> float:
    leading = random.choices(range(1, 10), weights=BENFORD_PROBS)[0]
    magnitude = random.choice([100, 1000, 10000])
    return float(leading * magnitude + random.randint(0, magnitude // 2))

def generate_transaction(user_ids: list[str]) -> dict:
    user_id = random.choice(user_ids)
    atm     = random.choice(ATM_LOCATIONS)
    is_fraud = random.random() < FRAUD_RATE

    if is_fraud:
        fraud_type = random.choice(FRAUD_TYPES)
        amount = random.randint(50000, 200000) if fraud_type == 'HIGH_VALUE_ANOMALY' else benford_amount()
        fraud_prob = round(random.uniform(0.90, 0.99), 3)
        status = 'BLOCKED'
        device = f'Emulator_{random.randint(1000, 9999)}'
        ip = f'{random.choice([45, 103, 185])}.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(0,255)}'
    else:
        fraud_type = None
        amount = benford_amount()
        fraud_prob = round(random.uniform(0.01, 0.08), 3)
        status = 'SUCCESS'
        device = f'DEV_{user_id}_{random.randint(1, 2)}'
        ip = f'192.168.{random.randint(0,255)}.{random.randint(0,255)}'

    return {
        'txn_id':             str(uuid.uuid4()),
        'user_id':            user_id,
        'amount':             float(amount),
        'currency':           'INR',
        'merchant':           random.choice(MERCHANTS),
        'merchant_category':  random.choice(MERCHANT_CATS),
        'timestamp':          datetime.utcnow().isoformat(),
        'geo_lat':            atm['lat'],
        'geo_lon':            atm['lng'],
        'city':               atm['city'],
        'device_fingerprint': device,
        'ip_address':         ip,
        'features': {
            'velocity_24h':      random.randint(0, 5),
            'avg_amt_deviation': round(random.uniform(0.1, 3.0), 2),
        },
        'is_fraud':           is_fraud,
        'fraud_probability':  fraud_prob,
        'fraud_type':         fraud_type,
        'status':             status,
        # Extra fields for socket payload (not stored in DB)
        '_atm': atm,
    }

# ============================================================
# MAIN FEEDER LOOP
# ============================================================

async def main():
    print('\n' + '='*60)
    print('  KAVACH TITANIUM — PYTHON DATA FEEDER v3.0')
    print('='*60)

    # ── Supabase ──────────────────────────────────────────
    if not SUPABASE_URL or not SUPABASE_KEY:
        print('[!] Supabase credentials not found in .env.local')
        sys.exit(1)

    sb: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    seed_supabase(sb)

    # ── Load user IDs from DB ─────────────────────────────
    users_res = sb.table('users').select('user_id').execute()
    user_ids = [u['user_id'] for u in (users_res.data or [])]
    if not user_ids:
        print('[!] No users found. Check seeding.')
        sys.exit(1)

    # ── Prediction Engine ─────────────────────────────────
    engine = PredictionEngine()

    # ── Socket.IO Async Client ────────────────────────────
    sio = socketio.AsyncClient()

    @sio.event
    async def connect():
        print(f'[Socket] Connected as feeder to {SOCKET_URL}')

    @sio.event
    async def disconnect():
        print('[Socket] Disconnected from relay server')

    @sio.event
    async def start_simulation(_):
        global running
        running = True
        print('>>> SIMULATION STARTED <<<')

    @sio.event
    async def stop_simulation(_):
        global running
        running = False
        print('>>> SIMULATION PAUSED <<<')

    # Connect with role=feeder
    try:
        await sio.connect(SOCKET_URL, transports=['polling', 'websocket'],
                          headers={'role': 'feeder'})
    except Exception as e:
        print(f'[!] Socket connection failed: {e}')
        print('[!] Make sure socket-server.js is running on port 3001')
        # Continue anyway — will still write to Supabase

    # ── Terminal Header ───────────────────────────────────
    print(f'\n{"TXN ID":<10} | {"AMOUNT":<10} | {"CITY":<12} | {"STATUS":<10} | PREDICTION')
    print('-' * 80)

    global running
    running = True

    while True:
        if running:
            try:
                txn = generate_transaction(user_ids)
                atm = txn.pop('_atm')  # remove temp field before insert

                # ── Insert into Supabase ──────────────────
                sb.table('transactions').insert({
                    k: v for k, v in txn.items()
                    if k not in ('features',)  # skip JSON for simplicity
                }).execute()

                # ── Build socket payload ──────────────────
                payload = {
                    'txn_id':          txn['txn_id'],
                    'sender_id':       txn['user_id'],
                    'amount':          txn['amount'],
                    'location':        atm['location'],
                    'lat':             txn['geo_lat'],
                    'lng':             txn['geo_lon'],
                    'city':            txn['city'],
                    'ip_address':      txn['ip_address'],
                    'device_id':       txn['device_fingerprint'],
                    'fraud_type':      txn['fraud_type'],
                    'is_fraud':        txn['is_fraud'],
                    'fraud_prob':      txn['fraud_probability'],
                    'merchant':        txn['merchant'],
                    'timestamp':       txn['timestamp'],
                    'status':          txn['status'],
                }

                # ── Emit transaction ──────────────────────
                if sio.connected:
                    await sio.emit('new_transaction', payload)

                # ── If fraud, run prediction ──────────────
                if txn['is_fraud']:
                    preds = engine.predict_withdrawal_locations({
                        'lat': txn['geo_lat'],
                        'lng': txn['geo_lon'],
                        'city': txn['city'],
                        'amount': txn['amount'],
                        'timestamp': txn['timestamp'],
                    })
                    pred_text = f"FRAUD → Intercept @ {preds[0]['location'][:20]}..." if preds else 'FRAUD'

                    alert = {
                        'id':             str(uuid.uuid4()),
                        'transaction':    payload,
                        'predicted_atms': preds,
                        'timestamp':      txn['timestamp'],
                        'severity':       'CRITICAL',
                    }
                    if sio.connected:
                        await sio.emit('new_alert', alert)
                else:
                    pred_text = 'Safe'

                # ── Terminal Log ──────────────────────────
                status_str = '🛑 BLOCKED' if txn['is_fraud'] else '✅ SUCCESS'
                print(
                    f"{txn['txn_id'][:8]}.. | "
                    f"₹{txn['amount']:<8.0f} | "
                    f"{txn['city']:<12} | "
                    f"{status_str:<14} | "
                    f"{pred_text}"
                )

            except Exception as e:
                print(f'[!] Error: {e}')

        await asyncio.sleep(random.uniform(INTERVAL_MIN, INTERVAL_MAX))


if __name__ == '__main__':
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print('\n\n[Kavach] Feeder stopped by user.')
