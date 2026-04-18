import { useEffect, useState } from 'react';
import { Link } from 'react-router';
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

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem, openDrawer } = useCartStore();

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          setProducts([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <main className="container">
      <section className="hero-gradient" aria-labelledby="hero-title" style={{ 
        padding: 'var(--spacing-24) 0', 
        textAlign: 'center',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-glass-border)',
        boxShadow: 'var(--shadow-glass)',
        marginBottom: 'var(--spacing-16)'
      }}>
        <div style={{ position: 'relative', zIndex: 1, padding: '0 var(--spacing-4)' }}>
          <h1 id="hero-title" className="hero-responsive-title" style={{ fontSize: '4.5rem', marginBottom: 'var(--spacing-4)', lineHeight: 1.1 }}>
            Artistry <span style={{ color: 'var(--color-accent-primary)', fontStyle: 'italic' }}>Defined.</span>
          </h1>
          <p className="hero-responsive-text" style={{ color: 'var(--color-text-secondary)', fontSize: '1.25rem', maxWidth: '650px', margin: '0 auto var(--spacing-8) auto' }}>
            Discover exclusive music, limited merchandise, and premium art strictly curated from independent creators.
          </p>
          <Link to="/collections" className="btn-primary" style={{ display: 'inline-block' }}>Explore the Collection</Link>
        </div>
      </section>

      <section aria-labelledby="featured-title" style={{ marginBottom: 'var(--spacing-16)' }}>
        {/* Admin Navigation Portal (Mock Auth bypass for sandbox) */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-8)' }}>
          <Link to="/admin/add-product" className="btn-primary" style={{ backgroundColor: 'var(--color-accent-primary)', color: 'white', textDecoration: 'none' }}>+ Add Product</Link>
          <Link to="/admin" className="btn-primary" style={{ textDecoration: 'none' }}>Manage Products</Link>
          <Link to="/admin" className="btn-primary" style={{ textDecoration: 'none' }}>Manage Songs</Link>
        </div>

        <div className="flex-between" style={{ marginBottom: 'var(--spacing-8)' }}>
          <h2 id="featured-title" style={{ fontSize: '2.5rem', margin: 0 }}>Featured Releases</h2>
        </div>
        
        {loading ? (
          <div className="flex-center" style={{ height: '300px' }}>
            <p style={{ fontSize: '1.5rem', color: 'var(--color-text-secondary)', animation: 'pulse-opacity 2s ease-in-out infinite' }}>Loading master tracks...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--spacing-8)' }}>
             {products.map(product => (
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
                     <h3 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-2)' }}>{product.title}</h3>
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
      </section>
    </main>
  );
};

export default Home;
