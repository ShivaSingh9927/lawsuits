
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local
const envContent = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function investigate() {
    console.log('--- Fetching 5-Piece Suite ---');
    const { data: products, error: pError } = await supabase
        .from('products')
        .select('*')
        .eq('id', 'e7509d8e-d428-4a0b-a9f8-182ef5171fca')
        .single();
    
    if (pError) {
        console.error('Product Error:', pError);
        return;
    }

    console.log('Product Found:', products.name);

    console.log('\n--- Fetching Package Deals (Fixed Join) ---');
    // Specify the relationship explicitly
    const { data: items, error: iError } = await supabase
        .from('package_deals')
        .select('*, component:products!package_deals_component_id_fkey(*, variants:product_variants!product_variants_product_id_fkey(*))')
        .eq('main_product_id', products.id);
    
    if (iError) {
        console.log('Explicit join failed, trying simpler join...');
        const { data: items2, error: iError2 } = await supabase
            .from('package_deals')
            .select(`
                *,
                component:products!component_id (
                    *,
                    variants:product_variants(*)
                )
            `)
            .eq('main_product_id', products.id);
        
        if (iError2) {
            console.error('Final Error:', iError2);
            return;
        }
        processItems(items2);
    } else {
        processItems(items);
    }
}

function processItems(items) {
    console.log('Items Count:', items.length);
    items.forEach(item => {
        console.log(`\nLabel: ${item.label}`);
        if (item.component) {
            console.log(`Component: ${item.component.name}`);
            const variants = item.component.variants || [];
            console.log(`Variants Found: ${variants.length}`);
            variants.forEach(v => {
                console.log(`  - ID: ${v.id}, Size: ${v.size}, Stock: ${v.stock_quantity}`);
            });
        } else {
            console.log('Component not joined');
        }
    });
}

investigate();
