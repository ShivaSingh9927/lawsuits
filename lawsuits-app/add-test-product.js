import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// 1. Load environment variables from your root .env file
dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Using admin key for bypass

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials in .env. Please check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addTestProduct() {
  console.log("🚀 Initializing: Adding 'Love to Develop' ₹1 test product...");

  // Existing category ID for 'Accessories'
  const categoryId = 'a1b2c3d4-0001-0001-0001-000000000003'; 

  // --- Step 1: Create or Get the Product ---
  const { data: product, error: productError } = await supabase
    .from('products')
    .upsert([
      {
        name: 'Love to Develop',
        slug: 'love-to-develop',
        description: 'A special test product for full payment gateway verification. Price: ₹1.',
        category_id: categoryId,
        base_price: 1,
        is_visible: true,
        is_featured: true,
      }
    ], { onConflict: 'slug' })
    .select()
    .single();

  if (productError) {
    console.error("❌ Error creating product:", productError.message);
    return;
  }

  const productId = product.id;
  console.log(`✅ Product ready: ${product.name} (ID: ${productId})`);

  // --- Step 2: Create/Update the Variant (Essential for Checkout) ---
  const { error: variantError } = await supabase
    .from('product_variants')
    .upsert([
      {
        product_id: productId,
        sku: 'LOVE-DEV-TEST-01',
        size: 'One Size',
        stock_quantity: 9999,
        price: 1,
        is_out_of_stock: false,
      }
    ], { onConflict: 'sku' });

  if (variantError) {
    console.error("❌ Error creating variant:", variantError.message);
  } else {
    console.log("✅ Variant linked successfully.");
  }

  // --- Step 3: Add a Primary Image ---
  const { error: imageError } = await supabase
    .from('product_images')
    .upsert([
      {
        product_id: productId,
        url: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2070&auto=format&fit=crop',
        alt: 'Love to Develop',
        is_primary: true,
        position: 0
      }
    ], { onConflict: 'product_id,url' });

  if (imageError) {
    console.warn("⚠️ Warning adding image:", imageError.message);
  } else {
    console.log("✅ Product image set.");
  }

  console.log("\n✨ SUCCESS! You can now find 'Love to Develop' on your shop page for ₹1.");
  console.log("You can use this for your live Razorpay payment test.");
}

addTestProduct();
