import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';

export default function AdminEditArtist() {
  const { id } = useParams();
  
  const [artist, setArtist] = useState<any>(null);
  const [existingMembers, setExistingMembers] = useState<any[]>([]);
  
  const [newMembers, setNewMembers] = useState([{ id: Date.now(), firstName: '', lastName: '', email: '', role: '' }]);
  const [loading, setLoading] = useState(false);

  const fetchContext = async () => {
    try {
      const coreRes = await fetch(`/api/admin/artists/${id}/core`);
      const memRes = await fetch(`/api/admin/artists/${id}/members`);
      
      if (coreRes.ok) setArtist(await coreRes.json());
      if (memRes.ok) setExistingMembers(await memRes.json());
    } catch(e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchContext();
  }, [id]);

  const addMemberRow = () => {
    setNewMembers([...newMembers, { id: Date.now(), firstName: '', lastName: '', email: '', role: '' }]);
  };
  
  const removeMemberRow = (memId: number) => {
    setNewMembers(newMembers.filter(m => m.id !== memId));
  };
  
  const updateMember = (memId: number, field: string, value: string) => {
    setNewMembers(newMembers.map(m => m.id === memId ? { ...m, [field]: value } : m));
  };

  const handleAddMembers = async (e: React.FormEvent) => {
    e.preventDefault();
    const validMembers = newMembers.filter(m => m.firstName && m.lastName && m.email);
    if (validMembers.length === 0) {
      alert("No complete member data to apply. Ensure First Name, Last Name, and Email are filled.");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/artists/${id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ members: validMembers })
      });
      
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setNewMembers([{ id: Date.now(), firstName: '', lastName: '', email: '', role: '' }]); // reset
        fetchContext(); // Re-fetch the updated roster
      } else {
        alert(data.error);
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!artist) {
    return <div style={{ color: 'white', padding: 'var(--spacing-8) 0' }}>Loading Artist Platform Data...</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: 'var(--spacing-8) 0', color: 'white' }}>
      
      <div className="flex-between" style={{ marginBottom: 'var(--spacing-8)', borderBottom: '1px solid var(--color-glass-border)', paddingBottom: 'var(--spacing-6)' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', margin: 0 }}>Edit Artist: {artist.stageName}</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-2)' }}>Structural Management of Band Identity</p>
        </div>
        <Link to="/admin/artists" className="btn-secondary" style={{ textDecoration: 'none' }}>Back to Artists</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-8)' }}>
        
        {/* Existing Roster */}
        <section className="glass-panel" style={{ padding: 'var(--spacing-6)' }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-4)' }}>Active Roster</h2>
          
          {existingMembers.length === 0 ? (
            <p style={{ color: 'var(--color-text-secondary)' }}>No members explicitly bonded to this group entity.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid var(--color-glass-border)' }}>
                  <th style={{ padding: 'var(--spacing-4)', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Name</th>
                  <th style={{ padding: 'var(--spacing-4)', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Email</th>
                  <th style={{ padding: 'var(--spacing-4)', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Role</th>
                </tr>
              </thead>
              <tbody>
                {existingMembers.map((m, idx) => (
                  <tr key={m.id} style={{ borderBottom: idx !== existingMembers.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <td style={{ padding: 'var(--spacing-4)' }}>{m.firstName} {m.lastName}</td>
                    <td style={{ padding: 'var(--spacing-4)', color: 'var(--color-text-secondary)' }}>{m.email}</td>
                    <td style={{ padding: 'var(--spacing-4)', color: 'var(--color-accent-secondary)' }}>{m.role || 'Member'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Append New Members Form */}
        <section className="glass-panel" style={{ padding: 'var(--spacing-6)', borderLeft: '4px solid var(--color-success)' }}>
          <div className="flex-between" style={{ marginBottom: 'var(--spacing-4)' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-2)' }}>Add New Band Members</h2>
              <p style={{ color: 'var(--color-text-secondary)' }}>Configure new identities and systematically assign them to the group architecture.</p>
            </div>
            <button type="button" onClick={addMemberRow} className="btn-secondary" style={{ fontSize: '0.85rem' }}>+ Add Row</button>
          </div>
          
          <form onSubmit={handleAddMembers} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
              {newMembers.map((m, i) => (
                <div key={m.id} style={{ padding: 'var(--spacing-4)', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                  <div className="flex-between" style={{ marginBottom: 'var(--spacing-4)' }}>
                    <h4 style={{ margin: 0, color: 'var(--color-text-secondary)' }}>New Member {i + 1}</h4>
                    {newMembers.length > 1 && (
                      <button type="button" onClick={() => removeMemberRow(m.id)} style={{ background: 'transparent', border: 'none', color: 'var(--color-error)', cursor: 'pointer' }}>Remove</button>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-4)' }}>
                    <input placeholder="First Name" value={m.firstName} onChange={e => updateMember(m.id, 'firstName', e.target.value)} className="glass-panel" style={{ padding: 'var(--spacing-2)', color: 'white' }} />
                    <input placeholder="Last Name" value={m.lastName} onChange={e => updateMember(m.id, 'lastName', e.target.value)} className="glass-panel" style={{ padding: 'var(--spacing-2)', color: 'white' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-4)' }}>
                    <input type="email" placeholder="Active Email" value={m.email} onChange={e => updateMember(m.id, 'email', e.target.value)} className="glass-panel" style={{ padding: 'var(--spacing-2)', color: 'white' }} />
                    <input placeholder="Role (e.g. Bassist)" value={m.role} onChange={e => updateMember(m.id, 'role', e.target.value)} className="glass-panel" style={{ padding: 'var(--spacing-2)', color: 'white' }} />
                  </div>
                </div>
              ))}
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ padding: 'var(--spacing-4)', backgroundColor: 'var(--color-success)', fontSize: '1.1rem' }}>
              {loading ? 'Binding Roster...' : 'Apply All Members to Group'}
            </button>
          </form>
        </section>

      </div>
    </div>
  );
}
