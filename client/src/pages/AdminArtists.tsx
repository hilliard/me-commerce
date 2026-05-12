import { useEffect, useState } from 'react';
import { Link } from 'react-router';

interface ArtistStat {
  id: number;
  stageName: string;
  productCount: number;
  isGroup: boolean;
}

const AdminArtists = () => {
  // Merge Context
  const [artists, setArtists] = useState<ArtistStat[]>([]);
  const [primarySearch, setPrimarySearch] = useState('');
  const [mergeSearch, setMergeSearch] = useState('');
  
  const [selectedPrimary, setSelectedPrimary] = useState<ArtistStat | null>(null);
  const [selectedMerge, setSelectedMerge] = useState<ArtistStat | null>(null);

  // Legacy Tool Context
  const [humanId, setHumanId] = useState('');
  const [stageName, setStageName] = useState('');

  const fetchArtists = () => {
    fetch('/api/admin/artists/stats')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setArtists(data);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchArtists();
  }, []);

  const handleMergeSubmit = async () => {
    if (!selectedPrimary || !selectedMerge) return;
    if (selectedPrimary.id === selectedMerge.id) {
      alert("Cannot merge an artist into themselves!");
      return;
    }

    const conf = window.confirm(`WARNING: You are about to permanently merge "${selectedMerge.stageName}" into "${selectedPrimary.stageName}". This action will permanently migrate all ${selectedMerge.productCount} products into the primary identity and delete the duplicate alias. This cannot easily be undone.`);
    
    if (conf) {
      try {
        const res = await fetch('/api/admin/artists/merge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ primaryId: selectedPrimary.id, mergeId: selectedMerge.id })
        });
        const data = await res.json();
        if (res.ok) {
          alert('Artists successfully de-duped and merged natively!');
          setSelectedPrimary(null);
          setSelectedMerge(null);
          fetchArtists(); // Reload list
        } else {
          alert(data.error);
        }
      } catch(e: any) { alert(e.message); }
    }
  };

  // Legacy Manual Scaffolder
  const handleCreateFileTree = async () => {
    try {
      const res = await fetch('/api/admin/artists', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ humanId, stageName, bio: '' })
      });
      const data = await res.json();
      alert(data.message || data.error);
      fetchArtists(); // Refresh table
    } catch(err: any) { alert(err.message) }
  };

  const primaryFiltered = artists.filter(a => a.stageName.toLowerCase().includes(primarySearch.toLowerCase()));
  const mergeFiltered = artists.filter(a => a.stageName.toLowerCase().includes(mergeSearch.toLowerCase()));

  return (
    <div style={{ padding: 'var(--spacing-8) 0', color: 'white' }}>
      <div className="flex-between" style={{ marginBottom: 'var(--spacing-12)', borderBottom: '1px solid var(--color-glass-border)', paddingBottom: 'var(--spacing-6)' }}>
        <h1 style={{ fontSize: '2.5rem', margin: 0, letterSpacing: '-0.5px' }}>Admin Artists</h1>
        <div style={{ display: 'flex', gap: 'var(--spacing-4)', alignItems: 'center' }}>
           <Link to="/admin/artists/add" className="btn-primary" style={{ textDecoration: 'none', backgroundColor: 'var(--color-success)', color: 'white', padding: 'var(--spacing-2) var(--spacing-4)' }}>+ New Artist</Link>
           <Link to="/" className="btn-secondary" style={{ textDecoration: 'none' }}>Back to Store</Link>
           <Link to="/admin" className="btn-secondary" style={{ textDecoration: 'none' }}>Admin Dashboard</Link>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-12)' }}>
        
        {/* Step 1 */}
        <section>
          <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-2)' }}>Step 1: Select Primary Artist</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-4)', fontSize: '0.95rem' }}>
            The primary artist will keep all products. Choose the name you want to keep.
          </p>
          <input 
            type="search" 
            placeholder="Search primary artist..." 
            value={primarySearch}
            onChange={(e) => setPrimarySearch(e.target.value)}
            className="glass-panel"
            style={{ width: '100%', padding: 'var(--spacing-3)', color: 'white', marginBottom: 'var(--spacing-6)' }}
          />

          <div style={{ border: '1px solid var(--color-glass-border)', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.2)', maxHeight: '300px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#121212', zIndex: 1, borderBottom: '1px solid var(--color-glass-border)' }}>
                <tr>
                  <th style={{ padding: 'var(--spacing-4)', fontSize: '0.85rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Artist</th>
                  <th style={{ padding: 'var(--spacing-4)', fontSize: '0.85rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', width: '150px' }}>Products</th>
                  <th style={{ padding: 'var(--spacing-4)', fontSize: '0.85rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', width: '150px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {primaryFiltered.map((artist, idx) => {
                  const isSelected = selectedPrimary?.id === artist.id;
                  return (
                    <tr key={artist.id} style={{ borderBottom: idx !== primaryFiltered.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', background: isSelected ? 'rgba(232, 122, 93, 0.1)' : 'transparent' }}>
                      <td style={{ padding: 'var(--spacing-4)', fontWeight: isSelected ? 600 : 400, color: isSelected ? 'var(--color-accent-primary)' : 'inherit' }}>{artist.stageName} <span style={{color: 'gray', fontSize: '0.8rem'}}>(ID: {artist.id})</span></td>
                      <td style={{ padding: 'var(--spacing-4)', color: 'var(--color-text-secondary)' }}>
                        <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}>{artist.productCount}</span>
                      </td>
                      <td style={{ padding: 'var(--spacing-4)', display: 'flex', gap: 'var(--spacing-2)' }}>
                        <button 
                          type="button"
                          onClick={() => setSelectedPrimary(artist)} 
                          className="btn-primary" 
                          style={{ padding: '6px 16px', fontSize: '0.9rem', backgroundColor: isSelected ? 'transparent' : 'var(--color-accent-primary)', border: isSelected ? '1px solid var(--color-accent-primary)' : 'none', color: isSelected ? 'var(--color-accent-primary)' : 'white' }}
                        >
                          {isSelected ? 'Selected' : 'Select'}
                        </button>
                        {artist.isGroup && (
                          <Link
                            to={`/admin/artists/edit/${artist.id}`}
                            className="btn-secondary"
                            style={{ padding: '6px 16px', fontSize: '0.85rem', textDecoration: 'none' }}
                          >
                            Edit Members
                          </Link>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Step 2 */}
        <section>
          <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-2)' }}>Step 2: Select Artist to Merge</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-4)', fontSize: '0.95rem' }}>
            All products from this artist will be moved to the primary artist.
          </p>
          <input 
            type="search" 
            placeholder="Search artist to merge..." 
            value={mergeSearch}
            onChange={(e) => setMergeSearch(e.target.value)}
            className="glass-panel"
            style={{ width: '100%', padding: 'var(--spacing-3)', color: 'white', marginBottom: 'var(--spacing-6)' }}
          />

          <div style={{ border: '1px solid var(--color-glass-border)', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.2)', maxHeight: '300px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#121212', zIndex: 1, borderBottom: '1px solid var(--color-glass-border)' }}>
                <tr>
                  <th style={{ padding: 'var(--spacing-4)', fontSize: '0.85rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Artist</th>
                  <th style={{ padding: 'var(--spacing-4)', fontSize: '0.85rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', width: '150px' }}>Products</th>
                  <th style={{ padding: 'var(--spacing-4)', fontSize: '0.85rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', width: '150px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {mergeFiltered.map((artist, idx) => {
                  const isSelected = selectedMerge?.id === artist.id;
                  // Don't show the primary artist in the merge list logically to prevent self-merge
                  if (artist.id === selectedPrimary?.id) return null;

                  return (
                    <tr key={artist.id} style={{ borderBottom: idx !== mergeFiltered.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', background: isSelected ? 'rgba(232, 122, 93, 0.1)' : 'transparent' }}>
                      <td style={{ padding: 'var(--spacing-4)', fontWeight: isSelected ? 600 : 400, color: isSelected ? 'var(--color-text-primary)' : 'inherit' }}>{artist.stageName}</td>
                      <td style={{ padding: 'var(--spacing-4)', color: 'var(--color-text-secondary)' }}>
                        <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}>{artist.productCount}</span>
                      </td>
                      <td style={{ padding: 'var(--spacing-4)' }}>
                        <button 
                          onClick={() => setSelectedMerge(artist)} 
                          className="btn-primary" 
                          style={{ padding: '6px 16px', fontSize: '0.9rem', backgroundColor: isSelected ? 'rgba(255,255,255,0.1)' : 'var(--color-accent-primary)', color: 'white' }}
                        >
                          {isSelected ? 'Selected' : 'Select'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {selectedPrimary && selectedMerge && (
          <div className="flex-center" style={{ marginTop: 'var(--spacing-6)', padding: 'var(--spacing-6)', border: '1px solid var(--color-accent-primary)', borderRadius: 'var(--radius-md)', background: 'rgba(232, 122, 93, 0.05)' }}>
            <button onClick={handleMergeSubmit} className="btn-primary" style={{ padding: 'var(--spacing-3) var(--spacing-8)', fontSize: '1.1rem' }}>
              Confirm Merge: Drop "{selectedMerge.stageName}"
            </button>
          </div>
        )}

      </div>

      <details style={{ marginTop: 'var(--spacing-16)', padding: 'var(--spacing-6)', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
        <summary style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Advanced Tools: Raw Media Generation</summary>
        <div style={{ marginTop: 'var(--spacing-6)', cursor: 'default' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-2)' }}>Instantiate Filesystem</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-6)' }}>Manually trigger backend node mkdir logic.</p>
          <div style={{ display: 'grid', gap: 'var(--spacing-4)' }}>
            <input className="glass-panel" style={{ padding: 'var(--spacing-2)', color: 'white' }} placeholder="Human DB ID (e.g. 19)" value={humanId} onChange={e=>setHumanId(e.target.value)} />
            <input className="glass-panel" style={{ padding: 'var(--spacing-2)', color: 'white' }} placeholder="Stage Name (StevieWonder)" value={stageName} onChange={e=>setStageName(e.target.value)} />
            <button onClick={handleCreateFileTree} className="btn-primary">Generate Infrastructure</button>
          </div>
        </div>
      </details>

    </div>
  );
};

export default AdminArtists;
