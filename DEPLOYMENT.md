# Deployment Guide: MostafaVision

This guide will help you connect your local project to Supabase (Database) and Vercel (Hosting) to run your portfolio 24/7 for free.

## Prerequisites
-   A [GitHub](https://github.com/) account.
-   A [Supabase](https://supabase.com/) account.
-   A [Vercel](https://vercel.com/) account.

---

## Part 1: Supabase Setup (Database)

1.  **Create a Project**:
    -   Log in to Supabase and click **"New Project"**.
    -   Name it `mostafa-vision`.
    -   Set a secure password for your database.
    -   Select a region close to your target audience (e.g., Frankfurt/London).

2.  **Get API Credentials**:
    -   Once the project is created, go to **Settings** (gear icon) -> **API**.
    -   Copy the `Project URL` and `anon` / `public` Key.
    -   **IMPORTANT**: Update your local `.env` file with these values if you want to test locally again (though Vercel will manage this for production).

3.  **Run Database Migrations**:
    -   Go to the **SQL Editor** in the Supabase dashboard sidebar.
    -   Click **New Query**.
    -   Copy and Paste the SQL code below into the editor and click **Run**:

```sql
-- 1. Create Photos Table
CREATE TABLE public.photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    category TEXT, 
    section TEXT DEFAULT 'concerts',
    image_url TEXT NOT NULL,
    aspect_ratio TEXT DEFAULT '3/4',
    featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.photos;

-- 3. Storage Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio-images', 
  'portfolio-images', 
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 4. Row Level Security (RLS)
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- Allow public read access to photos
CREATE POLICY "Public photos are viewable by everyone" 
ON public.photos FOR SELECT 
USING (true);

-- Allow authenticated users to insert/update/delete
CREATE POLICY "Authenticated users can manage photos" 
ON public.photos FOR ALL 
USING (auth.role() = 'authenticated');

-- Storage Policies
CREATE POLICY "Public images are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio-images');

CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'portfolio-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'portfolio-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
USING (bucket_id = 'portfolio-images' AND auth.role() = 'authenticated');
```

---

## Part 2: GitHub Setup

1.  **Push your code**:
    -   If you haven't already, ensure your code is pushed to a GitHub repository.
    ```bash
    git add .
    git commit -m "Ready for deploy"
    git push
    ```

---

## Part 3: Vercel Setup (Hosting)

1.  **Import Project**:
    -   Log in to Vercel and click **"Add New..."** -> **"Project"**.
    -   Select your GitHub repository (`mostafa-vision-live`).
    -   Click **Import**.

2.  **Configure Environment Variables**:
    -   In the "Configure Project" screen, look for **Environment Variables**.
    -   Add the following variables (use the values from your Supabase setup):
        -   `VITE_SUPABASE_URL`: (Your Project URL)
        -   `VITE_SUPABASE_PUBLISHABLE_KEY`: (Your `anon` public key)
        -   `VITE_SUPABASE_PROJECT_ID`: (Your Project Ref/ID - usually the first part of the URL)

3.  **Deploy**:
    -   Click **Deploy**.
    -   Wait for the build to complete (usually < 1 minute).
    -   **Success!** You will get a URL (e.g., `mostafa-vision.vercel.app`).

## Admin Setup
1.  Go to your new website URL.
2.  Navigate to `/auth`.
3.  Sign up/Login.
    -   *Note*: Since we set up RLS for "authenticated" users, any signed-in user can currently edit. For a portfolio, this is usually fine if you are the only one with the link.
    -   *Security Tip*: You can disable "Enable Email Signup" in Supabase Authentication settings after you create your account to prevent others from registering.

Your portfolio is now live 24/7!
