const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function undoClubbing() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  console.log("Fetching all products...");
  const { data: allProducts, error: fetchError } = await supabase.from('products').select('*');
  
  if (fetchError || !allProducts) {
    console.error("Error fetching products:", fetchError);
    return;
  }

  // 1. Restore visibility and names for original products
  console.log("Restoring original products...");
  
  const restorations = [
    { name: 'Advocate Gown - Burkha' },
    { name: 'Advocate Gown - Sunsilk' },
    { name: 'Advocate Gown - T-Cot' },
    { name: 'Advocate Gown - Raymond' },
    { name: 'Advocate Gown - Lachka' },
    { name: 'Senior Advocate Gown - Burkha' },
    { name: 'Senior Advocate Gown - Korea Silk' },
    { name: 'Senior Advocate Gown - Raymond' }
  ];

  for (const item of restorations) {
     const searchTerm = item.name.split(' - ')[1] || item.name;
     const p = allProducts.find(p => p.name.includes(searchTerm));
     if (p) {
       console.log(`Updating ${p.name} to be visible...`);
       await supabase.from('products').update({ 
         is_visible: true, 
         is_bundle: false,
         bundle_config: null,
         deleted_at: null 
       }).eq('id', p.id);
     }
  }

  // 2. Fix Master Products (Rename back or hide)
  const master = allProducts.find(p => p.name.includes('(Master)') && p.name.includes('Advocate Gown') && !p.name.includes('Senior'));
  if (master) {
     console.log("Found master, restoring to Superior Burkha...");
     await supabase.from('products').update({ name: 'Advocate Gown - Superior Burkha', slug: 'gown-superior-burkha', is_bundle: false, bundle_config: null, is_visible: true }).eq('id', master.id);
  }
  
  const seniorMaster = allProducts.find(p => p.name.includes('(Master)') && p.name.includes('Senior Advocate Gown'));
  if (seniorMaster) {
     console.log("Found senior master, restoring to Raymond...");
     await supabase.from('products').update({ name: 'Senior Advocate Gown - Raymond', slug: 'senior-gown-raymond', is_bundle: false, bundle_config: null, is_visible: true }).eq('id', seniorMaster.id);
  }

  // 3. Re-fetch products to get updated IDs/Names
  const { data: updatedProducts } = await supabase.from('products').select('*');

  // 4. Move variants back to their respective products based on SKU
  console.log("Re-mapping variants...");
  const { data: allVariants } = await supabase.from('product_variants').select('*');

  for (const v of allVariants) {
    let targetProductName = "";
    if (v.sku.includes("TDO-GW-BLK-BUR")) targetProductName = "Advocate Gown - Burkha";
    else if (v.sku.includes("TDO-GW-BLK-SUN")) targetProductName = "Advocate Gown - Sunsilk";
    else if (v.sku.includes("TDO-GW-BLK-TCT")) targetProductName = "Advocate Gown - T-Cot";
    else if (v.sku.includes("TCO-TCT")) targetProductName = "Advocate Gown - T-Cot";
    else if (v.sku.includes("TDO-GW-BLK-RAY")) targetProductName = "Advocate Gown - Raymond";
    else if (v.sku.includes("TDO-GW-BLK-LAC")) targetProductName = "Advocate Gown - Lachka";
    else if (v.sku.includes("TDO-GW-BLK-SBUR")) targetProductName = "Advocate Gown - Superior Burkha";
    
    else if (v.sku.includes("TDO-SGW-BLK-BUR")) targetProductName = "Senior Advocate Gown - Burkha";
    else if (v.sku.includes("TDO-SGW-KOR")) targetProductName = "Senior Advocate Gown - Korea Silk";
    else if (v.sku.includes("TDO-SGW-BLK-RAY")) targetProductName = "Senior Advocate Gown - Raymond";

    if (targetProductName) {
       const targetProduct = updatedProducts.find(p => p.name === targetProductName);
       if (targetProduct && v.product_id !== targetProduct.id) {
         console.log(`Moving variant ${v.sku} to ${targetProduct.name}`);
         const { error } = await supabase.from('product_variants').update({ product_id: targetProduct.id }).eq('id', v.id);
         if (error) console.error(`Error moving variant ${v.sku}:`, error);
       }
    }
  }

  console.log("Undo complete.");
}

undoClubbing();
