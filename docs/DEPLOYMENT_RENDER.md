# FastAPI Backend Deployment on Render

This guide explains how to deploy the YouFix FastAPI backend to **Render** as a production web service.

---

## Method A: One-Click Blueprint Deployment (Recommended)

Render can parse the provided `backend/render.yaml` file automatically:

1. Push your YouFix repository to GitHub or GitLab.
2. Log into [https://render.com/](https://render.com/).
3. Click **New +** -> **Blueprint**.
4. Connect your GitHub repository.
5. Render will detect `render.yaml` and configure the web service with:
   - Python 3.11.9
   - Health check path: `/health`
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Under **Environment Variables**, fill in:
   - `GEMINI_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `ALLOWED_ORIGINS` = `*` (or your Vercel URL once deployed)
7. Click **Apply**. Render will build and deploy the container.

---

## Method B: Manual Web Service Deployment

If you prefer setting up the web service manually:

1. Click **New +** -> **Web Service**.
2. Select your repository.
3. Configure the settings:
   - **Name**: `youfix-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Region**: Oregon or closest to your database
   - **Branch**: `main`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Expand **Advanced** and set:
   - **Health Check Path**: `/health`
   - **Auto-Deploy**: Yes
5. Add **Environment Variables**:
   | Variable | Value |
   |---|---|
   | `ENVIRONMENT` | `production` |
   | `GEMINI_API_KEY` | *(Your Google Gemini API Key)* |
   | `GEMINI_MODEL` | `gemini-1.5-flash` |
   | `SUPABASE_URL` | `https://your-project.supabase.co` |
   | `SUPABASE_KEY` | *(Your Supabase API Key)* |
   | `SUPABASE_BUCKET` | `diagnosis-images` |
   | `ALLOWED_ORIGINS` | `*` (or `https://your-app.vercel.app`) |
6. Click **Create Web Service**.

---

## 3. Verifying the Deployment

Once Render displays **Live**:
1. Open your Render URL in your browser: `https://youfix-backend.onrender.com/health`
2. You should receive:
   ```json
   {
     "status": "ok",
     "service": "YouFix Backend API",
     "version": "1.0.0",
     "gemini_configured": true,
     "supabase_configured": true,
     "environment": "production"
   }
   ```
3. Interactive Swagger documentation is available at `/docs`.
4. Copy your backend URL to plug into the Next.js frontend (`NEXT_PUBLIC_API_URL`).
