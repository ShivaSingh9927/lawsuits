-- ============================================
-- 003_product_display_order.sql
-- Adds an admin-controlled ordering column for products within a category.
-- Lower display_order = earlier in the listing.
-- This column is hidden from customers; it is only used in ORDER BY clauses
-- and edited via the admin UI.
-- ============================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS display_order INT NOT NULL DEFAULT 0;

-- Backfill: give each existing product a sane initial position within its
-- category, ordered by created_at DESC (newest first).
WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY category_id
           ORDER BY created_at DESC NULLS LAST, id
         ) AS rn
  FROM public.products
  WHERE deleted_at IS NULL
)
UPDATE public.products p
SET display_order = ranked.rn
FROM ranked
WHERE p.id = ranked.id
  AND p.display_order = 0;

-- Composite index for the most common read pattern: products of a category
-- ordered by display_order.
CREATE INDEX IF NOT EXISTS idx_products_category_order
  ON public.products(category_id, display_order);
