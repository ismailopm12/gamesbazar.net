-- Create website_settings table for managing site-wide configuration
CREATE TABLE IF NOT EXISTS public.website_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  logo_url TEXT,
  site_title TEXT NOT NULL DEFAULT 'BD GAMES BAZAR',
  primary_color TEXT NOT NULL DEFAULT '#8B5CF6',
  secondary_color TEXT NOT NULL DEFAULT '#06B6D4',
  accent_color TEXT NOT NULL DEFAULT '#10B981',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can view website settings
CREATE POLICY "Anyone can view website settings"
ON public.website_settings
FOR SELECT
USING (true);

-- Only admins can manage website settings
CREATE POLICY "Admins can manage website settings"
ON public.website_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default settings if none exist
INSERT INTO public.website_settings (id) 
SELECT gen_random_uuid() 
WHERE NOT EXISTS (SELECT 1 FROM public.website_settings);

-- Create trigger for updated_at
CREATE TRIGGER update_website_settings_updated_at
BEFORE UPDATE ON public.website_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();