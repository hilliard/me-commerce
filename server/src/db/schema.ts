import { pgTable, serial, text, timestamp, boolean, integer, numeric } from "drizzle-orm/pg-core";

export const humans = pgTable('humans', {
  id: serial('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').unique().notNull(), // flattened for simplicity here, tracking temporal emails is complex without full RBAC
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const customers = pgTable('customers', {
  humanId: integer('human_id').references(() => humans.id).primaryKey(),
  passwordHash: text('password_hash').notNull(),
});

export const artists = pgTable('artists', {
  id: serial('id').primaryKey(),
  stageName: text('stage_name').unique().notNull(),
  bio: text('bio'),
  website: text('website'),
  debutYear: integer('debut_year'),
  isGroup: boolean('is_group').default(false),
});

export const artistMembers = pgTable('artist_members', {
  id: serial('id').primaryKey(),
  artistId: integer('artist_id').references(() => artists.id, { onDelete: 'cascade' }).notNull(),
  humanId: integer('human_id').references(() => humans.id, { onDelete: 'cascade' }).notNull(),
  role: text('role'),
  joinedDate: timestamp('joined_date').defaultNow(),
});

export const artistManagers = pgTable('artist_managers', {
  id: serial('id').primaryKey(),
  artistId: integer('artist_id').references(() => artists.id, { onDelete: 'cascade' }).notNull(),
  humanId: integer('human_id').references(() => humans.id, { onDelete: 'cascade' }).notNull(),
  effectiveFrom: timestamp('effective_from').defaultNow(),
  effectiveTo: timestamp('effective_to'),
});

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  productType: text('product_type').default('album'),
  handle: text('handle').unique().notNull(),
  artistId: integer('artist_id').references(() => artists.id),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  image: text('image'),
  year: integer('year'),
  genre: text('genre'),
  stock: integer('stock').default(0),
  description: text('description')
});

export const songs = pgTable('songs', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  artistId: integer('artist_id').references(() => artists.id, { onDelete: 'cascade' }),
  durationSeconds: integer('duration_seconds'),
  pathUrl: text('path_url').notNull(), // points explicitly perfectly to static '/media_assets/...'
  isrc: text('isrc').unique(),
  bpm: integer('bpm'),
  isExplicit: boolean('is_explicit').default(false),
  genre: text('genre'),
  fileFormat: text('file_format').default('mp3'),
  price: numeric('price', { precision: 10, scale: 2 }).default('0.99'),
  featuredArtist: text('featured_artist'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const productSongs = pgTable('product_songs', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  songId: integer('song_id').references(() => songs.id, { onDelete: 'cascade' }).notNull(),
  trackOrder: integer('track_order').default(1),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id').references(() => customers.humanId),
  stripeSessionId: text('stripe_session_id'),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }),
  status: text('status'), // pending, paid, shipped
  createdAt: timestamp('created_at').defaultNow(),
});

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  productId: integer('product_id').references(() => products.id),
  songId: integer('song_id').references(() => songs.id),
  quantity: integer('quantity').notNull(),
  priceAtTime: numeric('price_at_time', { precision: 10, scale: 2 }).notNull(),
});

export const coupons = pgTable('coupons', {
  id: serial('id').primaryKey(),
  code: text('code').unique().notNull(),
  description: text('description'),
  discountType: text('discount_type').notNull(), // percentage, fixed_amount
  discountValue: numeric('discount_value', { precision: 10, scale: 2 }).notNull(),
  minPurchaseAmount: numeric('min_purchase_amount', { precision: 10, scale: 2 }).default('0'),
  maxDiscountAmount: numeric('max_discount_amount', { precision: 10, scale: 2 }),
  creatorType: text('creator_type').notNull(), // admin, vendor, artist
  creatorId: integer('creator_id').references(() => humans.id).notNull(),
  validFrom: timestamp('valid_from').defaultNow(),
  validUntil: timestamp('valid_until'),
  maxUses: integer('max_uses'),
  timesUsed: integer('times_used').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const orderCoupons = pgTable('order_coupons', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  couponId: integer('coupon_id').references(() => coupons.id, { onDelete: 'restrict' }).notNull(),
  discountApplied: numeric('discount_applied', { precision: 10, scale: 2 }).notNull(),
  appliedAt: timestamp('applied_at').defaultNow(),
});
