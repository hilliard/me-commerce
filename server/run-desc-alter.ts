import { db } from './src/db/db.js';
import { sql } from 'drizzle-orm';
db.execute(sql`ALTER TABLE products ADD COLUMN description TEXT`).then(() => {
  console.log('success');
  process.exit(0);
}).catch(console.error);
