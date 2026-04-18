Build me an online store for Musicians and Artists called "Me-Commerce". This is a complete e-commerce storefront where customers can browse, search, add to cart, and buy products. The cart needs to be able to handle coupons and discounts, as well as loyalty points.

Because these are creative people, they need a creative store. So make it look like a real store someone would actually buy from.

Also because these are creative people, they need an 'Artists Page' or Website where they can showcase their work. This page will be a sub-domain of the main Artist/Musician standard website, and will have its own unique design and features. It will also have its own product catalog and collections.

The store needs:
- A product catalog stored in a database (Neon / Drizzle, or similar)
- Collections (categories) like "Albums & EPs", "Beanies & hats", "Singles & Downloads"
- Individual product pages with image, description, price, and "Add to Cart" button
- A shopping cart (slide-over drawer + dedicated page) persisted in localStorage
- Cart with quantity controls (increase, decrease, remove)
- Checkout flow using Stripe Checkout (hosted payment page) with automatic tax calculation
- Order confirmation emails via Resend after successful payment
- Product search
- Customer accounts with magic link login and order history
- An admin dashboard (restricted to my email) showing products, orders, and revenue

Pages I need:
- / (homepage with hero, value props, featured products)
- /collections (all collections)
- /collections/all (all products)
- /collections/:handle (single collection)
- /products/:handle (product detail)
- /cart (full cart page)
- /checkout (order summary, redirect to Stripe)
- /checkout/success (post-payment confirmation)
- /search (product search)
- /account (customer login + order history)
- /admin (admin dashboard)

Use a warm, earthy design theme (cream backgrounds, brown and terracotta accents, serif headings). The store should feel premium and handcrafted, not generic.

For payment processing, use Stripe Checkout Sessions. The flow: frontend sends cart items to a server function, the function creates a Stripe Checkout Session with line items and shipping options (free standard, $9.99 express, $24.99 overnight), and redirects the customer to Stripe's hosted checkout. After payment, Stripe sends a webhook that saves the order and sends a confirmation email.

Make it look like a real store someone would actually buy from.


Stack:

◌
React 18 with React Router 7 in SPA mode. Client-side rendering, file-based routing. No server-side rendering needed for a storefront with public data.
◌
TypeScript for the frontend.
◌
Neon / Drizzle for the database. Products, collections, and orders stored in tables with Row Level Security. Supabase Auth for customer magic link login. Supabase Storage for product images.

CONNECTION STRING =postgresql://neondb_owner:npg_TMQhcao9fp7s@ep-dawn-bar-akihelns-pooler.c-3.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

◌
Payment Processing: Stripe (Checkout Sessions & Webhook processing)
Stripe Checkout for payments. Hosted checkout page with automatic tax, shipping options, and card/Apple Pay/Google Pay support. Server functions create sessions and handle webhooks.

◌
Deno ?? (or whatever you want) for server-side logic. Three functions: create checkout session, retrieve session details, handle Stripe webhook.
◌
Transactional Emails: Resend API (Automated post-purchase receipts)
Resend for order confirmation emails. Triggered by the webhook after successful payment.
◌
Custom CSS with CSS variables (no Tailwind). A warm, earthy theme with Playfair Display for headings and Inter for body text.
◌
Implement E2E tests for the store. Use Playwright.
◌
It would be nice to be able to test with mock data for Stripe and Resend.

Add legal layers for privacy policy, terms of service, cookie policy and return policy.

Add github actions for CI/CD.


Other good options: Next.js or Astro for the frontend, Convex or Firebase for the database, Paddle or Lemon Squeezy for payments. The architecture is the same regardless of which services you choose.

 It would be nice to be able to devolop locally and then deploy to a live server. This would include a local  dev database and a live production database.  The live database would be Neon.  The local database would be postgresql.  The live server could be Vercel.  The local server  could be Deno.  The live server could be Railway.  The local server could be Deno.  The live server could be Render.  The local server would be Deno.  

 Deploy to test server, then to production server.  

