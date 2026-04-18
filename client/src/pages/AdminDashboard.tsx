import { Link } from 'react-router';
import { Users, Mic2, Library, Package } from 'lucide-react';

const AdminDashboard = () => {

  const navCards = [
    {
      title: 'Users & Roles',
      description: 'Temporal identity mapping, permission scaffolding, and administrative core roles management.',
      path: '/admin/users',
      icon: <Users size={48} strokeWidth={1.5} color="var(--color-accent-primary)" />
    },
    {
      title: 'Artist Registry',
      description: 'Formalize Public Brands, provision dynamic group members, and restructure existing relationships.',
      path: '/admin/artists',
      icon: <Mic2 size={48} strokeWidth={1.5} color="var(--color-accent-secondary)" />
    },
    {
      title: 'Products & Storefront',
      description: 'Manage tangible physical items and lossless digital masters actively serving down the storefront pipeline.',
      path: '/admin/products',
      icon: <Library size={48} strokeWidth={1.5} color="var(--color-success)" />
    },
    {
      title: 'Order Fulfillment',
      description: 'Reconcile digital distribution rights and mark physical vinyl shipments as successfully shipped securely.',
      path: '/admin/orders',
      icon: <Package size={48} strokeWidth={1.5} color="var(--color-accent-terracotta)" />
    }
  ];

  return (
    <div style={{ padding: 'var(--spacing-8) 0', color: 'white' }}>
      
      <div className="flex-between" style={{ marginBottom: 'var(--spacing-12)', borderBottom: '1px solid var(--color-glass-border)', paddingBottom: 'var(--spacing-6)' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>Admin Protocol</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-2)' }}>Central Command Framework</p>
        </div>
        <Link to="/" className="btn-secondary" style={{ textDecoration: 'none' }}>Back to Store</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-6)' }}>
        {navCards.map((card, idx) => (
          <Link 
            key={idx} 
            to={card.path} 
            className="glass-panel" 
            style={{ 
              textDecoration: 'none', 
              color: 'white', 
              padding: 'var(--spacing-8)', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              textAlign: 'center',
              gap: 'var(--spacing-4)',
              transition: 'transform 0.2s, background 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = 'rgba(0,0,0,0.2)';
            }}
          >
            <div style={{ padding: 'var(--spacing-4)', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-full)' }}>
              {card.icon}
            </div>
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{card.title}</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              {card.description}
            </p>
          </Link>
        ))}
      </div>

    </div>
  );
};

export default AdminDashboard;
