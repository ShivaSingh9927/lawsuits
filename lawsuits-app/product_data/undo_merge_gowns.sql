-- Undo Phase 3: Restoration of Individual Gown Products
-- Run this in the Supabase SQL Editor to restore individual gowns

DO $$
DECLARE
    gown_master_id UUID;
    senior_master_id UUID;
BEGIN
    -- 1. Identify current Master IDs
    gown_master_id := (SELECT id FROM products WHERE name = 'Advocate Gown (Master)' LIMIT 1);
    senior_master_id := (SELECT id FROM products WHERE name = 'Senior Advocate Gown (Master)' LIMIT 1);

    -- 2. Restore Visibility and reset Bundle status for all gowns
    UPDATE products
    SET 
        is_visible = true,
        is_bundle = false,
        bundle_config = NULL
    WHERE name LIKE '%Advocate Gown%';

    -- 3. Move Variants back to their rightful parents based on SKU patterns
    -- For Regular Gowns
    UPDATE product_variants SET product_id = (SELECT id FROM products WHERE name = 'Advocate Gown - Burkha' LIMIT 1) 
    WHERE sku LIKE 'TDO-GW-BLK-BUR%';
    
    UPDATE product_variants SET product_id = (SELECT id FROM products WHERE name = 'Advocate Gown - Sunsilk' LIMIT 1) 
    WHERE sku LIKE 'TDO-GW-BLK-SUN%';
    
    UPDATE product_variants SET product_id = (SELECT id FROM products WHERE name = 'Advocate Gown - T-Cot' LIMIT 1) 
    WHERE (sku LIKE 'TDO-GW-BLK-TCT%' OR sku LIKE 'TCO-TCT%');
    
    UPDATE product_variants SET product_id = (SELECT id FROM products WHERE name = 'Advocate Gown - Raymond' LIMIT 1) 
    WHERE sku LIKE 'TDO-GW-BLK-RAY%';
    
    UPDATE product_variants SET product_id = (SELECT id FROM products WHERE name = 'Advocate Gown - Lachka' LIMIT 1) 
    WHERE sku LIKE 'TDO-GW-BLK-LAC%';

    -- For Senior Gowns
    UPDATE product_variants SET product_id = (SELECT id FROM products WHERE name = 'Senior Advocate Gown - Burkha' LIMIT 1) 
    WHERE sku LIKE 'TDO-SGW-BLK-BUR%';
    
    UPDATE product_variants SET product_id = (SELECT id FROM products WHERE name = 'Senior Advocate Gown - Korea Silk' LIMIT 1) 
    WHERE sku LIKE 'TDO-SGW-KOR%';

    -- 4. Restore the Master products to their original individual names if they exist
    IF gown_master_id IS NOT NULL THEN
        UPDATE products 
        SET name = 'Advocate Gown - Superior Burkha', slug = 'gown-superior-burkha'
        WHERE id = gown_master_id;
    END IF;

    IF senior_master_id IS NOT NULL THEN
        UPDATE products 
        SET name = 'Senior Advocate Gown - Raymond', slug = 'senior-gown-raymond'
        WHERE id = senior_master_id;
    END IF;

    RAISE NOTICE 'Restoration of individual gowns complete.';
END $$;
