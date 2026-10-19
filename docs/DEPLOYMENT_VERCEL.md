# Next.js Frontend Deployment on Vercel

This guide explains how to deploy the YouFix Next.js frontend to **Vercel** and connect it to your deployed FastAPI backend.

---

## 1. Prerequisites

Before deploying the frontend to Vercel, ensure your FastAPI backend is already deployed on **Render** or **Railway** and you have its live URL (e.g., `https://youfix-backend.onrender.com`).

---

## 2. Deploy to Vercel

1. Push your YouFix repository to GitHub.
2. Go to [https://vercel.com/](https://vercel.com/) and sign in.
3. Click **Add New...** -> **Project**.
4. Import your **YouFix** GitHub repository.
5. In the project configuration screen:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click *Edit* and select `frontend`.
   - **Build Command**: `next build` (Default)
   - **Output Directory**: `.next` (Default)
   - **Install Command**: `npm install` (Default)
6. Expand **Environment Variables** and add:
   | Variable | Value | Purpose |
   |---|---|---|
   | `NEXT_PUBLIC_API_URL` | `https://youfix-backend.onrender.com` | Live FastAPI backend URL (do **not** include trailing slash) |
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | Supabase URL for client queries |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your_anon_public_key` | Supabase Anon Key |
7. Click **Deploy**. Vercel will build the Next.js App Router application and issue a production URL (e.g., `https://youfix-app.vercel.app`).

---

## 3. Connect CORS on Backend

After Vercel assigns your live domain:
1. Go to your **Render** or **Railway** dashboard for `youfix-backend`.
2. Update the `ALLOWED_ORIGINS` environment variable:
   ```env
   ALLOWED_ORIGINS=https://youfix-app.vercel.app,http://localhost:3000,*
   ```
3. Trigger a quick redeploy on Render/Railway.
4. Open your Vercel URL. You should see the green **API: Connected** pill in the top navigation bar!
