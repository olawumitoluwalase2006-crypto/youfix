# YouFix - AI Fault Diagnosis & Safety Protocol Engine
> **Capstone Project**: Full-Stack Multimodal Fault Diagnostics & Emergency Safety Protocols

[![Tech Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20FastAPI%20%7C%20Supabase%20%7C%20Gemini-blue)](https://github.com)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)](https://python.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Gemini](https://img.shields.io/badge/Google-Gemini%20Vision-4285F4?logo=google&logoColor=white)](https://aistudio.google.com)

---

## 🛠️ Project Overview

**YouFix** is an intelligent diagnostic web application designed to help homeowners and drivers instantly diagnose physical equipment breakdowns from a single photograph. 

By leveraging **Google Gemini Vision API**, YouFix extracts visual fault signatures (leakage rings, charred plastic, thread punctures, boiling steam), strictly classifies the issue into **5 core problem domains**, evaluates life-safety risk, and programmatically enforces whether the user may safely attempt a **DIY repair** or **must contact a licensed professional**.

All visual analyses and records are persisted into a **Supabase (PostgreSQL)** database with full historical auditing.

---

## 🎯 The 5 Strict Problem Domains

Gemini Vision strictly classifies all input images into one of the following 5 categories:

1. 💧 **Leaking pipe** *(Plumbing)* — Slip-joint leaks, degraded P-trap washers, compression fittings.
2. 🚿 **Clogged drain** *(Plumbing)* — Hair and soap-scum accumulations in sink/tub traps.
3. ⚡ **Damaged electrical socket** *(Electrical)* — Arcing, melted faceplates, burned contact slots.
4. 🛞 **Flat tire** *(Automotive)* — Tread nail punctures, bead leaks, pressure collapse.
5. 🔥 **Overheating engine** *(Automotive)* — Radiator burst, coolant boilover, water pump failure.

### 🛡️ Safety & Hazard Enforcement Guardrails
- **Severe Hazard Rule**: Whenever a **Damaged electrical socket** or **Overheating engine** is detected (or any fault rated *High Risk*), the system programmatically enforces:
  - `professional_required = True`
  - `is_diy = False`
  - Injects a high-priority `safety_warning` advising immediate breaker de-energization or radiator cooldown.
  - Replaces DIY instructions with emergency isolation and certified contractor dispatch buttons.

---

## 🏗️ System Architecture

```
                                  +-----------------------------+
                                  |     Next.js 14 Frontend     |
                                  |   (React, Tailwind CSS)     |
                                  |      Hosted on Vercel       |
                                  +--------------+--------------+
                                                 |
                                     HTTP POST   |   GET History
                                   /api/diagnose |  /api/history
                                                 v
                                  +-----------------------------+
                                  |       FastAPI Backend       |
                                  |     (Python 3.11, Pydantic) |
                                  |   Hosted on Render/Railway  |
                                  +--------+-----------+--------+
                                           |           |
               Multimodal Vision Inference |           | Database & Image Storage
                                           v           v
                          +--------------------+   +-----------------------+
                          |   Google Gemini    |   |       Supabase        |
                          |     Vision API     |   | (PostgreSQL + Bucket) |
                          +--------------------+   +-----------------------+
```

---

## 📂 Repository Directory Layout

```
YouFix/
├── backend/                        # Python FastAPI Backend (Render/Railway Ready)
│   ├── app/
│   │   ├── main.py                 # FastAPI entrypoint, CORS & error handling
│   │   ├── config.py               # Pydantic BaseSettings environment config
│   │   ├── schemas.py              # Pydantic models with safety constraint validators
│   │   ├── gemini_service.py       # Google Gemini Vision API structured integration
│   │   ├── supabase_service.py     # Supabase DB & Storage operations + fallback
│   │   └── routes/
│   │       ├── diagnose.py         # POST /api/diagnose & /api/diagnose-sample
│   │       └── history.py          # GET /api/history, /api/stats, /api/categories
│   ├── tests/
│   │   └── test_api.py             # Pytest test suite for safety & endpoints
│   ├── requirements.txt            # Production dependencies
│   ├── Procfile                    # Render / Railway Procfile
│   ├── Dockerfile                  # Container definition
│   ├── render.yaml                 # Render Blueprint specification
│   ├── railway.json                # Railway configuration
│   └── .env.example                # Backend environment template
│
├── frontend/                       # Next.js 14 App Router (Vercel Ready)
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx          # Root layout with responsive Navbar & Footer
│   │   │   ├── page.tsx            # Main Landing, Upload, and Diagnosis Results page
│   │   │   ├── history/
│   │   │   │   └── page.tsx        # Past diagnoses dashboard with filters & stats
│   │   │   └── globals.css         # Tailwind & glassmorphism custom styles
│   │   ├── components/
│   │   │   ├── Navbar.tsx          # Navigation header with live API status indicator
│   │   │   ├── Footer.tsx          # Capstone footer & safety warning
│   │   │   ├── UploadZone.tsx      # Drag & drop photo upload with preview & camera
│   │   │   ├── AnalysisLoading.tsx # Animated multi-step AI diagnosis loader
│   │   │   ├── DiagnosisResult.tsx # Color-coded results card, safety warnings & checklist
│   │   │   ├── SampleSelector.tsx  # 1-click test scenarios for capstone evaluators
│   │   │   └── HistoryCard.tsx     # Past diagnosis card with modal detail view
│   │   └── lib/
│   │       ├── api.ts              # API client communicating with FastAPI backend
│   │       ├── supabase.ts         # Direct Supabase browser client
│   │       └── types.ts            # TypeScript interfaces
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── vercel.json                 # Vercel deployment configuration
│   └── .env.example                # Frontend environment template
│
├── supabase/                       # Database Migrations & Seeds
│   ├── schema.sql                  # PostgreSQL schema for 'diagnoses' table with RLS
│   ├── storage_setup.sql           # Setup for 'diagnosis-images' storage bucket
│   └── seed_data.sql               # Seed data for immediate capstone testing
│
├── docs/                           # Documentation
│   ├── ARCHITECTURE.md             # System architecture & sequence diagrams
│   ├── SUPABASE_SETUP.md           # 3-minute Supabase setup guide
│   ├── DEPLOYMENT_RENDER.md        # FastAPI deployment on Render
│   ├── DEPLOYMENT_RAILWAY.md       # FastAPI deployment on Railway
│   └── DEPLOYMENT_VERCEL.md        # Next.js deployment on Vercel
│
├── start-dev.ps1                   # One-click startup script for local development
└── README.md                       # Master capstone documentation
```

---

## ⚡ Quickstart: Running Locally

### 1. Database Setup (Supabase)
Follow [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md):
1. In your Supabase SQL Editor, run [`supabase/schema.sql`](supabase/schema.sql).
2. Run [`supabase/storage_setup.sql`](supabase/storage_setup.sql).
3. *(Optional)* Run [`supabase/seed_data.sql`](supabase/seed_data.sql).

### 2. Configure Environment Variables
- **Backend**:
  Copy `backend/.env.example` to `backend/.env` and insert your keys:
  ```env
  GEMINI_API_KEY=your_gemini_api_key
  SUPABASE_URL=https://your-project.supabase.co
  SUPABASE_KEY=your_supabase_key
  ALLOWED_ORIGINS=http://localhost:3000,*
  ```
  *(Note: If you run without keys, the backend automatically operates in an intelligent fallback mock mode for instant offline testing!)*

- **Frontend**:
  Copy `frontend/.env.example` to `frontend/.env.local`:
  ```env
  NEXT_PUBLIC_API_URL=http://localhost:8000
  ```

### 3. Launch with One Click
Run the PowerShell startup script from the root folder:
```powershell
.\start-dev.ps1
```

Or run each service manually in separate terminals:
- **Terminal 1 (Backend)**:
  ```bash
  cd backend
  pip install -r requirements.txt
  uvicorn app.main:app --reload --port 8000
  ```
- **Terminal 2 (Frontend)**:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
Open `http://localhost:3000` in your browser.

---

## 🧪 Testing & Verification

Run the automated backend test suite:
```bash
cd backend
pytest tests/test_api.py -v
```
This tests:
- `/health` status and configuration checks.
- Exact compliance of the 5 allowed categories in `/api/categories`.
- Strict enforcement that electrical sockets and boiling engines trigger `professional_required=True` and `is_diy=False`.
- Safety warning auto-population.

---

## 🚀 Cloud Deployment Guides

- **Backend (Render)**: [`docs/DEPLOYMENT_RENDER.md`](docs/DEPLOYMENT_RENDER.md)
- **Backend (Railway)**: [`docs/DEPLOYMENT_RAILWAY.md`](docs/DEPLOYMENT_RAILWAY.md)
- **Frontend (Vercel)**: [`docs/DEPLOYMENT_VERCEL.md`](docs/DEPLOYMENT_VERCEL.md)
- **Supabase Cloud**: [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md)

---

## 🎓 Capstone Grading Checklist

| Requirement | Implementation Status | Location |
|---|---|---|
| **Tech Stack Compliance** | Next.js (React) + Tailwind, FastAPI (Python), Supabase (PostgreSQL), Gemini Vision | `frontend/`, `backend/`, `supabase/` |
| **Database Schema** | Table `diagnoses` with all 10 required columns, constraints, and RLS | [`supabase/schema.sql`](supabase/schema.sql) |
| **FastAPI `/api/diagnose`** | Accepts file upload, calls Gemini Vision, uploads image, saves to Supabase | [`backend/app/routes/diagnose.py`](backend/app/routes/diagnose.py) |
| **Strict 5 Categories** | Leaking pipe, Clogged drain, Damaged electrical socket, Flat tire, Overheating engine | [`backend/app/schemas.py`](backend/app/schemas.py#L9) |
| **Severe Hazard Guardrails** | Sockets & Engines force `professional_required=True`, `is_diy=False`, and warning | [`backend/app/schemas.py`](backend/app/schemas.py#L51) |
| **Frontend Upload & Preview** | Drag & drop, camera capture, file validation, instant preview | [`frontend/src/components/UploadZone.tsx`](frontend/src/components/UploadZone.tsx) |
| **Results Display Card** | Image preview, category badge, color-coded risk, hazard alert box, DIY steps | [`frontend/src/components/DiagnosisResult.tsx`](frontend/src/components/DiagnosisResult.tsx) |
| **History Dashboard** | Queries Supabase, search filter, risk/category filter, stats overview | [`frontend/src/app/history/page.tsx`](frontend/src/app/history/page.tsx) |
| **Production Ready** | Procfile, Dockerfile, render.yaml, railway.json, vercel.json | Project root & subfolders |
