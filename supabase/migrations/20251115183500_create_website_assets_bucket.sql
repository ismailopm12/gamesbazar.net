-- Create storage bucket for website assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('website-assets', 'website-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for website assets bucket
CREATE POLICY "Anyone can view website assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'website-assets');

CREATE POLICY "Admins can upload website assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'website-assets' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update website assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'website-assets' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete website assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'website-assets' 
  AND has_role(auth.uid(), 'admin'::app_role)
);