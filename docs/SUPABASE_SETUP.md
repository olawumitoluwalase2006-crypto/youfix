# Supabase Database & Storage Setup Guide for YouFix

This guide walks you through setting up the PostgreSQL database and image storage bucket on Supabase in under 3 minutes.

---

## 1. Create a Supabase Project

1. Go to [https://supabase.com/](https://supabase.com/) and sign in.
2. Click **New Project** and name it **YouFix**.
3. Choose a strong database password and select a region closest to your users.
4. Wait ~2 minutes for the database to provision.

---

## 2. Execute SQL Schema Migration

1. In your Supabase dashboard, click the **SQL Editor** tab on the left sidebar.
2. Click **New Query**.
3. Open the file `supabase/schema.sql` from your YouFix project and paste the entire script into the editor:
   - Creates the `diagnoses` table with all 10 required columns.
   - Enforces check constraints for the 5 categories and risk levels.
   - Sets up performance indexes.
   - Enables Row-Level Security (RLS) with public read/write policies.
4. Click **Run** (or press Ctrl+Enter). You should see `Success. No rows returned`.

---

## 3. Setup Image Storage Bucket

1. In the same SQL Editor, create a new query.
2. Copy and paste the contents of `supabase/storage_setup.sql`:
   - Creates a public bucket named `diagnosis-images`.
   - Configures 10MB file limit and image MIME filters.
   - Sets public read/upload policies.
3. Click **Run**.
4. You can verify this in the **Storage** tab on the left sidebar — `diagnosis-images` will be listed as a Public bucket.

---

## 4. (Optional) Insert Demonstration Seed Records

If you want initial demonstration data in your history dashboard right away:
1. In the SQL Editor, paste the contents of `supabase/seed_data.sql`.
2. Click **Run**.
3. Go to **Table Editor** -> `diagnoses` to view 5 realistic records across all 5 fault categories.

---

## 5. Obtain API Keys for Environment Configuration

1. In your Supabase dashboard, navigate to **Project Settings** (gear icon) -> **API**.
2. Copy the following values:
   - **Project URL** (e.g., `https://xyzcompany.supabase.co`)
   - **anon / public key** (safe for client use)
   - **service_role key** (for backend full access)

3. Update your `.env` files:
   - In `backend/.env`:
     ```env
     SUPABASE_URL=https://your-project-id.supabase.co
     SUPABASE_KEY=your_service_role_or_anon_key
     SUPABASE_BUCKET=diagnosis-images
     ```
   - In `frontend/.env.local`:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
     ```
