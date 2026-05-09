import { db } from '../src/db/db.js';
import { humans, customers } from '../src/db/schema.js';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';

async function run() {
  // Check if admin already exists (a human with admin customer entry)
  // Try to find a human with admin email first, else create anew
  const adminEmail = 'admin@me-commerce.local';

  // Find existing human by email
  const existingHumans = await db.select().from(humans).where(eq(humans.email, adminEmail)).limit(1);
  let humanId: number | null = null;
  if (existingHumans && existingHumans.length > 0) {
    humanId = (existingHumans[0] as any).id;
  } else {
    // Create admin human entry
    const inserted = await db.insert(humans).values({
      firstName: 'Admin',
      lastName: 'Me',
      email: adminEmail,
      isActive: true,
      createdAt: new Date(),
    }).returning({ id: humans.id });
    humanId = (inserted && inserted[0] ? (inserted[0] as any).id : null) ?? null;
  }

  if (!humanId) {
    console.error('Failed to create or locate admin human. Aborting seed.');
    process.exit(1);
  }

  // Create admin customer row if not exists
  const existingCustomer = await db.select().from(customers).where(eq(customers.humanId, humanId)).limit(1);
  if (existingCustomer && existingCustomer.length > 0) {
    console.log('Admin customer already exists for humanId', humanId);
    process.exit(0);
  }

  const passwordPlain = 'admin123';
  const passwordHash = crypto.createHash('sha256').update(passwordPlain).digest('hex');

  await db.insert(customers).values({
    humanId,
    passwordHash,
    isAdmin: true,
  });

  console.log('Admin seed complete. Admin email:', adminEmail);
  process.exit(0);
}

run().catch((err) => {
  console.error('Admin seed failed', err);
  process.exit(1);
});
