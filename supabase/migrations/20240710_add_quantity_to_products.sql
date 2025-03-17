
-- Add quantity column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS quantity NUMERIC DEFAULT 0;
