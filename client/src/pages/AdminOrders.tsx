import { useState, useEffect } from 'react';
import { PackageSearch, Mail } from 'lucide-react';
import { Link } from 'react-router';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch(e) {
      console.error('Failed retrieving orders', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: number, status: string) => {
    if (!confirm(`Mark Order #${orderId} specifically as ${status}?`)) return;
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (loading) {
    return <div style={{ color: 'white', padding: 'var(--spacing-8) 0' }}>Decrypting structural order map...</div>;
  }

  return (
    <div style={{ padding: 'var(--spacing-8) 0', color: 'white' }}>
      <div className="flex-between" style={{ marginBottom: 'var(--spacing-8)', borderBottom: '1px solid var(--color-glass-border)', paddingBottom: 'var(--spacing-6)' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', margin: 0 }}>Fulfillment Operations</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-2)' }}>Reconcile Shipments & Digital Mapping</p>
        </div>
        <Link to="/admin" className="btn-secondary" style={{ textDecoration: 'none' }}>Back to Dashboard</Link>
      </div>

      {orders.length === 0 ? (
        <p style={{ color: 'var(--color-text-secondary)' }}>No transactions physically provisioned natively yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
          {orders.map(o => (
            <div key={o.id} className="glass-panel" style={{ padding: 'var(--spacing-6)' }}>
              <div className="flex-between" style={{ marginBottom: 'var(--spacing-4)' }}>
                <div>
                  <h2 style={{ fontSize: '1.2rem', margin: '0 0 var(--spacing-2) 0' }}>Order #{o.id} <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 'normal' }}>| ${o.totalAmount}</span></h2>
                  <div style={{ display: 'flex', gap: 'var(--spacing-4)', alignItems: 'center' }}>
                    <span style={{
                      padding: '4px 8px', 
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      backgroundColor: 
                        o.status === 'paid' ? 'rgba(0, 255, 128, 0.2)' : 
                        o.status === 'pending' ? 'rgba(255, 255, 255, 0.1)' : 
                        'rgba(0, 150, 255, 0.2)',
                      color: 
                        o.status === 'paid' ? 'var(--color-success)' : 
                        o.status === 'pending' ? 'var(--color-text-secondary)' : 
                        'var(--color-accent-primary)'
                    }}>
                      {o.status}
                    </span>
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>{new Date(o.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                
                <div>
                  {o.status === 'paid' && (
                    <button 
                      className="btn-primary" 
                      onClick={() => handleStatusChange(o.id, 'shipped')}
                      style={{ padding: '8px 16px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <PackageSearch size={16} /> Mark as Shipped
                    </button>
                  )}
                  {o.status === 'shipped' && (
                    <span style={{ color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Mail size={16} /> Fulfillment Logged
                    </span>
                  )}
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: 'var(--spacing-4)' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: 'var(--spacing-2)', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Item</th>
                    <th style={{ padding: 'var(--spacing-2)', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Qty</th>
                    <th style={{ padding: 'var(--spacing-2)', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {o.items.map((item: any) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: 'var(--spacing-3)' }}>
                         {item.productTitle ? `${item.productTitle} (Physical Item)` : `${item.songTitle} (Digital Download)`}
                      </td>
                      <td style={{ padding: 'var(--spacing-3)' }}>{item.quantity}</td>
                      <td style={{ padding: 'var(--spacing-3)' }}>${item.priceAtTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
