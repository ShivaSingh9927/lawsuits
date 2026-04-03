import { createClient } from "@supabase/supabase-js";
import { parse } from "csv-parse/sync";
import fs from "fs";
import path from "path";
import { v5 as uuidv5 } from "uuid";
import dotenv from "dotenv";

dotenv.config();

const NAMESPACE = "1b671a64-40d5-491e-99b0-da01ff1f3341"; // Deterministic UUID base

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Error: Missing Supabase Environment Variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function importData() {
  console.log("🚀 Starting Catalog Migration...");

  // 1. Load CSVs
  const categoriesCsv = fs.readFileSync(path.join(process.cwd(), "product_data/categories_rows(in).csv"), "utf-8");
  const productsCsv = fs.readFileSync(path.join(process.cwd(), "product_data/products_rows 1(in).csv"), "utf-8");
  const variantsCsv = fs.readFileSync(path.join(process.cwd(), "product_data/product_variants_rows(in).csv"), "utf-8");
  const couponsCsv = fs.readFileSync(path.join(process.cwd(), "../coupons_rows.csv"), "utf-8");

  const categoriesData = parse(categoriesCsv, { columns: true, skip_empty_lines: true }) as any[];
  const productsData = parse(productsCsv, { columns: true, skip_empty_lines: true }) as any[];
  const variantsData = parse(variantsCsv, { columns: true, skip_empty_lines: true }) as any[];
  const couponsData = parse(couponsCsv, { columns: true, skip_empty_lines: true }) as any[];

  const categoryMapByOldId = new Map<string, string>();
  const categoryMapByName = new Map<string, string>();
  const productMapByOldId = new Map<string, string>();

// 2. Import Categories
  console.log("📁 Processing Categories...");
  for (const row of categoriesData) {
    const uuid = uuidv5(row.id, NAMESPACE);
    const slug = row.name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
    
    // Check if category with this slug exists
    const { data: existing } = await supabase.from("categories").select("id").eq("slug", slug).single();
    if (existing && existing.id !== uuid) {
        console.warn(`🔄 Warning: Category slug '${slug}' exists with different ID. Renaming old category.`);
        await supabase.from("categories").update({ slug: `${slug}-old` }).eq("id", existing.id);
    }

    const { error } = await supabase.from("categories").upsert({
      id: uuid,
      name: row.name,
      slug: slug,
      description: row.description || null,
      position: parseInt(row.position) || 0,
      is_visible: row.is_visible?.toLowerCase() === "true" || true,
    });

    if (error) console.error(`❌ Error importing category ${row.name}:`, error.message);
    else {
      categoryMapByOldId.set(row.id, uuid);
      categoryMapByName.set(row.name, uuid);
      console.log(`✅ Category: ${row.name}`);
    }
  }

  // 3. Import Products
  console.log("\n👕 Processing Products...");
  for (const row of productsData) {
    const uuid = uuidv5(row.id, NAMESPACE);
    
    // Resolve Category ID
    let categoryId = categoryMapByOldId.get(row.category_id);
    if (!categoryId) {
        // Try matching by name if ID fails (common in products CSV)
        categoryId = categoryMapByName.get(row.category_id);
    }

    const slug = row.name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

    // Fit Mapping
    let fit = row.fit?.toLowerCase();
    if (fit === "standard") fit = "classic";
    if (!["slim", "modern", "classic"].includes(fit)) {
        fit = "modern"; // Fallback
    }

    const { error } = await supabase.from("products").upsert({
      id: uuid,
      name: row.name,
      slug: slug || row.id.toLowerCase(),
      description: row.description || null,
      category_id: categoryId || null,
      base_price: parseFloat(row.base_price.replace(/,/g, "")) || 0,
      compare_at_price: row.compare_at_price ? parseFloat(row.compare_at_price.replace(/,/g, "")) : null,
      cost_per_item: row.cost_per_item ? parseFloat(row.cost_per_item.replace(/,/g, "")) : null,
      fabric: row.fabric || null,
      fit: fit,
      color: row.color || null,
      is_visible: row.is_visible?.toLowerCase() === "true" || true,
      is_featured: row.is_featured?.toLowerCase() === "true" || false,
    });

    if (error) console.error(`❌ Error importing product ${row.name}:`, error.message);
    else {
      productMapByOldId.set(row.id, uuid);
      console.log(`✅ Product: ${row.name}`);
    }
  }

  // 4. Import Variants
  console.log("\n📏 Processing Variants...");
  for (const row of variantsData) {
    const productUuid = productMapByOldId.get(row.id);
    const variantUuid = uuidv5(row.product_id, NAMESPACE);

    if (!productUuid) {
      console.warn(`⚠️ Warning: No parent product found for variant ${row.product_id} (Ref: ${row.id})`);
      continue;
    }

    const cleanPrice = row.price.replace(/[^\d.]/g, "");

    const { error } = await supabase.from("product_variants").upsert({
      id: variantUuid,
      product_id: productUuid,
      sku: row.sku || row.product_id,
      size: row.size || null,
      stock_quantity: parseInt(row.stock_quantity) || 0,
      price: parseFloat(cleanPrice) || 0,
      compare_at_price: row.compare_at_price ? parseFloat(row.compare_at_price.replace(/[^\d.]/g, "")) : null,
      is_out_of_stock: parseInt(row.stock_quantity) <= 0,
    });

    if (error) console.error(`❌ Error importing variant ${row.product_id}:`, error.message);
    else console.log(`✅ Variant: ${row.product_id} (${row.size})`);
  }

  // 5. Import Coupons
  console.log("\n🎟️ Processing Coupons...");
  for (const row of couponsData) {
    const { error } = await supabase.from("coupons").upsert({
      id: row.id,
      code: row.code,
      type: row.type,
      value: parseFloat(row.value),
      min_purchase_amount: row.min_purchase_amount ? parseFloat(row.min_purchase_amount) : 0,
      max_uses: row.max_uses ? parseInt(row.max_uses) : null,
      current_uses: parseInt(row.current_uses) || 0,
      starts_at: row.starts_at || new Date().toISOString(),
      expires_at: row.expires_at || null,
      is_active: row.is_active?.toLowerCase() === "true" || true,
    });

    if (error) console.error(`❌ Error importing coupon ${row.code}:`, error.message);
    else console.log(`✅ Coupon: ${row.code}`);
  }

  console.log("\n✨ Migration Completed!");
}

importData();
