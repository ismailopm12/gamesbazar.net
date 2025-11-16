-- Script to create admin user if they don't exist
-- First, check if user exists
SELECT id, email FROM auth.users WHERE email = 'mdismail.opm@gmail.com';

-- If user doesn't exist in auth.users, you'll need to sign up through the frontend first
-- After signup, run the make_admin.sql script

-- If user exists in auth but not in profiles (rare case), create profile manually:
-- INSERT INTO public.profiles (id, email, full_name)
-- SELECT id, email, 'Md Ismail' 
-- FROM auth.users 
-- WHERE email = 'mdismail.opm@gmail.com'
-- AND id NOT IN (SELECT id FROM public.profiles);

-- Then grant admin role
INSERT INTO public.user_roles (user_id, role) 
SELECT id, 'admin' 
FROM public.profiles 
WHERE email = 'mdismail.opm@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;