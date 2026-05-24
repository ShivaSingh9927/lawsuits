-- ============================================================================
-- 20260524_rollback_product_gender_column.sql
--
-- Reverses 20260524_add_product_gender_column.sql by dropping the index and
-- the gender column. Safe to run repeatedly (uses IF EXISTS).
-- Run only AFTER you have reverted the corresponding application code that
-- reads/filters by products.gender, otherwise the app will throw at runtime.
-- ============================================================================

BEGIN;

DROP INDEX IF EXISTS public.idx_products_gender;

ALTER TABLE public.products
  DROP COLUMN IF EXISTS gender;

COMMIT;
