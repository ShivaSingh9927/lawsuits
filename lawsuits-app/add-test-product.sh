#!/bin/bash

# 1. Manually extract variables from .env to avoid bash expansion issues
SUPABASE_URL=$(grep "^NEXT_PUBLIC_SUPABASE_URL=" .env | cut -d'=' -f2)
SUPABASE_KEY=$(grep "^SUPABASE_SERVICE_ROLE_KEY=" .env | cut -d'=' -f2)

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
  echo "❌ Error: Could not find credentials in .env"
  exit 1
fi

echo "🚀 Adding 'Love to Develop' ₹1 test product..."

CATEGORY_ID="a1b2c3d4-0001-0001-0001-000000000003" # Accessories

# --- Step 1: Create Product ---
PRODUCT_DATA=$(cat <<EOF
{
  "name": "Love to Develop",
  "slug": "love-to-develop",
  "description": "A special test product for payment gateway verification.",
  "category_id": "$CATEGORY_ID",
  "base_price": 1,
  "is_visible": true,
  "is_featured": true
}
EOF
)

RESPONSE=$(curl -s -X POST "$SUPABASE_URL/rest/v1/products" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d "$PRODUCT_DATA" \
  --connect-timeout 5 \
  --max-time 10)

# Extract ID using a simple regex (more compatible than grep -oP)
PRODUCT_ID=$(echo "$RESPONSE" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')

if [ -z "$PRODUCT_ID" ]; then
  # Check if already exists
  PRODUCT_ID=$(curl -s "$SUPABASE_URL/rest/v1/products?slug=eq.love-to-develop&select=id" \
    -H "apikey: $SUPABASE_KEY" \
    -H "Authorization: Bearer $SUPABASE_KEY" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')
fi

if [ -z "$PRODUCT_ID" ]; then
    echo "❌ Could not find/create product"
    echo "DEBUG: $RESPONSE"
    exit 1
fi

echo "✅ Product Ready: $PRODUCT_ID"

# --- Step 2: Create Variant ---
VARIANT_DATA=$(cat <<EOF
{
  "product_id": "$PRODUCT_ID",
  "sku": "LOVE-DEV-TEST-10",
  "size": "One Size",
  "stock_quantity": 9999,
  "price": 1,
  "is_out_of_stock": false
}
EOF
)

curl -s -X POST "$SUPABASE_URL/rest/v1/product_variants" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -d "$VARIANT_DATA" > /dev/null

echo "✅ Variant added."

# --- Step 3: Add Image ---
IMAGE_DATA=$(cat <<EOF
{
  "product_id": "$PRODUCT_ID",
  "url": "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2070&auto=format&fit=crop",
  "alt": "Love to Develop",
  "is_primary": true,
  "position": 0
}
EOF
)

curl -s -X POST "$SUPABASE_URL/rest/v1/product_images" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -d "$IMAGE_DATA" > /dev/null

echo "✅ Image added."
echo -e "\n✨ ALL DONE! Check your site for the ₹1 product."
