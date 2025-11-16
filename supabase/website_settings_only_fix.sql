-- Fix website_settings table structure only
-- This script focuses only on the website_settings table and avoids any policy conflicts

-- Ensure website_settings table has all required columns
ALTER TABLE public.website_settings 
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS youtube_url TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_url TEXT,
ADD COLUMN IF NOT EXISTS telegram_url TEXT,
ADD COLUMN IF NOT EXISTS primary_font TEXT DEFAULT 'Inter',
ADD COLUMN IF NOT EXISTS secondary_font TEXT DEFAULT 'Poppins';

-- Ensure default values are set for existing rows
UPDATE public.website_settings 
SET 
  site_title = COALESCE(site_title, 'BD GAMES BAZAR'),
  primary_color = COALESCE(primary_color, '#8B5CF6'),
  secondary_color = COALESCE(secondary_color, '#06B6D4'),
  accent_color = COALESCE(accent_color, '#10B981');

-- If no rows exist, insert a default row
INSERT INTO public.website_settings (
  site_title, 
  primary_color, 
  secondary_color, 
  accent_color,
  facebook_url,
  youtube_url,
  whatsapp_url,
  telegram_url,
  primary_font,
  secondary_font
)
SELECT 
  'BD GAMES BAZAR',
  '#8B5CF6',
  '#06B6D4',
  '#10B981',
  'https://facebook.com/bdgamesbazar',
  'https://youtube.com/@bdgamesbazar',
  'https://wa.me/8801XXXXXXXXX',
  'https://t.me/bdgamesbazar',
  'Inter',
  'Poppins'
WHERE NOT EXISTS (SELECT 1 FROM public.website_settings);

-- Verify the data
SELECT * FROM public.website_settings LIMIT 1;