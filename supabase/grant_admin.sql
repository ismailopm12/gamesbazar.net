-- Grant admin access to sujon.hopm@gmail.com
-- First, find the user ID for this email
SELECT id FROM public.profiles WHERE email = 'sujon.hopm@gmail.com';

-- Once you have the user ID, insert the admin role
-- Replace 'USER_ID_HERE' with the actual user ID from the previous query
INSERT INTO public.user_roles (user_id, role) 
VALUES ('USER_ID_HERE', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;