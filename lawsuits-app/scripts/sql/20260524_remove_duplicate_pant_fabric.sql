-- ============================================================================
-- 20260524_remove_duplicate_pant_fabric.sql
--
-- Hard-deletes the duplicate Pant Fabric product (slug "pant-cloth-raymond",
-- visually identical to the canonical Pant Fabric product)
--   id = 244d5b0c-2388-4208-bc38-e9a838db0f36
-- and all rows referencing it via FK in:
--   product_variants, product_images, reviews, wishlist  (ON DELETE CASCADE)
-- order_items has NO cascade -> we abort if any line items reference it,
-- so financial history is never orphaned.
--
-- Before deletion we snapshot every affected row into _bak_20260524 tables
-- so the operation is fully reversible via the paired rollback script
-- (20260524_rollback_duplicate_pant_fabric.sql).
--
-- Run this in the Supabase SQL editor (or psql) connected to the target DB.
-- The whole thing runs in a single transaction: any failure auto-rolls back
-- and leaves the database (and the _bak_ tables) untouched.
-- ============================================================================

BEGIN;

-- 1. Pre-flight: confirm the duplicate still exists and looks like what we expect.
DO $$
DECLARE
  v_count       INT;
  v_slug        TEXT;
  v_order_refs  INT;
BEGIN
  SELECT COUNT(*), MAX(slug)
    INTO v_count, v_slug
    FROM public.products
   WHERE id = '244d5b0c-2388-4208-bc38-e9a838db0f36';

  IF v_count = 0 THEN
    RAISE EXCEPTION
      'Aborting: product 244d5b0c-2388-4208-bc38-e9a838db0f36 not found. Nothing to delete.';
  END IF;

  -- Slug guard: this product was identified visually (by image), not by slug.
  -- The DB slug is 'pant-cloth-raymond'. We still verify it to catch the case
  -- where the row at this UUID has been swapped for an unrelated product.
  IF v_slug <> 'pant-cloth-raymond' THEN
    RAISE EXCEPTION
      'Aborting: product 244d5b0c-2388-4208-bc38-e9a838db0f36 has unexpected slug %. Expected pant-cloth-raymond. Refusing to proceed.',
      v_slug;
  END IF;

  -- 2. Order-items guard: refuse hard-delete if any order references this product.
  SELECT COUNT(*)
    INTO v_order_refs
    FROM public.order_items
   WHERE product_id = '244d5b0c-2388-4208-bc38-e9a838db0f36';

  IF v_order_refs > 0 THEN
    RAISE EXCEPTION
      'Aborting: % order_items rows reference the duplicate product. Hard delete would orphan financial history. Reassign those order_items to the canonical Pant Fabric product (or use a soft delete) before re-running this script.',
      v_order_refs;
  END IF;
END $$;

-- 3. Snapshot every affected row into backup tables.
--    Suffix _bak_20260524 is matched verbatim by the rollback script.
--    CTAS runs inside the transaction, so a later failure rolls these back too.
CREATE TABLE public.backup_products_bak_20260524 AS
SELECT *
  FROM public.products
 WHERE id = '244d5b0c-2388-4208-bc38-e9a838db0f36';

CREATE TABLE public.backup_product_variants_bak_20260524 AS
SELECT *
  FROM public.product_variants
 WHERE product_id = '244d5b0c-2388-4208-bc38-e9a838db0f36';

CREATE TABLE public.backup_product_images_bak_20260524 AS
SELECT *
  FROM public.product_images
 WHERE product_id = '244d5b0c-2388-4208-bc38-e9a838db0f36';

CREATE TABLE public.backup_reviews_bak_20260524 AS
SELECT *
  FROM public.reviews
 WHERE product_id = '244d5b0c-2388-4208-bc38-e9a838db0f36';

CREATE TABLE public.backup_wishlist_bak_20260524 AS
SELECT *
  FROM public.wishlist
 WHERE product_id = '244d5b0c-2388-4208-bc38-e9a838db0f36';

-- 4. Delete the parent product. Cascades clean up variants/images/reviews/wishlist.
DELETE FROM public.products
 WHERE id = '244d5b0c-2388-4208-bc38-e9a838db0f36';

-- 5. Verify everything is gone.
DO $$
DECLARE
  v_products INT;
  v_variants INT;
  v_images   INT;
  v_reviews  INT;
  v_wishlist INT;
BEGIN
  SELECT COUNT(*) INTO v_products
    FROM public.products
   WHERE id = '244d5b0c-2388-4208-bc38-e9a838db0f36';

  SELECT COUNT(*) INTO v_variants
    FROM public.product_variants
   WHERE product_id = '244d5b0c-2388-4208-bc38-e9a838db0f36';

  SELECT COUNT(*) INTO v_images
    FROM public.product_images
   WHERE product_id = '244d5b0c-2388-4208-bc38-e9a838db0f36';

  SELECT COUNT(*) INTO v_reviews
    FROM public.reviews
   WHERE product_id = '244d5b0c-2388-4208-bc38-e9a838db0f36';

  SELECT COUNT(*) INTO v_wishlist
    FROM public.wishlist
   WHERE product_id = '244d5b0c-2388-4208-bc38-e9a838db0f36';

  IF v_products + v_variants + v_images + v_reviews + v_wishlist <> 0 THEN
    RAISE EXCEPTION
      'Aborting: post-delete verification failed. Remaining rows -> products=%, variants=%, images=%, reviews=%, wishlist=%',
      v_products, v_variants, v_images, v_reviews, v_wishlist;
  END IF;

  RAISE NOTICE 'Duplicate Pant Fabric product 244d5b0c-... successfully removed. Backups retained in *_bak_20260524 tables.';
END $$;

COMMIT;

-- After a stable release cycle and once you are sure no rollback is needed,
-- you can clean up the snapshots manually:
--
--   DROP TABLE public.backup_wishlist_bak_20260524;
--   DROP TABLE public.backup_reviews_bak_20260524;
--   DROP TABLE public.backup_product_images_bak_20260524;
--   DROP TABLE public.backup_product_variants_bak_20260524;
--   DROP TABLE public.backup_products_bak_20260524;
