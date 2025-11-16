-- Simple website_settings table fix
-- Minimal approach to avoid any conflicts

-- Add missing columns if they don't exist
ALTER TABLE public.website_settings 
ADD COLUMN IF NOT EXISTS facebook_url TEXT;

ALTER TABLE public.website_settings 
ADD COLUMN IF NOT EXISTS youtube_url TEXT;

ALTER TABLE public.website_settings 
ADD COLUMN IF NOT EXISTS whatsapp_url TEXT;

ALTER TABLE public.website_settings 
ADD COLUMN IF NOT EXISTS telegram_url TEXT;

ALTER TABLE public.website_settings 
ADD COLUMN IF NOT EXISTS primary_font TEXT;

ALTER TABLE public.website_settings 
ADD COLUMN IF NOT EXISTS secondary_font TEXT;

-- Update existing rows with default values where needed
UPDATE public.website_settings 
SET 
  site_title = 'BD GAMES BAZAR'
WHERE site_title IS NULL OR site_title = '';

UPDATE public.website_settings 
SET 
  primary_color = '#8B5CF6'
WHERE primary_color IS NULL OR primary_color = '';

UPDATE public.website_settings 
SET 
  secondary_color = '#06B6D4'
WHERE secondary_color IS NULL OR secondary_color = '';

UPDATE public.website_settings 
SET 
  accent_color = '#10B981'
WHERE accent_color IS NULL OR accent_color = '';

-- Set default values for new columns
UPDATE public.website_settings 
SET 
  facebook_url = 'https://facebook.com/bdgamesbazar'
WHERE facebook_url IS NULL;

UPDATE public.website_settings 
SET 
  youtube_url = 'https://youtube.com/@bdgamesbazar'
WHERE youtube_url IS NULL;

UPDATE public.website_settings 
SET 
  whatsapp_url = 'https://wa.me/8801XXXXXXXXX'
WHERE whatsapp_url IS NULL;

UPDATE public.website_settings 
SET 
  telegram_url = 'https://t.me/bdgamesbazar'
WHERE telegram_url IS NULL;

UPDATE public.website_settings 
SET 
  primary_font = 'Inter'
WHERE primary_font IS NULL;

UPDATE public.website_settings 
SET 
  secondary_font = 'Poppins'
WHERE secondary_font IS NULL;

-- Check if any rows exist, if not insert a default row
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.website_settings) THEN
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
    ) VALUES (
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
    );
  END IF;
END $$;

-- Show the result
SELECT * FROM public.website_settings;