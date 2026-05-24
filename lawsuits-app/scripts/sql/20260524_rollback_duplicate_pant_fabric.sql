-- ============================================================================
-- 20260524_rollback_duplicate_pant_fabric.sql
--
-- Reverses 20260524_remove_duplicate_pant_fabric.sql by re-inserting every row
-- from the *_bak_20260524 snapshot tables in FK-safe order:
--   products -> product_variants -> product_images -> reviews -> wishlist
--
-- Safe to run only if the matching backup tables still exist (i.e. you have
-- not manually dropped them after the destructive script).
--
-- Wrapped in a single transaction; aborts cleanly on any failure.
-- ============================================================================

BEGIN;

-- 0. Pre-flight: ensure all five backup tables exist.
DO $$
DECLARE
  v_missing TEXT := '';
BEGIN
  IF to_regclass('public.backup_products_bak_20260524')          IS NULL THEN v_missing := v_missing || ' backup_products_bak_20260524'; END IF;
  IF to_regclass('public.backup_product_variants_bak_20260524')  IS NULL THEN v_missing := v_missing || ' backup_product_variants_bak_20260524'; END IF;
  IF to_regclass('public.backup_product_images_bak_20260524')    IS NULL THEN v_missing := v_missing || ' backup_product_images_bak_20260524'; END IF;
  IF to_regclass('public.backup_reviews_bak_20260524')           IS NULL THEN v_missing := v_missing || ' backup_reviews_bak_20260524'; END IF;
  IF to_regclass('public.backup_wishlist_bak_20260524')          IS NULL THEN v_missing := v_missing || ' backup_wishlist_bak_20260524'; END IF;

  IF v_missing <> '' THEN
    RAISE EXCEPTION 'Aborting: missing backup tables ->%', v_missing;
  END IF;
END $$;

-- 1. Restore parent product first (so FKs in child rows resolve).
INSERT INTO public.products
SELECT * FROM public.backup_products_bak_20260524
ON CONFLICT (id) DO NOTHING;

-- 2. Restore children.
INSERT INTO public.product_variants
SELECT * FROM public.backup_product_variants_bak_20260524
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_images
SELECT * FROM public.backup_product_images_bak_20260524
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.reviews
SELECT * FROM public.backup_reviews_bak_20260524
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.wishlist
SELECT * FROM public.backup_wishlist_bak_20260524
ON CONFLICT (id) DO NOTHING;

-- 3. Verify row counts match the backups.
DO $$
DECLARE
  v_bak_p INT; v_now_p INT;
  v_bak_v INT; v_now_v INT;
  v_bak_i INT; v_now_i INT;
  v_bak_r INT; v_now_r INT;
  v_bak_w INT; v_now_w INT;
BEGIN
  SELECT COUNT(*) INTO v_bak_p FROM public.backup_products_bak_20260524;
  SELECT COUNT(*) INTO v_now_p FROM public.products
   WHERE id = '244d5b0c-2388-4208-bc38-e9a838db0f36';

  SELECT COUNT(*) INTO v_bak_v FROM public.backup_product_variants_bak_20260524;
  SELECT COUNT(*) INTO v_now_v FROM public.product_variants
   WHERE product_id = '244d5b0c-2388-4208-bc38-e9a838db0f36';

  SELECT COUNT(*) INTO v_bak_i FROM public.backup_product_images_bak_20260524;
  SELECT COUNT(*) INTO v_now_i FROM public.product_images
   WHERE product_id = '244d5b0c-2388-4208-bc38-e9a838db0f36';

  SELECT COUNT(*) INTO v_bak_r FROM public.backup_reviews_bak_20260524;
  SELECT COUNT(*) INTO v_now_r FROM public.reviews
   WHERE product_id = '244d5b0c-2388-4208-bc38-e9a838db0f36';

  SELECT COUNT(*) INTO v_bak_w FROM public.backup_wishlist_bak_20260524;
  SELECT COUNT(*) INTO v_now_w FROM public.wishlist
   WHERE product_id = '244d5b0c-2388-4208-bc38-e9a838db0f36';

  IF v_now_p < v_bak_p
     OR v_now_v < v_bak_v
     OR v_now_i < v_bak_i
     OR v_now_r < v_bak_r
     OR v_now_w < v_bak_w THEN
    RAISE EXCEPTION
      'Aborting: rollback verification failed. expected/now -> products %/%, variants %/%, images %/%, reviews %/%, wishlist %/%',
      v_bak_p, v_now_p, v_bak_v, v_now_v, v_bak_i, v_now_i, v_bak_r, v_now_r, v_bak_w, v_now_w;
  END IF;

  RAISE NOTICE 'Rollback complete. Restored products=%, variants=%, images=%, reviews=%, wishlist=%.',
    v_bak_p, v_bak_v, v_bak_i, v_bak_r, v_bak_w;
END $$;

COMMIT;

-- Once you have confirmed in the running app that the duplicate is restored
-- as expected, you may drop the snapshot tables manually:
--
--   DROP TABLE public.backup_wishlist_bak_20260524;
--   DROP TABLE public.backup_reviews_bak_20260524;
--   DROP TABLE public.backup_product_images_bak_20260524;
--   DROP TABLE public.backup_product_variants_bak_20260524;
--   DROP TABLE public.backup_products_bak_20260524;
