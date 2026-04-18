import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../src/db/schema.js';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function updateImages() {
  console.log('Updating images...');
  try {
    // Stevie Wonder - Hotter Than July
    await db.update(schema.products)
      .set({ image: '/album1.jpg' })
      .where(eq(schema.products.handle, 'hotter-than-july-vinyl'));
      
    // Cameo - Word Up!
    await db.update(schema.products)
      .set({ image: '/album2.jpg' })
      .where(eq(schema.products.handle, 'word-up-cassette'));
      
    console.log('Images updated successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Update failed:', err);
    process.exit(1);
  }
}

updateImages();
