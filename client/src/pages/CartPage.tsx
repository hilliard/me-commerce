import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router';
import { useCartStore } from '../store/cartStore';
import { CheckCircle, XCircle } from 'lucide-react';

const CartPage = () => {
  const [searchParams] = useSearchParams();
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');
  const { items, clearCart } = useCartStore();

  useEffect(() => {
    if (success) {
      clearCart();
    }
  }, [success, clearCart]);

  if (success) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh', flexDirection: 'column', textAlign: 'center', color: 'white', gap: 'var(--spacing-6)' }}>
        <CheckCircle size={64} color="var(--color-success)" />
        <h1 style={{ fontSize: '3rem', margin: 0 }}>Payment Successful!</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)' }}>
          Thank you for supporting the artist independently. Your transaction was processed securely.
        </p>
        <Link to="/collections" className="btn-primary" style={{ textDecoration: 'none', padding: 'var(--spacing-4) var(--spacing-8)' }}>
          Continue Exploring
        </Link>
      </div>
    );
  }

  if (canceled) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh', flexDirection: 'column', textAlign: 'center', color: 'white', gap: 'var(--spacing-6)' }}>
        <XCircle size={64} color="var(--color-accent-terracotta)" />
        <h1 style={{ fontSize: '3rem', margin: 0 }}>Checkout Canceled</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)' }}>
          Your payment session was closed. No charges were made.
        </p>
        <Link to="/collections" className="btn-secondary" style={{ textDecoration: 'none', padding: 'var(--spacing-4) var(--spacing-8)' }}>
          Return to Shop
        </Link>
      </div>
    );
  }

  // Fallback to minimal state (since real Cart is in Drawer)
  return (
    <div style={{ padding: 'var(--spacing-16) 0', color: 'white', textAlign: 'center' }}>
      <h1>Shopping Cart</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-8)' }}>
        {items.length === 0 ? 'Your cart is completely empty.' : `You have ${items.length} unique assets mapping in your drawer.`}
      </p>
      <Link to="/collections" className="btn-primary" style={{ textDecoration: 'none' }}>Back to Storefront</Link>
    </div>
  );
};

export default CartPage;
