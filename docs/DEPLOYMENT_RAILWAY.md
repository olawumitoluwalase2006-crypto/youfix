# FastAPI Backend Deployment on Railway

This guide explains how to deploy the YouFix FastAPI backend to **Railway** using either the native Nixpacks builder or Dockerfile.

---

## 1. Deploy via Railway Dashboard

1. Push your repository to GitHub.
2. Go to [https://railway.app/](https://railway.app/) and log in.
3. Click **New Project** -> **Deploy from GitHub repo**.
4. Select your **YouFix** repository.
5. In the project canvas, click on the newly created service and select **Settings**:
   - **Root Directory**: `backend`
   - **Healthcheck Path**: `/health`
   - **Healthcheck Timeout**: `30`
6. Go to the **Variables** tab and add your production environment keys:
   ```env
   ENVIRONMENT=production
   GEMINI_API_KEY=your_gemini_api_key
   GEMINI_MODEL=gemini-1.5-flash
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your_supabase_key
   SUPABASE_BUCKET=diagnosis-images
   ALLOWED_ORIGINS=*
   ```
7. Go to **Settings** -> **Networking** -> click **Generate Domain** (e.g., `youfix-backend-production.up.railway.app`).

---

## 2. Deploy via Railway CLI (Alternative)

If you have the Railway CLI installed:

```bash
cd backend
railway login
railway init
railway up
railway variables --set GEMINI_API_KEY="your_key" SUPABASE_URL="https://your-project.supabase.co" SUPABASE_KEY="your_key"
railway domain
```

---

## 3. Verify Health Check

Visit `https://your-railway-domain.up.railway.app/health`. You will see `status: "ok"` confirming the backend is live.
