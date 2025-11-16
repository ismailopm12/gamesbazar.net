-- Test Supabase connection and basic queries

-- Test 1: Check if we can access the profiles table
SELECT COUNT(*) as profile_count FROM public.profiles;

-- Test 2: Check if we can access the user_roles table
SELECT COUNT(*) as role_count FROM public.user_roles;

-- Test 3: Check if admin users exist
SELECT p.email, ur.role 
FROM public.profiles p
JOIN public.user_roles ur ON p.id = ur.user_id
WHERE ur.role = 'admin';

-- Test 4: Check if the specific admin users exist
SELECT email, full_name FROM public.profiles 
WHERE email IN ('sujon.hopm@gmail.com', 'mdismail.opm@gmail.com');