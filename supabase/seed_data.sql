-- Seed Data Script
-- This script inserts initial data that your application might need

-- Insert default website settings
INSERT INTO public.website_settings (site_title, logo_url, primary_color, secondary_color, accent_color)
VALUES (
  'Game Store',
  null,
  '#3b82f6',
  '#1e40af',
  '#f59e0b'
)
ON CONFLICT DO NOTHING;

-- Insert default SEO settings for homepage
INSERT INTO public.seo_settings (page_path, title, description, keywords)
VALUES (
  '/',
  'Game Store - Digital Game Top-ups',
  'Buy digital game top-ups instantly. We offer the best prices and fastest delivery for popular games.',
  'game top-up, digital games, instant delivery, gaming'
)
ON CONFLICT (page_path) DO NOTHING;