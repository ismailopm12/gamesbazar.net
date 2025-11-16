-- Check if user sujon.hopm@gmail.com exists in the profiles table
SELECT id, email, full_name, created_at 
FROM public.profiles 
WHERE email = 'sujon.hopm@gmail.com';

-- If the user doesn't exist, you can create them manually:
-- INSERT INTO public.profiles (id, email, full_name)
-- VALUES ('USER_ID_HERE', 'sujon.hopm@gmail.com', 'Sujon Hossain');

-- Also check if they have an admin role:
SELECT ur.*, p.email 
FROM public.user_roles ur
JOIN public.profiles p ON ur.user_id = p.id
WHERE p.email = 'sujon.hopm@gmail.com';