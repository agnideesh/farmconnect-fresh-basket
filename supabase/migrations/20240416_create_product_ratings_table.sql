
-- Create product_ratings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.product_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  
  -- Create a unique constraint to ensure one rating per product per user
  UNIQUE (product_id, user_id)
);

-- Add RLS policies to the product_ratings table
ALTER TABLE public.product_ratings ENABLE ROW LEVEL SECURITY;

-- Users can view all ratings
CREATE POLICY "Anyone can view ratings" 
  ON public.product_ratings 
  FOR SELECT 
  USING (true);

-- Users can insert/update only their own ratings
CREATE POLICY "Users can insert their own ratings" 
  ON public.product_ratings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings" 
  ON public.product_ratings 
  FOR UPDATE 
  USING (auth.uid() = user_id);
