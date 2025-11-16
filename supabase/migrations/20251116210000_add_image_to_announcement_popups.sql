-- Add image_url column to announcement_popups table
ALTER TABLE public.announcement_popups 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add a comment to describe the column
COMMENT ON COLUMN public.announcement_popups.image_url IS 'URL for popup image (stored in website-assets bucket)';