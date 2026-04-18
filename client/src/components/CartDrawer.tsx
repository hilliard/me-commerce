import { useCartStore } from '../store/cartStore';

const CartDrawer = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { items, removeItem, updateQuantity, getCartTotal } = useCartStore();

  if (!isOpen) return null;

  return (
    <>
      <div 
        aria-hidden="true"
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(51, 38, 29, 0.5)', zIndex: 999 }}
        onClick={onClose}
      />
      <div 
        className="glass-panel" 
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        style={{ 
          position: 'fixed', top: 0, right: 0, bottom: 0, width: '400px', maxWidth: '100vw', zIndex: 1000, 
          padding: 'var(--spacing-6)', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg-primary)'
        }}
      >
        <div className="flex-between" style={{ marginBottom: 'var(--spacing-6)' }}>
          <h2 id="cart-drawer-title">Your Cart</h2>
          <button onClick={onClose} aria-label="Close cart drawer" className="btn-secondary" style={{ padding: '4px 8px', border: 'none' }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {items.length === 0 ? (
            <p style={{ color: 'var(--color-text-secondary)' }}>Your cart is surprisingly empty.</p>
          ) : (
            items.map(item => (
              <div key={item.productId} className="flex-between" style={{ marginBottom: 'var(--spacing-4)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--spacing-4)' }}>
                <div>
                  <strong style={{ display: 'block', marginBottom: 'var(--spacing-1)' }}>{item.title}</strong>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>${item.price} each</div>
                </div>
                <div className="flex-center" style={{ gap: 'var(--spacing-2)' }}>
                  <button aria-label="Decrease quantity" onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="btn-secondary" style={{ padding: '2px 8px' }}>-</button>
                  <span aria-live="polite" style={{ minWidth: '1.5rem', textAlign: 'center' }}>{item.quantity}</span>
                  <button aria-label="Increase quantity" onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="btn-secondary" style={{ padding: '2px 8px' }}>+</button>
                  <button aria-label={`Remove ${item.title} from cart`} onClick={() => removeItem(item.productId)} style={{ marginLeft: 'var(--spacing-2)', color: 'var(--color-accent-terracotta)', background: 'transparent', border: 'none', cursor: 'pointer' }}>✕</button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div style={{ marginTop: 'var(--spacing-6)', borderTop: '2px solid var(--color-border)', paddingTop: 'var(--spacing-4)' }}>
            <div className="flex-between" style={{ marginBottom: 'var(--spacing-4)', fontSize: '1.2rem' }}>
              <strong>Total</strong>
              <strong>${getCartTotal().toFixed(2)}</strong>
            </div>
            <button 
              className="btn-primary" 
              style={{ width: '100%', fontSize: '1.1rem', padding: 'var(--spacing-4)' }}
              onClick={async () => {
                try {
                  const res = await fetch('/api/checkout/create-session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ items })
                  });
                  const data = await res.json();
                  if (data.url) window.location.href = data.url;
                } catch (err) {
                  console.error('Checkout failed', err);
                }
              }}
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
