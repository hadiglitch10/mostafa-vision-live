-- Create photos table for portfolio
CREATE TABLE public.photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  category TEXT DEFAULT 'concert',
  image_url TEXT NOT NULL,
  aspect_ratio TEXT DEFAULT '3:2',
  featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- Allow public read access (portfolio is public)
CREATE POLICY "Photos are publicly viewable" 
ON public.photos 
FOR SELECT 
USING (true);

-- Create index for sorting
CREATE INDEX idx_photos_sort ON public.photos(sort_order, created_at DESC);