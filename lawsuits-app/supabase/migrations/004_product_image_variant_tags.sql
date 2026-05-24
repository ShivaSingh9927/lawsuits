-- 004_product_image_variant_tags.sql
-- Tag product_images with optional color / fabric so the product detail page
-- can swap the main image to match the user's variant selection.
-- Untagged images remain product-wide defaults; matching is case-insensitive
-- in application code so existing values like 'Black' / 'BLACK' both work.

ALTER TABLE public.product_images
  ADD COLUMN IF NOT EXISTS color TEXT,
  ADD COLUMN IF NOT EXISTS fabric TEXT;

CREATE INDEX IF NOT EXISTS idx_product_images_product_color
  ON public.product_images(product_id, color);

CREATE INDEX IF NOT EXISTS idx_product_images_product_fabric
  ON public.product_images(product_id, fabric);
