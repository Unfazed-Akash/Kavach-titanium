# 🛡️ KAVACH TITANIUM — Next.js Edition

**India's next-generation AI-powered real-time fraud detection platform.**  
Built with Next.js 14, Supabase, Socket.IO, and Python ML.

---

## 🏗️ Architecture

```
kavach-titanium-next/
├── app/                   # Next.js App Router
│   ├── page.tsx           # 🗺️  God Eye Dashboard (live map)
│   ├── lea/page.tsx       # 🚔  LEA Operations Center
│   ├── bank/page.tsx      # 🏦  Banking Core Dashboard
│   ├── portal/page.tsx    # 👤  Citizen Shield Portal
│   └── api/               # REST endpoints → Supabase
├── components/
│   ├── Navbar.tsx         # Premium top navigation
│   ├── AstraPanel.tsx     # Threat intelligence side panel
│   └── LiveMap.tsx        # Dynamic Leaflet map
├── lib/
│   ├── supabase.ts        # DB clients (browser + server)
│   ├── socket.ts          # Socket.IO singleton
│   └── atmLocations.ts    # 70 ATM coordinates
├── python/                # Standalone data feeder
│   ├── feeder.py          # Main generator → Supabase + Socket
│   ├── prediction_engine.py  # ML withdrawal predictor
│   ├── models/            # Pre-trained RandomForest
│   └── data/atm_locations.py
├── socket-server.js       # Socket.IO relay server (Node.js)
└── supabase-schema.sql    # Database migration
```

---

## ⚡ Quick Start

### Step 1 — Database Setup

1. Open your Supabase SQL Editor:  
   `https://supabase.com/dashboard/project/vdcvyhnqrxrugaipjupz/sql`
2. Paste and run the contents of **`supabase-schema.sql`**

### Step 2 — Next.js Frontend + API

```powershell
# Install dependencies (already done)
npm install

# Start everything (Next.js + Socket relay)
npm run dev:all
```

Frontend runs at: **http://localhost:3000**  
Socket server runs at: **http://localhost:3001**

### Step 3 — Python Data Feeder

```powershell
cd python

# Create virtual environment
python -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the feeder
python feeder.py
```

---

## 🖥️ The Four Dashboards

| Route | Name | Description |
|---|---|---|
| `/` | **God Eye** | Live India map with real-time ATM fraud markers, ASTRA intelligence panel |
| `/lea` | **LEA Ops** | CyberPol operations — suspect table, risk scores, deploy units |
| `/bank` | **Banking Core** | Liability prevented, cards blocked, real-time intervention log |
| `/portal` | **Citizen Shield** | Fraud complaint submission → Supabase |

---

## 🎮 Running a Demo

1. Start all servers with `npm run dev:all`
2. In a separate terminal, run `python python/feeder.py`
3. Open `http://localhost:3000`
4. Click **🎮 START SIMULATION** — watch the map light up with fraud alerts
5. Click any red alert in the feed to open the ASTRA panel

---

## 🔑 Environment Variables

Stored in `.env.local` (not committed to Git):

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

---

## 🧠 ML System

- **Model**: RandomForest Classifier (pre-trained, 9.5MB)
- **Features**: amount, log(amount), hour_of_day, velocity_1h, geo_cluster, lat, lng
- **Prediction**: Top-3 ATMs most likely to be used for withdrawal after a fraud event
- **Scoring**: Inverse haversine distance weighted by normalized probability

---

## 📡 Real-Time Architecture

```
Python Feeder ──emit──► Socket Relay (port 3001)
                             │
                    ┌────────┼────────┐
                    ▼        ▼        ▼
              God Eye    LEA Ops  Bank Core
             (browser) (browser) (browser)
```

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, CSS Variables |
| Database | Supabase (PostgreSQL) |
| Real-time | Socket.IO v4 |
| Maps | Leaflet.js (dark CARTO tiles) |
| ML | scikit-learn RandomForest |
| Data Feed | Python asyncio + supabase-py |
| Hosting | Vercel (frontend) / Any VPS (socket + feeder) |

---

*Kavach Titanium · Signals & Systems Mini Project · v3.0*
