const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { execSync } = require('child_process');
require('dotenv').config();

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const CATEGORIES_CSV = path.join(__dirname, 'product_data/categories_rows(in).csv');
const PRODUCTS_CSV = path.join(__dirname, 'product_data/products_rows 1(in).csv');
const VARIANTS_CSV = path.join(__dirname, 'product_data/product_variants_rows(in).csv');

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Error: Supabase credentials missing in .env');
  process.exit(1);
}

// Image Extension Mapper (Based on bucket screenshot)
const IMAGE_EXT_MAP = {
  'TDO-ACC-COT3': 'jpeg',
  'TDO-GW-WC-BLK': 'jpeg',
  'TDO-PKG-CO-PN': 'jpg',
  'TDO-PKG-CO-WC-PN': 'jpg',
  'TDO-PKG-SH-PN': 'jpg',
  'TDO-PKG-WC-PN': 'jpeg',
  'TDO-WC-BLK': 'png',
};

function getImageUrl(id) {
  const ext = IMAGE_EXT_MAP[id] || 'png';
  return `${SUPABASE_URL}/storage/v1/object/public/product-images/${id}.${ext}`;
}

async function supabaseCall(method, table, body = null, params = '') {
  const url = `${SUPABASE_URL}/rest/v1/${table}${params}`;
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json'
  };
  
  if (method === 'POST' || method === 'PATCH') {
    headers['Prefer'] = 'return=representation';
  }
  
  const options = {
    method,
    headers,
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type');
    
    // Some deletes return 204 No Content
    if (response.status === 204) return null;
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      if (!response.ok) {
        console.error(`🚨 Error [${response.status}] in ${method} ${table}:`, JSON.stringify(data, null, 2));
      }
      return data;
    } else {
      const text = await response.text();
      return text;
    }
  } catch (error) {
    console.error(`🚨 Network Error in ${method} ${table}:`, error.message);
    return { error: true, message: error.message };
  }
}

async function migrate() {
  console.log('🚀 Starting project repopulation (FAST BATCH MODE)...');

  try {
    // 1. Clear existing data (Sequential cleanup to avoid integrity errors)
    console.log('🧹 Clearing existing database data...');
    await supabaseCall('DELETE', 'product_images', null, '?id=neq.00000000-0000-0000-0000-000000000000');
    await supabaseCall('DELETE', 'product_variants', null, '?id=neq.00000000-0000-0000-0000-000000000000');
    await supabaseCall('DELETE', 'products', null, '?id=neq.00000000-0000-0000-0000-000000000000');
    await supabaseCall('DELETE', 'categories', null, '?id=neq.00000000-0000-0000-0000-000000000000');
    console.log('✅ Clean slate achieved.');

    // 2. Import Categories
    console.log('📁 Batch importing categories...');
    const categoriesRaw = fs.readFileSync(CATEGORIES_CSV, 'utf-8');
    const categoryRecords = parse(categoriesRaw, { columns: true, skip_empty_lines: true, trim: true });
    
    const categoriesPayload = categoryRecords.filter(c => c.name).map(cat => ({
      name: cat.name.trim(),
      slug: cat.slug || cat.name.toLowerCase().replace(/ /g, '-'),
      description: cat.description,
      position: parseInt(cat.position) || 0,
      is_visible: cat.is_visible === 'TRUE'
    }));

    const categoryResult = await supabaseCall('POST', 'categories', categoriesPayload);
    const categoryMap = {}; // Name -> UUID
    if (Array.isArray(categoryResult)) {
      categoryResult.forEach(c => { categoryMap[c.name] = c.id; });
    }

    // 3. Import Products
    console.log('👔 Batch importing products...');
    const productsRaw = fs.readFileSync(PRODUCTS_CSV, 'utf-8');
    const productRecords = parse(productsRaw, { columns: true, skip_empty_lines: true, trim: true });
    
    const productsPayload = [];
    const productLegacyToSlug = {};

    for (const prod of productRecords) {
      if (!prod.id || !prod.name) continue;
      
      const categoryId = categoryMap[prod.category_id.trim()];
      let fit = prod.fit ? prod.fit.toLowerCase() : 'classic';
      if (!['slim', 'modern', 'classic'].includes(fit)) {
        if (fit === 'standard' || fit === 'regular') fit = 'classic';
        else if (fit === 'tailored') fit = 'modern';
        else fit = 'classic';
      }

      // Generate a unique slug by appending the Legacy ID
      const uniqueSlug = prod.slug || `${prod.name}-${prod.id}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      productLegacyToSlug[prod.id.trim()] = uniqueSlug;

      productsPayload.push({
        name: prod.name.trim(),
        slug: uniqueSlug,
        description: prod.description,
        category_id: categoryId,
        base_price: parseFloat(prod.base_price.replace(/,/g, '')) || 0,
        compare_at_price: prod.compare_at_price ? parseFloat(prod.compare_at_price.replace(/,/g, '')) : null,
        fabric: prod.fabric,
        fit: fit,
        color: prod.color,
        is_visible: prod.is_visible === 'TRUE',
        is_featured: prod.is_featured === 'TRUE'
      });
    }

    const productResult = await supabaseCall('POST', 'products', productsPayload);
    
    if (productResult && productResult.error) {
      console.error('🔴 Product Insert Error:', JSON.stringify(productResult, null, 2));
    }
    
    // Build mapping: slug -> UUID
    const productMap = {}; 
    if (Array.isArray(productResult)) {
      productResult.forEach(p => { productMap[p.slug] = p.id; });
    }

    // 4. Link Images and Variants
    console.log('🔢 Batch importing variants & images...');
    
    // Build variants payload
    const variantsRaw = fs.readFileSync(VARIANTS_CSV, 'utf-8');
    const variantRecords = parse(variantsRaw, { columns: true, skip_empty_lines: true, trim: true });
    const variantsPayload = [];
    const imagesPayload = [];
    
    // Add Set to track unique SKUs
    const uniqueSkus = new Set();

    for (const prodRecord of productRecords) {
      const legacyId = prodRecord.id.trim();
      const uniqueSlug = productLegacyToSlug[legacyId];
      const productId = productMap[uniqueSlug];
      
      if (productId) {
        imagesPayload.push({
          product_id: productId,
          url: getImageUrl(legacyId),
          alt: prodRecord.name,
          is_primary: true,
          position: 0
        });
      }
    }

    for (const variant of variantRecords) {
      if (!variant.id || !variant.sku) continue;
      
      const legacyId = variant.id.trim();
      const uniqueSlug = productLegacyToSlug[legacyId];
      if (!uniqueSlug) continue;

      const productId = productMap[uniqueSlug];
      if (!productId) continue;
      
      const cleanedSku = variant.sku.trim();
      if (uniqueSkus.has(cleanedSku)) {
          console.log(`⚠️ Skipping duplicate variant SKU found in CSV: ${cleanedSku}`);
          continue; 
      }
      uniqueSkus.add(cleanedSku);

      variantsPayload.push({
        product_id: productId,
        sku: cleanedSku,
        size: variant.size,
        stock_quantity: parseInt(variant.stock_quantity) || 0,
        price: parseFloat(variant.price.toString().replace(/,/g, '').replace(/"/g, '')) || 0,
        compare_at_price: variant.compare_at_price ? parseFloat(variant.compare_at_price.toString().replace(/,/g, '')) : null,
        is_out_of_stock: variant.is_out_of_stock === 'TRUE'
      });
    }

    console.log(`🔎 Debug: Category Result Type: ${typeof categoryResult}, IsArray: ${Array.isArray(categoryResult)}`);
    console.log(`🔎 Debug: Product Result Type: ${typeof productResult}, IsArray: ${Array.isArray(productResult)}`);
    console.log(`🔎 Debug: Category Map Keys: ${Object.keys(categoryMap).length}`);
    console.log(`🔎 Debug: Product Map Keys: ${Object.keys(productMap).length}`);
    
    if (imagesPayload.length > 0) {
      supabaseCall('POST', 'product_images', imagesPayload);
    }
    
    if (variantsPayload.length > 0) {
      supabaseCall('POST', 'product_variants', variantsPayload);
    }

    console.log('\n✨ REPOPULATION COMPLETE!');
    console.log(`📊 Totals: ${categoriesPayload.length} Categories, ${productsPayload.length} Products, ${variantsPayload.length} Variants, ${imagesPayload.length} Images.`);
    
    // Clean up
    if (fs.existsSync(path.join(__dirname, 'temp_payload.json'))) {
      fs.unlinkSync(path.join(__dirname, 'temp_payload.json'));
    }

  } catch (err) {
    console.error('\n💥 Critical Error:', err.message);
  }
}

migrate();
// Simon says: "Speed optimized migration using batch inserts via Supabase PostgREST API."
