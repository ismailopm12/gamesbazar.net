-- Script to make mdismail.opm@gmail.com an admin
-- First, find the user by email
SELECT id, email, full_name FROM public.profiles WHERE email = 'mdismail.opm@gmail.com';

-- If user exists, grant admin role
-- Replace 'USER_ID_HERE' with the actual user ID from the previous query
INSERT INTO public.user_roles (user_id, role) 
SELECT id, 'admin' 
FROM public.profiles 
WHERE email = 'mdismail.opm@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Verify the role was added
SELECT ur.*, p.email 
FROM public.user_roles ur
JOIN public.profiles p ON ur.user_id = p.id
WHERE p.email = 'mdismail.opm@gmail.com';