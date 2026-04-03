-- Update all products to use the demo.webp placeholder
-- This script clears existing images and inserts one primary image for every product

-- 1. Optional: Clear existing images (uncomment if you want a clean slate)
-- DELETE FROM public.product_images;

-- 2. Insert the placeholder image for every product in the database
INSERT INTO public.product_images (product_id, url, thumbnail_url, medium_url, alt, is_primary, position)
SELECT 
    id as product_id, 
    '/product-image/demo.webp' as url, 
    '/product-image/demo.webp' as thumbnail_url, 
    '/product-image/demo.webp' as medium_url, 
    name || ' Placeholder' as alt, 
    true as is_primary,
    0 as position
FROM public.products
ON CONFLICT DO NOTHING;

-- 3. Also update categories just in case
UPDATE public.categories
SET image_url = '/product-image/demo.webp';
