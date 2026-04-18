import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ShoppingBag, Search, AudioLines } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

const Navbar = () => {
  const { getCartCount, openDrawer } = useCartStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const count = getCartCount();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/collections?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="glass-panel" style={{ 
      position: 'sticky', 
      top: '1rem', 
      zIndex: 100, 
      padding: 'var(--spacing-4) var(--spacing-6)',
      margin: '0 auto',
      maxWidth: '1280px',
      borderRadius: 'var(--radius-full)'
    }}>
      <div className="flex-between">
        
        {/* User Greet / Logo Alignment */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-6)' }}>
           <Link to="/" style={{ color: 'var(--color-text-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
             <div style={{ background: 'var(--color-accent-primary)', width: '32px', height: '32px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
               <AudioLines size={20} />
             </div>
             <h2 className="desktop-only" style={{ margin: 0, fontSize: '1.5rem', letterSpacing: '-0.5px' }}>Me-Commerce</h2>
           </Link>
           
          {isAuthenticated && (
             <span style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', fontWeight: 500, paddingLeft: 'var(--spacing-2)', borderLeft: '1px solid var(--color-glass-border)' }}>Hello, {user?.firstName}!</span>
          )}
        </div>
        
        {/* Navigation Core */}
        <div className="flex-center" style={{ gap: 'var(--spacing-8)' }}>
          <button 
            aria-label={`Shopping Cart with ${count} items`}
            title="Cart" 
            onClick={openDrawer} 
            style={{ position: 'relative', background: 'transparent', border: 'none', padding: 0, color: 'var(--color-text-primary)', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '4px' }}
            onMouseOver={e => e.currentTarget.style.color = 'var(--color-accent-primary)'} 
            onMouseOut={e => e.currentTarget.style.color = 'var(--color-text-primary)'}
          >
            <ShoppingBag size={22} />
            {count > 0 && <span style={{ color: 'var(--color-accent-primary)', fontWeight: 600 }}>{count}</span>}
          </button>
            
          <Link to="/collections" style={{ fontWeight: 500, fontSize: '1.0rem', textDecoration: 'none', color: 'var(--color-text-primary)' }}>Shop Songs</Link>

          {/* Admin Specific Features */}
          {isAuthenticated && user?.isAdmin && (
            <>
              <Link to="/admin" style={{ fontWeight: 500, fontSize: '1.0rem', textDecoration: 'none', color: 'var(--color-text-primary)' }}>Admin</Link>
              <Link to="/admin/artists" style={{ fontWeight: 500, fontSize: '1.0rem', textDecoration: 'none', color: 'var(--color-text-primary)' }}>Admin Artists</Link>
            </>
          )}

          {isAuthenticated && (
            <button 
              onClick={logout} 
              style={{ padding: 'var(--spacing-2) var(--spacing-4)', backgroundColor: 'var(--color-accent-primary)', color: 'white', borderRadius: 'var(--radius-sm)', border: 'none', fontWeight: 600, cursor: 'pointer' }}
            >
              Log out
            </button>
          )}

          {/* Interactive Search Tool */}
          <form onSubmit={handleSearch} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input 
              type="search" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-panel"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--color-glass-border)',
                padding: 'var(--spacing-2) var(--spacing-4)',
                paddingLeft: 'var(--spacing-8)',
                color: 'white',
                borderRadius: 'var(--radius-md)',
                outline: 'none',
                width: '200px'
              }}
            />
            <button type="submit" style={{ position: 'absolute', left: '10px', background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', padding: 0, display: 'flex' }}>
              <Search size={16} />
            </button>
          </form>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
