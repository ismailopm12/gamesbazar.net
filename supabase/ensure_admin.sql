-- Ensure sujon.hopm@gmail.com exists and has admin access

-- First, check if the user exists
SELECT id, email, full_name 
FROM public.profiles 
WHERE email = 'sujon.hopm@gmail.com';

-- If the user doesn't exist, you'll need to create them through the signup process first
-- Then run this to grant admin access:
-- INSERT INTO public.user_roles (user_id, role) 
-- SELECT id, 'admin' 
-- FROM public.profiles 
-- WHERE email = 'sujon.hopm@gmail.com'
-- ON CONFLICT (user_id, role) DO NOTHING;