import { useEffect, useState } from 'react';
import { Link } from 'react-router';

interface DashboardUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  stageName: string | null;
  rolesComputed?: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<DashboardUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUsers(data);
        }
      })
      .catch(console.error);
  }, []);

  const filteredUsers = users.filter(u => {
    const search = searchTerm.toLowerCase();
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    const stageName = (u.stageName || '').toLowerCase();
    const email = u.email.toLowerCase();
    return fullName.includes(search) || stageName.includes(search) || email.includes(search);
  });

  return (
    <div style={{ padding: 'var(--spacing-8) 0', color: 'white' }}>
      <div className="flex-between" style={{ marginBottom: 'var(--spacing-12)', borderBottom: '1px solid var(--color-glass-border)', paddingBottom: 'var(--spacing-6)' }}>
        <h1 style={{ fontSize: '2.5rem', margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>Role Management</h1>
        <Link to="/admin" className="btn-secondary" style={{ textDecoration: 'none' }}>Back to Hub</Link>
      </div>

      <div style={{ marginBottom: 'var(--spacing-6)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-4)' }}>User Management</h2>
        <input 
          type="search" 
          placeholder="Search users by name or email..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="glass-panel"
          style={{ width: '100%', maxWidth: '400px', padding: 'var(--spacing-3)', color: 'white', border: '1px solid var(--color-glass-border)', background: 'rgba(255,255,255,0.05)' }}
        />
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-glass-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid var(--color-glass-border)' }}>
              <th style={{ padding: 'var(--spacing-4)', fontSize: '0.85rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Name</th>
              <th style={{ padding: 'var(--spacing-4)', fontSize: '0.85rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Email</th>
              <th style={{ padding: 'var(--spacing-4)', fontSize: '0.85rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Roles</th>
              <th style={{ padding: 'var(--spacing-4)', fontSize: '0.85rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Status</th>
              <th style={{ padding: 'var(--spacing-4)', fontSize: '0.85rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, idx) => {
              const displayName = user.stageName || `${user.firstName} ${user.lastName}`;
              const roles = user.rolesComputed || 'User';
              const statusText = user.isActive ? 'Active' : 'Inactive';
              
              return (
                <tr key={user.id} style={{ borderBottom: idx !== filteredUsers.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <td style={{ padding: 'var(--spacing-4)' }}>{displayName}</td>
                  <td style={{ padding: 'var(--spacing-4)', color: 'var(--color-text-secondary)' }}>{user.email}</td>
                  <td style={{ padding: 'var(--spacing-4)', color: 'var(--color-text-secondary)' }}>{roles}</td>
                  <td style={{ padding: 'var(--spacing-4)', color: 'var(--color-text-secondary)' }}>{statusText}</td>
                  <td style={{ padding: 'var(--spacing-4)' }}>
                    <button className="btn-primary" style={{ padding: '6px 16px', fontSize: '0.9rem', backgroundColor: 'var(--color-accent-primary)' }}>Edit</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        
        {filteredUsers.length === 0 && (
          <div style={{ padding: 'var(--spacing-8)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            No users found matching query.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
