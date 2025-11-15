-- Drop the incorrect foreign key that points to auth.users
ALTER TABLE public.money_requests
DROP CONSTRAINT money_requests_user_id_fkey;

-- Add the correct foreign key pointing to profiles
ALTER TABLE public.money_requests
ADD CONSTRAINT money_requests_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;