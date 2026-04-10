const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function check() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: prods, error } = await supabase.from('products').select('*, category:categories(*)');
  
  let output = `Found ${prods?.length || 0} total products.\n\n`;
  
  if (error) {
    output += `ERROR: ${error.message}\n`;
  } else {
    prods.forEach(p => {
      output += `- [${p.is_visible ? 'VISIBLE' : 'HIDDEN '}] [${p.is_featured ? 'FEAT' : '----'}] ${p.name} (Cat: ${p.category?.name || 'N/A'})\n`;
    });
  }

  fs.writeFileSync('scratch/product_diagnostic.txt', output);
  console.log("Diagnostic saved to scratch/product_diagnostic.txt");
}

check();
