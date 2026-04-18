import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { db } from './db/db.js';
import { products } from './db/schema.js';
import { authRouter } from './routes/auth.js';
import { requireAuth, requireAdmin } from './middleware/auth.js';
import { adminRouter } from './routes/admin.js';
import { musicRouter } from './routes/music.js';
import Stripe from 'stripe';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'mock_secret_key', {
  apiVersion: '2025-02-24.acacia',
});

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Expose static media_assets mapping directly matching our architectural provisioning
app.use('/media_assets', express.static(path.join(__dirname, '../public/media_assets')));

app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/products', musicRouter); // Intercepts /api/products/:handle/tracks

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Basic Product Listing
app.get('/api/products', async (req, res) => {
  try {
    const allProducts = await db.select().from(products);
    res.json(allProducts);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch products', details: Object.getOwnPropertyNames(error).reduce((acc, key) => ({...acc, [key]: error[key]}), {}) });
  }
});

app.post('/api/checkout/create-session', async (req, res) => {
  const { items } = req.body;
  if (!items || items.length === 0) {
    res.status(400).json({ error: 'Cart is empty' });
    return;
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item: any) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.title,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `http://localhost:5173/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5173/cart`,
      shipping_options: [
        { shipping_rate_data: { type: 'fixed_amount', fixed_amount: { amount: 0, currency: 'usd' }, display_name: 'Free Standard Shipping', delivery_estimate: { minimum: { unit: 'business_day', value: 5 }, maximum: { unit: 'business_day', value: 7 } } } },
        { shipping_rate_data: { type: 'fixed_amount', fixed_amount: { amount: 999, currency: 'usd' }, display_name: 'Express Shipping', delivery_estimate: { minimum: { unit: 'business_day', value: 2 }, maximum: { unit: 'business_day', value: 3 } } } },
        { shipping_rate_data: { type: 'fixed_amount', fixed_amount: { amount: 2499, currency: 'usd' }, display_name: 'Overnight Shipping', delivery_estimate: { minimum: { unit: 'business_day', value: 1 }, maximum: { unit: 'business_day', value: 1 } } } }
      ]
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Admin Route Verification
app.get('/api/admin/dashboard', requireAuth, requireAdmin, (req, res) => {
  res.json({ message: 'Welcome to the Secure Admin Dashboard', data: { totalRevenue: 15400, uniqueCustomers: 42 } });
});

app.listen(port, () => {
  console.log(`Me-Commerce API is running on http://localhost:${port}`);
});
