import { db } from '../src/db/db.js';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Dropping public schema to cleanly wipe structure for Temporal Pivot...');
  try {
    await db.execute(sql`DROP SCHEMA public CASCADE`);
    await db.execute(sql`CREATE SCHEMA public`);
    await db.execute(sql`GRANT ALL ON SCHEMA public TO postgres`);
    await db.execute(sql`GRANT ALL ON SCHEMA public TO public`);
    console.log('Schema dropped and recreated successfully.');
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}

main();
