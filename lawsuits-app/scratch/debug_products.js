const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function check() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from('products')
    .select('id, name, slug, is_visible, deleted_at, category_id, is_featured')
    .is('deleted_at', null);

  if (error) {
    console.error(error);
    return;
  }

  console.log(`Found ${data.length} products:`);
  data.forEach(p => {
    console.log(`- [${p.is_visible ? 'VIS' : 'HID'}] [${p.is_featured ? 'FEAT' : '----'}] ${p.name}`);
  });
}

check();
