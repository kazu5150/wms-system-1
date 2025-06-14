-- Add image columns to products table
ALTER TABLE products 
ADD COLUMN main_image_url TEXT,
ADD COLUMN additional_image_1_url TEXT,
ADD COLUMN additional_image_2_url TEXT,
ADD COLUMN additional_image_3_url TEXT;

-- Add comments for clarity
COMMENT ON COLUMN products.main_image_url IS 'Main product image URL';
COMMENT ON COLUMN products.additional_image_1_url IS 'Additional product image 1 URL';
COMMENT ON COLUMN products.additional_image_2_url IS 'Additional product image 2 URL';
COMMENT ON COLUMN products.additional_image_3_url IS 'Additional product image 3 URL';