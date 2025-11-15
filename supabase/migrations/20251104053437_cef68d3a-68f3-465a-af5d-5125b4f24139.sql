-- Create function to decrement product variant stock
CREATE OR REPLACE FUNCTION public.decrement_stock(variant_id uuid, quantity integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.product_variants
  SET stock_quantity = stock_quantity - quantity
  WHERE id = variant_id AND stock_quantity >= quantity;
END;
$$;