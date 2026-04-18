import { useEffect, useState } from 'react';
import { Link } from 'react-router';

interface ProductStat {
  id: number;
  title: string;
  artistName: string;
  price: string;
  stock: number;
  productType: string;
}

const AdminProducts = () => {
  const [products, setProducts] = useState<ProductStat[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products/stats');
      if (res.ok) {
        setProducts(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div style={{ padding: 'var(--spacing-8) 0', color: 'white' }}>
      <div className="flex-between" style={{ marginBottom: 'var(--spacing-12)', borderBottom: '1px solid var(--color-glass-border)', paddingBottom: 'var(--spacing-6)' }}>
        <h1 style={{ fontSize: '2.5rem', margin: 0, letterSpacing: '-0.5px' }}>Admin Products</h1>
        <div style={{ display: 'flex', gap: 'var(--spacing-4)', alignItems: 'center' }}>
           <Link to="/admin/add-product" className="btn-primary" style={{ textDecoration: 'none', backgroundColor: 'var(--color-success)', color: 'white', padding: 'var(--spacing-2) var(--spacing-4)' }}>+ Target New Addition</Link>
           <Link to="/admin" className="btn-secondary" style={{ textDecoration: 'none' }}>Back to Hub</Link>
        </div>
      </div>

      <div>
        <h2 style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-4)' }}>Product Catalog</h2>
        {loading ? (
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading catalog matrix...</p>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-glass-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid var(--color-glass-border)' }}>
                  <th style={{ padding: 'var(--spacing-4)', fontSize: '0.85rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Title</th>
                  <th style={{ padding: 'var(--spacing-4)', fontSize: '0.85rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Brand Mapping</th>
                  <th style={{ padding: 'var(--spacing-4)', fontSize: '0.85rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Type</th>
                  <th style={{ padding: 'var(--spacing-4)', fontSize: '0.85rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Price</th>
                  <th style={{ padding: 'var(--spacing-4)', fontSize: '0.85rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Stock</th>
                  <th style={{ padding: 'var(--spacing-4)', fontSize: '0.85rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Admin Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 'var(--spacing-6)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                      No robust products actively seeded.
                    </td>
                  </tr>
                ) : (
                  products.map((product, idx) => (
                    <tr key={product.id} style={{ borderBottom: idx !== products.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                      <td style={{ padding: 'var(--spacing-4)' }}>{product.title}</td>
                      <td style={{ padding: 'var(--spacing-4)', color: 'var(--color-accent-secondary)' }}>
                        {product.artistName}
                      </td>
                      <td style={{ padding: 'var(--spacing-4)', color: 'var(--color-text-secondary)' }}>
                        <span style={{ textTransform: 'capitalize', fontSize: '0.9rem' }}>{product.productType}</span>
                      </td>
                      <td style={{ padding: 'var(--spacing-4)', color: 'var(--color-accent-primary)' }}>
                        ${product.price}
                      </td>
                      <td style={{ padding: 'var(--spacing-4)', color: 'var(--color-text-secondary)' }}>
                        {product.stock} Units
                      </td>
                      <td style={{ padding: 'var(--spacing-4)', display: 'flex', gap: 'var(--spacing-2)' }}>
                        <Link 
                          to={`/admin/products/edit/${product.id}`}
                          className="btn-primary" 
                          style={{ padding: '4px 12px', fontSize: '0.85rem', backgroundColor: 'var(--color-accent-primary)', border: 'none', color: 'white', textDecoration: 'none' }}
                        >
                          Modify
                        </Link>
                        <button 
                          type="button"
                          className="btn-secondary" 
                          style={{ padding: '4px 12px', fontSize: '0.85rem', color: 'var(--color-error)' }}
                          onClick={() => alert('Future Implementation: Destructive Purge Node')}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
