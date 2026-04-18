The checkout flow has two halves: what the customer sees, and what happens on the server. Here's the full sequence.

1. Customer clicks "Proceed to Payment" on your checkout page. Your frontend sends the cart items (product name, price, quantity) to a server function.

2. Server creates a Stripe Checkout Session with line items, shipping options (free standard, $9.99 express, $24.99 overnight), automatic tax calculation, and redirect URLs (success and cancel).

3. Customer is redirected to Stripe. Stripe's hosted checkout handles everything: credit card form, Apple Pay, Google Pay, shipping address, shipping method selection, tax calculation. You don't build any of this.

4. After payment, Stripe redirects back to your success page. But don't rely on this redirect to create the order. The customer might close the browser.

5. Stripe sends a webhook to your server. This is the reliable signal. Your webhook handler verifies the signature, saves the order to the database, and sends a confirmation email via Resend. The webhook is what makes the system trustworthy.