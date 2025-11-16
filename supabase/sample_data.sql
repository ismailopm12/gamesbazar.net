-- Insert sample data for testing admin components

-- Insert a test product
INSERT INTO public.products (name, description, category, is_active, display_order) 
VALUES 
  ('Mobile Legends Diamonds', 'In-game currency for Mobile Legends', 'Game Currency', true, 1),
  ('Free Fire Diamonds', 'In-game currency for Free Fire', 'Game Currency', true, 2),
  ('PUBG UC', 'In-game currency for PUBG Mobile', 'Game Currency', true, 3)
ON CONFLICT DO NOTHING;

-- Insert test product variants
WITH product_ids AS (
  SELECT id, name FROM public.products WHERE name LIKE '%Diamonds%' OR name LIKE '%UC%'
)
INSERT INTO public.product_variants (product_id, name, description, price, stock_quantity, is_active) 
SELECT 
  p.id,
  CASE 
    WHEN p.name = 'Mobile Legends Diamonds' THEN '50 Diamonds'
    WHEN p.name = 'Free Fire Diamonds' THEN '100 Diamonds'
    WHEN p.name = 'PUBG UC' THEN '150 UC'
  END,
  CASE 
    WHEN p.name = 'Mobile Legends Diamonds' THEN '50 Mobile Legends Diamonds'
    WHEN p.name = 'Free Fire Diamonds' THEN '100 Free Fire Diamonds'
    WHEN p.name = 'PUBG UC' THEN '150 PUBG UC'
  END,
  CASE 
    WHEN p.name = 'Mobile Legends Diamonds' THEN 49.99
    WHEN p.name = 'Free Fire Diamonds' THEN 99.99
    WHEN p.name = 'PUBG UC' THEN 149.99
  END,
  100,
  true
FROM product_ids p
ON CONFLICT DO NOTHING;

-- Insert sample voucher codes
WITH variant_ids AS (
  SELECT id, product_id FROM public.product_variants
)
INSERT INTO public.voucher_codes (product_variant_id, code, status)
SELECT 
  v.id,
  'TEST-' || gen_random_uuid()::text,
  'available'
FROM variant_ids v
LIMIT 10
ON CONFLICT DO NOTHING;

-- Insert sample orders
WITH variant_ids AS (
  SELECT id FROM public.product_variants LIMIT 3
)
INSERT INTO public.orders (product_variant_id, player_uid, player_name, quantity, total_amount, status)
SELECT 
  v.id,
  'TEST123456',
  'Test Player',
  1,
  49.99,
  'pending'
FROM variant_ids v
ON CONFLICT DO NOTHING;