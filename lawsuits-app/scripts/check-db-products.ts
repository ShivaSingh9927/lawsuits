import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProducts() {
  console.log("Fetching all products...");
  const { data, error } = await supabase
    .from('products')
    .select('id, name, slug, is_visible, deleted_at')
    .limit(50);

  if (error) {
    console.error("Error fetching products:", error);
    return;
  }

  console.log("\n--- PRODUCT LIST ---");
  data?.forEach(p => {
    console.log(`ID: ${p.id} | Name: "${p.name}" | Slug: "${p.slug}" | Visible: ${p.is_visible}`);
  });
  console.log("--------------------\n");
}

checkProducts();
