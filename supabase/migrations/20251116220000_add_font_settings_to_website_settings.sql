-- Add font settings to website_settings table
ALTER TABLE public.website_settings 
ADD COLUMN IF NOT EXISTS primary_font TEXT DEFAULT 'Inter',
ADD COLUMN IF NOT EXISTS secondary_font TEXT DEFAULT 'Poppins';

-- Update the existing row with default font settings
UPDATE public.website_settings 
SET 
  primary_font = 'Inter',
  secondary_font = 'Poppins'
WHERE primary_font IS NULL;