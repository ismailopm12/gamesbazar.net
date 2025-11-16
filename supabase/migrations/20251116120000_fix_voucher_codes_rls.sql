-- Fix RLS policy for voucher_codes table to allow admins to insert new voucher codes
-- Drop the existing policy that might be causing issues
DROP POLICY IF EXISTS "Admins can manage vouchers" ON public.voucher_codes;

-- Recreate the policy with proper INSERT permissions
CREATE POLICY "Admins can manage vouchers" 
ON public.voucher_codes
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));