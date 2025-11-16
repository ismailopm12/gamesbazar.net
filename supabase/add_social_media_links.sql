-- Add social media links to website_settings table
ALTER TABLE public.website_settings 
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS youtube_url TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_url TEXT,
ADD COLUMN IF NOT EXISTS telegram_url TEXT;

-- Update the existing row with default social media links
UPDATE public.website_settings 
SET 
  facebook_url = 'https://facebook.com/bdgamesbazar',
  youtube_url = 'https://youtube.com/@bdgamesbazar',
  whatsapp_url = 'https://wa.me/8801XXXXXXXXX',
  telegram_url = 'https://t.me/bdgamesbazar'
WHERE facebook_url IS NULL;