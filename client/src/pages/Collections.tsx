import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useCartStore } from '../store/cartStore';

interface Product {
  id: number;
  handle: string;
  title: string;
  artistId: number;
  price: string;
  image: string;
  description: string;
}

const Collections = () => {
  const [params] = useSearchParams();
  const rawSearch = params.get('search');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');
  const { addItem, openDrawer } = useCartStore();

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          if (rawSearch) {
             const filterStr = rawSearch.toLowerCase();
             const filtered = data.filter(p => 
               p.title.toLowerCase().includes(filterStr) || 
               (p.description && p.description.toLowerCase().includes(filterStr))
             );
             setProducts(filtered);
          } else {
             setProducts(data);
          }
        } else {
          setProducts([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [rawSearch]);

  return (
    <div style={{ padding: 'var(--spacing-8) 0' }}>
      <div className="flex-between" style={{ marginBottom: 'var(--spacing-8)' }}>
        <h1 style={{ fontSize: '3rem', margin: 0 }}>
           {rawSearch ? `Search Results for "${rawSearch}"` : "All Collections"}
        </h1>
      </div>

      {!rawSearch && (
        <div style={{ display: 'flex', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-8)', flexWrap: 'wrap' }}>
          {['All', 'Album', 'Single', 'Merch'].map((type) => (
            <button 
              key={type}
              onClick={() => setFilterType(type)}
              className={filterType === type ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: 'var(--spacing-2) var(--spacing-6)', borderRadius: 'var(--radius-full)' }}
            >
              {type}
            </button>
          ))}
        </div>
      )}
      
      {loading ? (
        <div className="flex-center" style={{ height: '300px' }}>
          <p style={{ fontSize: '1.5rem', color: 'var(--color-text-secondary)', animation: 'pulse-opacity 2s ease-in-out infinite' }}>Loading tracks...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="glass-panel flex-center" style={{ height: '300px', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
           <h3 style={{ fontSize: '1.5rem', color: 'var(--color-text-secondary)' }}>No matches found</h3>
        </div>
      ) : (
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--spacing-8)' }}>
            {products
              .filter(product => filterType === 'All' || product.productType?.toLowerCase() === filterType.toLowerCase() || (!product.productType && filterType === 'Album'))
              .map(product => (
              <div key={product.id} className="glass-panel product-card" style={{ padding: 'var(--spacing-4)' }}>
                <Link to={`/products/${product.handle}`} style={{ color: 'inherit', textDecoration: 'none', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <div className="product-image-container">
                    <div 
                      className="product-image"
                      style={{ 
                        backgroundImage: product.image ? `url(${product.image})` : 'none'
                      }}
                    >
                      {!product.image && <div className="flex-center" style={{ height: '100%', color: 'var(--color-text-secondary)', fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>Music File</div>}
                    </div>
                  </div>
                  <div style={{ padding: '0 var(--spacing-2)' }}>
                    <div className="flex-between">
                       <h3 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-2)' }}>{product.title}</h3>
                       <span style={{ fontSize: '0.8rem', color: 'var(--color-accent-secondary)', textTransform: 'uppercase' }}>{product.productType || 'Album'}</span>
                    </div>
                    <p style={{ color: 'var(--color-text-secondary)', margin: '0 0 var(--spacing-6) 0', fontSize: '1rem' }}>
                      {product.description?.substring(0, 80) || "No description provided."}...
                    </p>
                  </div>
                </Link>
                <div className="flex-between" style={{ marginTop: 'auto', padding: '0 var(--spacing-2) var(--spacing-2)' }}>
                  <strong style={{ fontSize: '1.4rem', color: 'var(--color-accent-primary)' }}>${Number(product.price).toFixed(2)}</strong>
                  <button 
                    className="btn-secondary" 
                    onClick={(e) => {
                      e.preventDefault();
                      addItem({ 
                        productId: product.id, 
                        handle: product.handle,
                        title: product.title, 
                        price: Number(product.price),
                        image: product.image
                      });
                      openDrawer();
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
         </div>
      )}
    </div>
  );
};

export default Collections;
