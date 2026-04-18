import { db } from '../src/db/db';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Synchronizing order_items temporal schemas for standalone digital assets...');
  try {
    await db.execute(sql`ALTER TABLE order_items ALTER COLUMN product_id DROP NOT NULL;`);
    console.log('✅ Dropped constraints gracefully on product_id.');
  } catch(e: any) {
    console.log('Constraint may already be dropped:', e.message);
  }

  try {
    await db.execute(sql`ALTER TABLE order_items ADD COLUMN song_id INTEGER REFERENCES songs(id);`);
    console.log('✅ Safely appended song_id digital map reference.');
  } catch(e: any) {
    console.log('Column may already exist:', e.message);
  }

  console.log('Schema successfully aligned dynamically!');
  process.exit(0);
}

main();
