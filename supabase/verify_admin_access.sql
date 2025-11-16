-- Verify Admin Access Script
-- Run this script to check if your user has proper admin permissions

-- Step 1: Check your user profile
SELECT 
  id, 
  email, 
  full_name 
FROM public.profiles 
WHERE email IN ('sujon.hopm@gmail.com', 'mdismail.opm@gmail.com');

-- Step 2: Check if your user has admin role
SELECT 
  ur.user_id,
  p.email,
  ur.role,
  ur.created_at
FROM public.user_roles ur
JOIN public.profiles p ON ur.user_id = p.id
WHERE p.email IN ('sujon.hopm@gmail.com', 'mdismail.opm@gmail.com');

-- Step 3: Test the has_role function
-- First get your user ID from Step 1, then uncomment and run this:
-- SELECT public.has_role('YOUR_USER_ID_HERE', 'admin') as is_admin;

-- Step 4: Check if RLS is enabled on key tables
SELECT 
  tablename,
  relrowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'products', 'product_variants', 'voucher_codes', 'orders', 
  'payments', 'hero_sliders', 'seo_settings', 'announcement_popups',
  'user_roles', 'page_contents', 'website_settings', 'profiles'
)
ORDER BY tablename;

-- Step 5: Check storage buckets
SELECT 
  name, 
  public,
  created_at
FROM storage.buckets 
WHERE name IN ('product-images', 'website-assets');

-- Step 6: Check storage policies
SELECT 
  policyname,
  tablename,
  cmd,
  qual,
  withcheck
FROM pg_policy 
JOIN pg_class ON pg_policy.polrelid = pg_class.oid
WHERE tablename = 'objects' AND schemaname = 'storage'
AND (policyname LIKE '%website%' OR policyname LIKE '%product%')
ORDER BY policyname;