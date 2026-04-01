const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  connectionString: 'postgresql://postgres:9hXPSIli5ZMSs0md@db.qttwwneebgrepxtegvus.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    console.log('Connecting to Supabase...');
    await client.connect();
    console.log('Connected!');

    const sqlPath = path.join(__dirname, 'supabase/migrations/001_initial_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing schema...');
    await client.query(sql);
    console.log('Schema applied successfully!');

    // Test by listing tables
    const res = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log('\nTables created:');
    res.rows.forEach(row => console.log(`  - ${row.table_name}`));

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

main();
