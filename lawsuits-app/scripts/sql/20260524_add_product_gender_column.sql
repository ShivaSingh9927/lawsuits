-- ============================================================================
-- 20260524_add_product_gender_column.sql
--
-- Adds public.products.gender so a single product row can be exposed on the
-- Men's page, the Women's page, or both (unisex). Previously the only way to
-- show a product on both gender pages was to duplicate the row, because
-- products.category_id is single-valued. That workaround is what produced the
-- "pant-cloth-raymond" duplicate of Pant Fabric.
--
-- After this migration the Men's collection should be filtered by
--   gender IN ('men','unisex')
-- and the Women's collection by
--   gender IN ('women','unisex').
-- The 'accessories' and 'combos' pages continue to filter by category_id.
--
-- Idempotent and reversible (see 20260524_rollback_product_gender_column.sql).
-- Runs in a single transaction.
-- ============================================================================

BEGIN;

-- 1. Add the column (nullable for now so the backfill can run).
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS gender TEXT
  CHECK (gender IN ('men', 'women', 'unisex'));

-- 2. Backfill from the existing single category_id.
UPDATE public.products p
   SET gender = CASE c.slug
                  WHEN 'mens-legal-attire'   THEN 'men'
                  WHEN 'womens-legal-attire' THEN 'women'
                  ELSE 'unisex'
                END
  FROM public.categories c
 WHERE c.id = p.category_id
   AND p.gender IS NULL;

-- 3. Any product not joined to a category (category_id IS NULL) defaults to unisex.
UPDATE public.products
   SET gender = 'unisex'
 WHERE gender IS NULL;

-- 4. Explicit overrides for products that are physically the same item across
--    genders. Add new UUIDs to this list as the catalog grows.
UPDATE public.products
   SET gender = 'unisex'
 WHERE id IN (
   '2c8e9e8a-7ad8-46f1-ace3-889970f3b329' -- Pant Fabric
 );

-- 5. Verify no NULLs remain, then lock the column down.
DO $$
DECLARE
  v_null_count INT;
BEGIN
  SELECT COUNT(*) INTO v_null_count FROM public.products WHERE gender IS NULL;
  IF v_null_count > 0 THEN
    RAISE EXCEPTION 'Aborting: % products still have NULL gender after backfill.', v_null_count;
  END IF;
END $$;

ALTER TABLE public.products
  ALTER COLUMN gender SET DEFAULT 'unisex',
  ALTER COLUMN gender SET NOT NULL;

-- 6. Index for the men's/women's page queries.
CREATE INDEX IF NOT EXISTS idx_products_gender ON public.products(gender);

-- 7. Sanity report (visible in Supabase SQL editor as a NOTICE).
DO $$
DECLARE
  v_men     INT;
  v_women   INT;
  v_unisex  INT;
BEGIN
  SELECT COUNT(*) INTO v_men    FROM public.products WHERE gender = 'men';
  SELECT COUNT(*) INTO v_women  FROM public.products WHERE gender = 'women';
  SELECT COUNT(*) INTO v_unisex FROM public.products WHERE gender = 'unisex';
  RAISE NOTICE 'gender backfill complete -> men=%, women=%, unisex=%', v_men, v_women, v_unisex;
END $$;

COMMIT;
