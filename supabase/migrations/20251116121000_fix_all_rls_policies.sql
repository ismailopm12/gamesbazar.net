-- Fix RLS policies for all admin-managed tables to allow proper INSERT operations
-- This fixes the "new row violates row level security policy" errors

-- Fix products table RLS
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products" 
ON public.products
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Fix product_variants table RLS
DROP POLICY IF EXISTS "Admins can manage variants" ON public.product_variants;
CREATE POLICY "Admins can manage variants" 
ON public.product_variants
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Fix voucher_codes table RLS (already partially fixed in previous migration, but ensuring consistency)
DROP POLICY IF EXISTS "Admins can manage vouchers" ON public.voucher_codes;
CREATE POLICY "Admins can manage vouchers" 
ON public.voucher_codes
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Fix orders table RLS
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
CREATE POLICY "Admins can manage all orders" 
ON public.orders
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Fix payments table RLS
DROP POLICY IF EXISTS "Admins can manage payments" ON public.payments;
CREATE POLICY "Admins can manage payments" 
ON public.payments
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Fix hero_sliders table RLS
DROP POLICY IF EXISTS "Admins can manage sliders" ON public.hero_sliders;
CREATE POLICY "Admins can manage sliders" 
ON public.hero_sliders
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Fix seo_settings table RLS
DROP POLICY IF EXISTS "Admins can manage SEO settings" ON public.seo_settings;
CREATE POLICY "Admins can manage SEO settings" 
ON public.seo_settings
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Fix announcement_popups table RLS
DROP POLICY IF EXISTS "Admins can manage announcements" ON public.announcement_popups;
CREATE POLICY "Admins can manage announcements" 
ON public.announcement_popups
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Fix user_roles table RLS
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles" 
ON public.user_roles
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Fix page_contents table RLS
DROP POLICY IF EXISTS "Admins can manage page contents" ON public.page_contents;
CREATE POLICY "Admins can manage page contents" 
ON public.page_contents
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));