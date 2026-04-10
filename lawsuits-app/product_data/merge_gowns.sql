-- Phase 3: Consolidation of Gowns into Master Products
-- Run this in the Supabase SQL Editor

-- 1. Identify or Create Master Advocate Gown
-- We'll use the 'Advocate Gown - Superior Burkha' (TDO-GW-BLK-SBUR) as the Master template
UPDATE products 
SET 
  name = 'Advocate Gown (Master)',
  is_bundle = true,
  bundle_config = '[
    {"id": "fabric", "label": "Select Fabric", "type": "fabric"},
    {"id": "size", "label": "Select Size", "type": "top"}
  ]'::jsonb,
  is_visible = true
WHERE id = (SELECT id FROM products WHERE name = 'Advocate Gown - Superior Burkha' LIMIT 1);

-- 2. Move variants from other gown products to the Master
-- This moves Burkha, Sunsilk, T-Cot, Rayon, etc. into the Master product
-- Replace MASTER_ID with the actual UUID of the Master product
DO $$
DECLARE
    master_id UUID := (SELECT id FROM products WHERE name = 'Advocate Gown (Master)' LIMIT 1);
BEGIN
    -- Move variants from Sunsilk, Rayon, Lachka etc.
    UPDATE product_variants
    SET product_id = master_id
    WHERE product_id IN (
        SELECT id FROM products 
        WHERE name LIKE 'Advocate Gown - %' 
        AND id != master_id
    );

    -- Disable the old individual products
    UPDATE products
    SET is_visible = false
    WHERE name LIKE 'Advocate Gown - %'
    AND id != master_id;
END $$;

-- 3. Repeat for Senior Advocate Gowns
UPDATE products 
SET 
  name = 'Senior Advocate Gown (Master)',
  is_bundle = true,
  bundle_config = '[
    {"id": "fabric", "label": "Select Fabric", "type": "fabric"},
    {"id": "size", "label": "Select Size", "type": "top"}
  ]'::jsonb,
  is_visible = true
WHERE id = (SELECT id FROM products WHERE name = 'Senior Advocate Gown - Raymond' LIMIT 1);

DO $$
DECLARE
    senior_master_id UUID := (SELECT id FROM products WHERE name = 'Senior Advocate Gown (Master)' LIMIT 1);
BEGIN
    UPDATE product_variants
    SET product_id = senior_master_id
    WHERE product_id IN (
        SELECT id FROM products 
        WHERE name LIKE 'Senior Advocate Gown - %' 
        AND id != senior_master_id
    );

    UPDATE products
    SET is_visible = false
    WHERE name LIKE 'Senior Advocate Gown - %'
    AND id != senior_master_id;
END $$;
