-- Ensure website_settings table has all required columns
ALTER TABLE public.website_settings 
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS youtube_url TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_url TEXT,
ADD COLUMN IF NOT EXISTS telegram_url TEXT,
ADD COLUMN IF NOT EXISTS primary_font TEXT DEFAULT 'Inter',
ADD COLUMN IF NOT EXISTS secondary_font TEXT DEFAULT 'Poppins';

-- Ensure default values are set
UPDATE public.website_settings 
SET 
  site_title = COALESCE(site_title, 'BD GAMES BAZAR'),
  primary_color = COALESCE(primary_color, '#8B5CF6'),
  secondary_color = COALESCE(secondary_color, '#06B6D4'),
  accent_color = COALESCE(accent_color, '#10B981'),
  facebook_url = COALESCE(facebook_url, 'https://facebook.com/bdgamesbazar'),
  youtube_url = COALESCE(youtube_url, 'https://youtube.com/@bdgamesbazar'),
  whatsapp_url = COALESCE(whatsapp_url, 'https://wa.me/8801XXXXXXXXX'),
  telegram_url = COALESCE(telegram_url, 'https://t.me/bdgamesbazar'),
  primary_font = COALESCE(primary_font, 'Inter'),
  secondary_font = COALESCE(secondary_font, 'Poppins');

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

-- Fix duplicate "Users can create their own payments" policy error
-- First, drop all existing policies on the payments table to start fresh
DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can create their own payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can manage payments" ON public.payments;

-- Recreate policies with proper permissions
-- Users can view their own payments
CREATE POLICY "Users can view their own payments" 
ON public.payments 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create their own payments (using a unique name to avoid conflicts)
CREATE POLICY "Users can create payments" 
ON public.payments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admins can manage all payments
CREATE POLICY "Admins can manage payments" 
ON public.payments 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Verify the data
SELECT * FROM public.website_settings LIMIT 1;