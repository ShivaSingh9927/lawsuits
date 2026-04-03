const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(url, key);

async function setup() {
  console.log('🔍 Checking Supabase Storage...');
  
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.error('❌ Error listing buckets:', listError);
    return;
  }

  const exists = buckets.find(b => b.id === 'product-images');
  if (exists) {
    console.log('✅ Bucket "product-images" already exists.');
  } else {
    console.log('🆕 Creating "product-images" bucket...');
    const { data, error } = await supabase.storage.createBucket('product-images', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/jpg']
    });
    if (error) {
      console.error('❌ Error creating bucket:', error);
    } else {
      console.log('✅ Bucket created successfully.');
    }
  }
}

setup();
