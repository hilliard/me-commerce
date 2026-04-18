import { db } from './src/db/db.js';
import { sql } from 'drizzle-orm';
async function run() {
  try {
    await db.execute(sql`
      DELETE FROM "artists" a
      USING "artists" b
      WHERE a.stage_name = b.stage_name 
      AND a.human_id > b.human_id;
    `);
    await db.execute(sql`ALTER TABLE "artists" ADD CONSTRAINT "artists_stage_name_unique" UNIQUE("stage_name")`);
    console.log("Applied manually");
  } catch (e) { 
    console.error(e); 
  }
  process.exit(0);
}
run();
