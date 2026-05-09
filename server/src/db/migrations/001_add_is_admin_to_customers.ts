// Drizzle-kit friendly migration
// Adds is_admin to customers with a safe idempotent operation
export async function up(db: any): Promise<void> {
  await db.execute("ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false");
}

export async function down(db: any): Promise<void> {
  await db.execute("ALTER TABLE customers DROP COLUMN IF EXISTS is_admin");
}
