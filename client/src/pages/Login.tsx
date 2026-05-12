import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../store/authStore';
import { ShieldAlert } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Authentication completely failed explicitly');
        return;
      }

      setAuth(data.token, data.user);
      navigate('/admin');
    } catch(err: any) {
      setError('System completely unreachable structurally');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'white' }}>
      <form onSubmit={handleLogin} className="glass-panel" style={{ padding: 'var(--spacing-8)', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-2)' }}>
          <div style={{ background: 'rgba(255,100,100,0.2)', padding: 'var(--spacing-4)', borderRadius: '50%' }}>
            <ShieldAlert size={32} color="var(--color-accent-terracotta)" />
          </div>
          <h1 style={{ margin: 'var(--spacing-2) 0 0 0', fontSize: '1.8rem' }}>Admin Gateway</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>Log in directly to structurally access the physical framework</p>
        </div>

        {error && (
          <div style={{ padding: 'var(--spacing-3)', background: 'rgba(255,50,50,0.1)', color: 'var(--color-accent-terracotta)', border: '1px solid rgba(255,50,50,0.3)', borderRadius: '4px', fontSize: '0.9rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
          <label style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Email</label>
          <input 
            type="email" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="admin@me-commerce.local"
            style={{ padding: 'var(--spacing-3)', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-glass-border)', color: 'white', borderRadius: '4px' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
          <label style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Password</label>
          <input 
            type="password" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            style={{ padding: 'var(--spacing-3)', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-glass-border)', color: 'white', borderRadius: '4px' }}
          />
        </div>

        <button type="submit" className="btn-primary" style={{ padding: 'var(--spacing-4)', fontSize: '1.1rem', marginTop: 'var(--spacing-2)' }}>
          Authenticate Securely
        </button>
      </form>
    </div>
  );
}
