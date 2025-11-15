-- Add customer information fields to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT,
ADD COLUMN IF NOT EXISTS customer_country TEXT DEFAULT 'Bangladesh',
ADD COLUMN IF NOT EXISTS customer_district TEXT;

COMMENT ON COLUMN public.orders.customer_name IS 'Full name of the customer';
COMMENT ON COLUMN public.orders.customer_phone IS 'Phone number of the customer';
COMMENT ON COLUMN public.orders.customer_country IS 'Country of the customer (Bangladesh only)';
COMMENT ON COLUMN public.orders.customer_district IS 'District of the customer in Bangladesh';