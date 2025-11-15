-- Add image_url column to hero_sliders table
ALTER TABLE public.hero_sliders 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update RLS policy to ensure admins can manage the new column
DROP POLICY IF EXISTS "Admins can manage sliders" ON public.hero_sliders;
CREATE POLICY "Admins can manage sliders"
ON public.hero_sliders
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));