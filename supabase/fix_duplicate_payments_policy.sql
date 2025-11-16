-- Fix duplicate "Users can create their own payments" policy error
-- This resolves the "ERROR: 42710: policy "Users can create their own payments" for table "payments" already exists"

-- First, drop all existing policies on the payments table to start fresh
DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can create their own payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can manage payments" ON public.payments;

-- Recreate policies with proper permissions
-- Users can view their own payments
CREATE POLICY "Users can view their own payments" 
ON public.payments 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create their own payments
CREATE POLICY "Users can create payments" 
ON public.payments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admins can manage all payments
CREATE POLICY "Admins can manage payments" 
ON public.payments 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Verify the policies were created
SELECT policyname, tablename, cmd 
FROM pg_policy 
JOIN pg_class ON pg_policy.polrelid = pg_class.oid 
WHERE pg_class.relname = 'payments';