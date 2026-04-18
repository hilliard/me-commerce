import { useParams } from 'react-router';

export default function ArtistProfile() {
  const { id } = useParams();

  return (
    <div className="glass-panel" style={{ padding: 'var(--spacing-8)' }}>
      <h1 style={{ fontSize: '3rem', color: 'var(--color-accent-primary)' }}>Artist Showcase</h1>
      <p style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)' }}>Welcome to the sub-routing profile map for artist: <strong>{id}</strong>.</p>
      
      <div style={{ height: '300px', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 'var(--spacing-8)' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>This domain securely reads from the backend specific <code>media_assets</code> structure to host high-res profiles and their discography.</p>
      </div>
    </div>
  )
}
