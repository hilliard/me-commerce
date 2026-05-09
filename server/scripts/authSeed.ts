import { db } from '../src/db/db.js';
import { humans, customers } from '../src/db/schema.js';

async function authSeed() {
  console.log('Seeding Administrative Role System...');
  try {
    // 1. Create native base Human
    const [human] = await db.insert(humans).values({
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@me-commerce.local'
    }).returning();

    // 2. Attach Mock Authentication map to Customer table explicitly
    await db.insert(customers).values({
      humanId: human.id,
      passwordHash: 'mock-hash-123', // The raw password is 'test1234' mapped physically in authRouter
      isAdmin: true
    });

    console.log('✅ Admin Authenticated Profile generated: admin@me-commerce.local');
    console.log('Password rigidly strictly forced to: test1234');

  } catch (err: any) {
    if (err.message.includes('unique constraint')) {
      console.log('Admin already explicitly resides dynamically within database schema!');
    } else {
      console.error('Seeding failed deeply out-of-band:', err);
    }
  }
  process.exit(0);
}

authSeed();
