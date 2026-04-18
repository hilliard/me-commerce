import { useState } from 'react';
import { useNavigate } from 'react-router';

export default function AdminAddArtist() {
  const navigate = useNavigate();

  // Human Identity
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  // Artist Identity
  const [stageName, setStageName] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [debutYear, setDebutYear] = useState('');

  // Group Dynamics
  const [isGroup, setIsGroup] = useState(false);
  const [members, setMembers] = useState([{ id: Date.now(), firstName: '', lastName: '', email: '', role: '' }]);

  const [loading, setLoading] = useState(false);

  const addMemberRow = () => {
    setMembers([...members, { id: Date.now(), firstName: '', lastName: '', email: '', role: '' }]);
  };
  
  const removeMemberRow = (id: number) => {
    setMembers(members.filter(m => m.id !== id));
  };
  
  const updateMember = (id: number, field: string, value: string) => {
    setMembers(members.map(m => m.id === id ? { ...m, [field]: value } : m));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !stageName) {
      alert("Missing core identity parameters (First Name, Last Name, Email, Stage Name)");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/artists/full', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          stageName,
          bio,
          website,
          debutYear,
          isGroup,
          members: isGroup ? members : []
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        navigate('/admin/artists');
      } else {
        alert('Error: ' + data.error + ' - ' + (data.details || ''));
      }
    } catch (err: any) {
      alert('Network Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: 'var(--spacing-8) 0', color: 'white' }}>
      <div style={{ marginBottom: 'var(--spacing-8)' }}>
        <h1 style={{ fontSize: '2.5rem', margin: 0, letterSpacing: '-0.5px' }}>Onboard New Artist</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-2)' }}>Instantiate a secure Human record and directly couple it to a public Stage Profile.</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: 'var(--spacing-8)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8)' }}>
        
        {/* Human Contact Info */}
        <section>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--color-accent-primary)', marginBottom: 'var(--spacing-4)' }}>Contact Identity</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-4)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
              <label style={{ fontSize: '0.9rem' }}>First Name *</label>
              <input value={firstName} onChange={e => setFirstName(e.target.value)} className="glass-panel" style={{ padding: 'var(--spacing-3)', color: 'white' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
              <label style={{ fontSize: '0.9rem' }}>Last Name *</label>
              <input value={lastName} onChange={e => setLastName(e.target.value)} className="glass-panel" style={{ padding: 'var(--spacing-3)', color: 'white' }} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
            <label style={{ fontSize: '0.9rem' }}>Active Email Address *</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="glass-panel" style={{ padding: 'var(--spacing-3)', color: 'white' }} />
          </div>
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', margin: 0 }} />

        {/* Public Brand Profile */}
        <section>
          <div className="flex-between" style={{ marginBottom: 'var(--spacing-4)' }}>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--color-accent-secondary)', margin: 0 }}>Public Brand Profile</h2>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: 'var(--spacing-2) var(--spacing-4)', borderRadius: 'var(--radius-md)' }}>
              <input type="checkbox" checked={isGroup} onChange={e => setIsGroup(e.target.checked)} style={{ transform: 'scale(1.2)' }} />
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>This Artist is a Group/Band</span>
            </label>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-4)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
              <label style={{ fontSize: '0.9rem' }}>Stage Name Algorithm * (Must be Unique)</label>
              <input value={stageName} onChange={e => setStageName(e.target.value)} className="glass-panel" style={{ padding: 'var(--spacing-3)', color: 'white', borderColor: 'var(--color-accent-secondary)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
              <label style={{ fontSize: '0.9rem' }}>Debut Year</label>
              <input type="number" min="1900" max="2100" value={debutYear} onChange={e => setDebutYear(e.target.value)} className="glass-panel" style={{ padding: 'var(--spacing-3)', color: 'white' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-4)' }}>
            <label style={{ fontSize: '0.9rem' }}>Official Website</label>
            <input type="url" value={website} onChange={e => setWebsite(e.target.value)} className="glass-panel" placeholder="https://..." style={{ padding: 'var(--spacing-3)', color: 'white' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
            <label style={{ fontSize: '0.9rem' }}>Biography</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} className="glass-panel" rows={5} style={{ padding: 'var(--spacing-3)', color: 'white', resize: 'vertical' }} />
          </div>
        </section>

        {isGroup && (
          <>
            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', margin: 0 }} />
            <section style={{ background: 'rgba(0,0,0,0.2)', padding: 'var(--spacing-6)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-glass-border)' }}>
              <div className="flex-between" style={{ marginBottom: 'var(--spacing-4)' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', color: 'var(--color-text-primary)', margin: 0 }}>Band Members</h2>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginTop: 'var(--spacing-1)' }}>Define the humans structurally attached to this group.</p>
                </div>
                <button type="button" onClick={addMemberRow} className="btn-secondary" style={{ fontSize: '0.85rem' }}>+ Add Member</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                {members.map((m, i) => (
                  <div key={m.id} className="glass-panel" style={{ padding: 'var(--spacing-4)', position: 'relative' }}>
                    <div className="flex-between" style={{ marginBottom: 'var(--spacing-4)' }}>
                      <h4 style={{ margin: 0 }}>Member {i + 1}</h4>
                      {members.length > 1 && (
                        <button type="button" onClick={() => removeMemberRow(m.id)} style={{ background: 'transparent', border: 'none', color: 'var(--color-error)', cursor: 'pointer' }}>Remove</button>
                      )}
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-4)' }}>
                      <input placeholder="First Name" value={m.firstName} onChange={e => updateMember(m.id, 'firstName', e.target.value)} className="glass-panel" style={{ padding: 'var(--spacing-2)', color: 'white' }} />
                      <input placeholder="Last Name" value={m.lastName} onChange={e => updateMember(m.id, 'lastName', e.target.value)} className="glass-panel" style={{ padding: 'var(--spacing-2)', color: 'white' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-4)' }}>
                      <input type="email" placeholder="Email Address" value={m.email} onChange={e => updateMember(m.id, 'email', e.target.value)} className="glass-panel" style={{ padding: 'var(--spacing-2)', color: 'white' }} />
                      <input placeholder="Role (e.g. Drummer)" value={m.role} onChange={e => updateMember(m.id, 'role', e.target.value)} className="glass-panel" style={{ padding: 'var(--spacing-2)', color: 'white' }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        <button type="submit" disabled={loading} className="btn-primary" style={{ padding: 'var(--spacing-4)', fontSize: '1.1rem', marginTop: 'var(--spacing-4)' }}>
          {loading ? 'Orchestrating Platform Alignment...' : 'Generate New Artist Ecosystem'}
        </button>
      </form>
    </div>
  )
}
