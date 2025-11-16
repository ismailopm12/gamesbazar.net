-- Ensure User Admin Access Script (Corrected)
-- Run this script to make sure your user has proper admin permissions

-- Step 1: First check if your user exists
SELECT 
  id, 
  email, 
  full_name 
FROM public.profiles 
WHERE email IN ('sujon.hopm@gmail.com', 'mdismail.opm@gmail.com');

-- Step 2: Ensure your user has admin role
-- This will add admin role if it doesn't exist
INSERT INTO public.user_roles (user_id, role) 
SELECT id, 'admin' 
FROM public.profiles 
WHERE email IN ('sujon.hopm@gmail.com', 'mdismail.opm@gmail.com')
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 3: Verify the role was added
SELECT 
  ur.user_id,
  p.email,
  ur.role,
  ur.created_at
FROM public.user_roles ur
JOIN public.profiles p ON ur.user_id = p.id
WHERE p.email IN ('sujon.hopm@gmail.com', 'mdismail.opm@gmail.com');

-- Step 4: Test the has_role function (replace 'YOUR_USER_ID' with actual user ID)
-- SELECT public.has_role('YOUR_USER_ID_HERE', 'admin') as is_admin;

-- Step 5: Reapply all storage policies to ensure they're correct
-- Fix storage policies for website assets bucket
DROP POLICY IF EXISTS "Admins can upload website assets" ON storage.objects;
CREATE POLICY "Admins can upload website assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'website-assets' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

DROP POLICY IF EXISTS "Admins can update website assets" ON storage.objects;
CREATE POLICY "Admins can update website assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'website-assets' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

DROP POLICY IF EXISTS "Admins can delete website assets" ON storage.objects;
CREATE POLICY "Admins can delete website assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'website-assets' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Fix storage policies for product images bucket
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Verify the policies were created (Corrected column names)
SELECT 
  polname as policy_name,
  pg_class.relname as table_name,
  polcmd as command,
  polqual as using_clause,
  polwithcheck as with_check_clause
FROM pg_policy 
JOIN pg_class ON pg_policy.polrelid = pg_class.oid
WHERE pg_class.relname = 'objects' AND pg_class.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'storage')
AND (polname LIKE '%website%' OR polname LIKE '%product%')
ORDER BY polname;