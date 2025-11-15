-- Create payment_urls table for admin to manage payment URLs
CREATE TABLE IF NOT EXISTS public.payment_urls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_method TEXT NOT NULL,
  payment_url TEXT NOT NULL,
  instructions TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_urls ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active payment URLs"
ON public.payment_urls
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage payment URLs"
ON public.payment_urls
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create money_requests table for admin approval
CREATE TABLE IF NOT EXISTS public.money_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  transaction_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.money_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own money requests"
ON public.money_requests
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create money requests"
ON public.money_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all money requests"
ON public.money_requests
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_payment_urls_updated_at
BEFORE UPDATE ON public.payment_urls
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_money_requests_updated_at
BEFORE UPDATE ON public.money_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();