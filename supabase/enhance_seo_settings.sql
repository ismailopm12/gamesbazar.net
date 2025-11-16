-- Enhance seo_settings table with professional SEO fields
ALTER TABLE public.seo_settings 
ADD COLUMN IF NOT EXISTS og_title TEXT,
ADD COLUMN IF NOT EXISTS og_description TEXT,
ADD COLUMN IF NOT EXISTS og_type TEXT DEFAULT 'website',
ADD COLUMN IF NOT EXISTS og_url TEXT,
ADD COLUMN IF NOT EXISTS twitter_card TEXT DEFAULT 'summary_large_image',
ADD COLUMN IF NOT EXISTS twitter_site TEXT,
ADD COLUMN IF NOT EXISTS twitter_creator TEXT,
ADD COLUMN IF NOT EXISTS canonical_url TEXT,
ADD COLUMN IF NOT EXISTS robots TEXT DEFAULT 'index, follow',
ADD COLUMN IF NOT EXISTS author TEXT,
ADD COLUMN IF NOT EXISTS viewport TEXT DEFAULT 'width=device-width, initial-scale=1',
ADD COLUMN IF NOT EXISTS theme_color TEXT,
ADD COLUMN IF NOT EXISTS mobile_web_app_capable TEXT DEFAULT 'yes',
ADD COLUMN IF NOT EXISTS apple_mobile_web_app_title TEXT;

-- Update existing rows with default values
UPDATE public.seo_settings 
SET 
  og_type = 'website',
  twitter_card = 'summary_large_image',
  robots = 'index, follow',
  viewport = 'width=device-width, initial-scale=1',
  mobile_web_app_capable = 'yes'
WHERE og_type IS NULL;