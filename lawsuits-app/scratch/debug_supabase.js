const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function check() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("--- CATEGORIES ---");
  const { data: cats } = await supabase.from('categories').select('*');
  cats?.forEach(c => console.log(`- ${c.id}: ${c.name} (${c.slug})`));

  console.log("\n--- PRODUCTS ---");
  const { data: prods } = await supabase.from('products').select('name, is_visible, category_id, is_featured');
  prods?.forEach(p => console.log(`- [${p.is_visible ? 'VIS' : 'HID'}] [${p.is_featured ? 'FEAT' : '----'}] ${p.name} (cat: ${p.category_id})`));
}

check();
