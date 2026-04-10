const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase.rpc('get_constraints', { t_name: 'package_deals' }).catch(() => ({ error: 'RPC not found' }));
  
  if (error) {
    // Try raw query if RPC missing
    const { data: rawData, error: rawError } = await supabase.from('package_deals').select('*').limit(1);
    console.log("Sample row from package_deals:", rawData);
    
    // Also try to get relationship info from postgrest if possible (usually not)
    // We'll just try to guess or use the error message from a failed query
  }
  
  // Let's just try to fetch a product with the joined items and catch the SPECIFIC error
  const { data: p, error: e } = await supabase
    .from('products')
    .select('\*, package_deals!main_product_id(*)')
    .limit(1);
    
  console.log("Attempt 1 (main_product_id):", e?.message);
  
  const { data: p2, error: e2 } = await supabase
    .from('products')
    .select('\*, package_deals!package_deals_main_product_id_fkey(*)')
    .limit(1);
  
  console.log("Attempt 2 (constraint name):", e2?.message);
}

check();
