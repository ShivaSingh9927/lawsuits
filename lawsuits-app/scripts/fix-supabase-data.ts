import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixData() {
  console.log("Checking categories...");
  const { data: category } = await supabase
    .from('categories')
    .select('id')
    .ilike('name', '%Men%')
    .single();

  if (!category) {
    console.error("Could not find Men's category to link product.");
    return;
  }

  // 1. Add "Dress Coat" if missing
  console.log("Upserting Dress Coat...");
  const { error: pError } = await supabase
    .from('products')
    .upsert({
      name: 'Dress Coat',
      slug: 'dress-coat',
      sku: 'TDO-CT-BLK',
      description: 'Premium Advocate Dress Coat crafted for a sharp and professional courtroom look.',
      category_id: category.id,
      base_price: 2500,
      is_visible: true
    } as any, { onConflict: 'slug' });

  if (pError) console.error("Error adding product:", pError);
  else console.log("Product Dress Coat synced!");

  // 2. Fix other slugs (lowercase and hyphenate)
  console.log("Fixing all slugs...");
  const { data: allProducts } = await supabase.from('products').select('id, name, slug');
  
  for (const p of (allProducts || [])) {
    const fixedSlug = p.name.toLowerCase().trim().replace(/ & /g, '-').replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    if (p.slug !== fixedSlug) {
      console.log(`Fixing: "${p.slug}" -> "${fixedSlug}"`);
      await supabase.from('products').update({ slug: fixedSlug }).eq('id', p.id);
    }
  }

  console.log("All done!");
}

fixData();
