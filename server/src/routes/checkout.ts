import { Router } from 'express';
import Stripe from 'stripe';
import { db } from '../db/db.js';
import { products, songs, orders, orderItems } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia',
});

export const checkoutRouter = Router();
export const webhookRouter = Router();

// Webhook explicitly parsing authentic Stripe Events natively preserving Raw structural bodies
webhookRouter.post('/webhook', (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig as string, process.env.STRIPE_WEBHOOK_SECRET || '');
  } catch (err: any) {
    console.error('Webhook signature verification failed.', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Mechanically explicitly update the Native Architecture Order
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.architectureOrderId;
    
    if (orderId) {
      db.update(orders)
        .set({ status: 'paid', stripeSessionId: session.id })
        .where(eq(orders.id, Number(orderId)))
        .then(() => console.log(`[Stripe Webhook] Order ${orderId} definitively paid.`))
        .catch(e => console.error('Failed updating DB explicitly', e));
    }
  }

  res.send();
});

// Trigger explicitly from CartDrawer.tsx
checkoutRouter.post('/create-session', async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || items.length === 0) {
      res.status(400).json({ error: 'Cart is structurally empty' });
      return;
    }

    const lineItems: any[] = [];

    // Validate explicitly structurally ensuring prices are NOT manipulated by the client
    for (const item of items) {
      if (item.songId) {
        // It's a digital track explicitly
        const [song] = await db.select().from(songs).where(eq(songs.id, item.songId));
        if (song) {
          lineItems.push({
            price_data: {
              currency: 'usd',
              product_data: { name: song.title },
              unit_amount: Math.round(Number(song.price || 0.99) * 100),
            },
            quantity: item.quantity,
          });
        }
      } else if (item.productId) {
        // It's a physical product / master album implicitly
        const [product] = await db.select().from(products).where(eq(products.id, item.productId));
        if (product) {
          lineItems.push({
            price_data: {
              currency: 'usd',
              product_data: { name: product.title },
              unit_amount: Math.round(Number(product.price) * 100),
            },
            quantity: item.quantity,
          });
        }
      }
    }

    if (lineItems.length === 0) {
      res.status(400).json({ error: 'No structurally valid products found in cart matching database' });
      return;
    }

    // CREATE PENDING ORDER STRUCTURE NATIVELY
    let totalCents = 0;
    lineItems.forEach(li => { totalCents += (li.price_data.unit_amount * li.quantity); });
    
    // Check if user is legally authenticated (mocking for now via auth header or explicit payload?) 
    // For now, guest checkout inherently nulls customerId smoothly
    const [pendingOrder] = await db.insert(orders).values({
      status: 'pending',
      totalAmount: (totalCents / 100).toFixed(2),
    }).returning();

    // Persist native OrderItems relationally dynamically
    for (const item of items) {
       let unitPrice = 0;
       if (item.songId) {
         const [s] = await db.select().from(songs).where(eq(songs.id, item.songId));
         if (s) unitPrice = Number(s.price || 0.99);
       } else if (item.productId) {
         const [p] = await db.select().from(products).where(eq(products.id, item.productId));
         if (p) unitPrice = Number(p.price);
       }

       if (unitPrice > 0) {
         await db.insert(orderItems).values({
           orderId: pendingOrder.id,
           productId: item.productId || null,
           songId: item.songId || null,
           quantity: item.quantity,
           priceAtTime: unitPrice.toFixed(2)
         });
       }
    }

    // Scaffold checkout configuration bridging the native Order cleanly
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `http://localhost:5173/cart?success=true`,
      cancel_url: `http://localhost:5173/cart?canceled=true`,
      metadata: {
        architectureOrderId: pendingOrder.id.toString()
      }
    });

    res.json({ url: session.url });
  } catch (err: any) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: err.message });
  }
});
