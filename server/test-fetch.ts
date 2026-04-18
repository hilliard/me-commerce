import { db } from './src/db/db.js';
import { products } from './src/db/schema.js';

async function test() {
  try {
    const res = await db.select().from(products);
    console.log("Success:", res);
  } catch(e: any) {
    console.log("Error:", e.message, JSON.stringify(e));
  }
}
test();
