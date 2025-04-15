
-- Function to set a product rating (create or update)
CREATE OR REPLACE FUNCTION public.set_product_rating(
  p_product_id UUID,
  p_rating INTEGER,
  p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert the rating if it doesn't exist, update it if it does
  INSERT INTO public.product_ratings (product_id, user_id, rating)
  VALUES (p_product_id, p_user_id, p_rating)
  ON CONFLICT (product_id, user_id) 
  DO UPDATE SET rating = p_rating, created_at = now();
END;
$$;

-- Function to get average rating for a product
CREATE OR REPLACE FUNCTION public.get_product_rating(p_product_id UUID)
RETURNS TABLE (
  average_rating NUMERIC,
  total_ratings BIGINT
)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROUND(AVG(rating)::numeric, 1) as average_rating,
    COUNT(*) as total_ratings
  FROM public.product_ratings
  WHERE product_id = p_product_id;
END;
$$;
