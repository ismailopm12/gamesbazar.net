-- Test script to verify all admin components are working properly

-- Test 1: Check if products table exists and has data
SELECT COUNT(*) as product_count FROM public.products;

-- Test 2: Check if product_variants table exists and has data
SELECT COUNT(*) as variant_count FROM public.product_variants;

-- Test 3: Check if voucher_codes table exists and has data
SELECT COUNT(*) as voucher_count FROM public.voucher_codes;

-- Test 4: Check if orders table exists and has data
SELECT COUNT(*) as order_count FROM public.orders;

-- Test 5: Check if user_roles table exists and has admin roles
SELECT COUNT(*) as admin_count FROM public.user_roles WHERE role = 'admin';

-- Test 6: Check if profiles table exists and has data
SELECT COUNT(*) as profile_count FROM public.profiles;

-- Test 7: Check if storage buckets exist
SELECT name, public FROM storage.buckets WHERE name IN ('product-images', 'website-assets');

-- Test 8: Check sample data from products with variants
SELECT 
    p.name as product_name,
    pv.name as variant_name,
    pv.price,
    pv.stock_quantity
FROM public.products p
JOIN public.product_variants pv ON p.id = pv.product_id
LIMIT 5;

-- Test 9: Check sample data from voucher codes
SELECT 
    vc.code,
    vc.status,
    p.name as product_name,
    pv.name as variant_name
FROM public.voucher_codes vc
JOIN public.product_variants pv ON vc.product_variant_id = pv.id
JOIN public.products p ON pv.product_id = p.id
LIMIT 5;

-- Test 10: Check sample data from orders
SELECT 
    o.id,
    o.status,
    o.total_amount,
    p.email as customer_email,
    prod.name as product_name
FROM public.orders o
LEFT JOIN public.profiles p ON o.user_id = p.id
LEFT JOIN public.product_variants pv ON o.product_variant_id = pv.id
LEFT JOIN public.products prod ON pv.product_id = prod.id
LIMIT 5;