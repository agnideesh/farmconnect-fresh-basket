
-- Create a storage bucket for product images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'Product Images', true);

-- Allow authenticated users to upload files to the bucket
CREATE POLICY "Allow uploads from authenticated users"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images' AND auth.uid() = (storage.foldername(name))[1]::uuid);

-- Allow users to update their own files
CREATE POLICY "Allow updates for users based on folder name"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images' AND auth.uid() = (storage.foldername(name))[1]::uuid);

-- Allow users to delete their own files
CREATE POLICY "Allow deletion for users based on folder name"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'product-images' AND auth.uid() = (storage.foldername(name))[1]::uuid);

-- Allow public read access to product images
CREATE POLICY "Allow public read access to product images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product-images');
