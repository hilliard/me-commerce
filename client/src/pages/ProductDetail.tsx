import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useCartStore } from '../store/cartStore';
import { useAudioStore } from '../store/audioStore';
import type { Track } from '../store/audioStore';
import { Play, Pause } from 'lucide-react';

export default function ProductDetail() {
  const { handle } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const { addItem, openDrawer } = useCartStore();
  const { playlist, currentTrackIndex, isPlaying, setPlaylist, playTrack, togglePlay } = useAudioStore();

  useEffect(() => {
    // 1. Fetch product
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const found = data.find((p: any) => p.handle === handle);
          setProduct(found);
        } else {
          console.error("Products endpoint did not return an array", data);
        }
      })
      .catch(e => console.error(e));

    // 2. Fetch natively read tracks
    fetch(`/api/products/${handle}/tracks`)
      .then(res => res.json())
      .then(data => setTracks(data.tracks || []))
      .catch(e => console.error("No tracks found:", e));

  }, [handle]);

  if (!product) return <div className="flex-center" style={{ minHeight: '50vh' }}>Loading...</div>;

  const isCurrentPlaylist = playlist.length > 0 && playlist[0]?.url === tracks[0]?.url;

  const handlePlayAlbum = () => {
    if (tracks.length === 0) return;
    setPlaylist(tracks, 0);
  };

  const handlePlayTrack = (index: number) => {
    if (!isCurrentPlaylist) {
      setPlaylist(tracks, index);
    } else if (currentTrackIndex === index) {
      togglePlay();
    } else {
      playTrack(index);
    }
  };

  return (
    <div style={{ padding: 'var(--spacing-8) 0', paddingBottom: '120px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)', gap: 'var(--spacing-16)', alignItems: 'start' }}>
        
        {/* Album Artwork */}
        <div className="glass-panel" style={{ padding: 'var(--spacing-4)' }}>
          <img 
            src={product.image || '/placeholder.jpg'} 
            style={{ width: '100%', borderRadius: 'var(--radius-sm)', display: 'block', aspectRatio: '1/1', objectFit: 'cover' }} 
            alt={product.title} 
          />
        </div>

        {/* Info & Tracks */}
        <div>
          <h1 style={{ fontSize: '3.5rem', marginBottom: 'var(--spacing-2)', lineHeight: 1.1 }}>{product.title}</h1>
          <p style={{ fontSize: '1.4rem', color: 'var(--color-accent-primary)', marginBottom: 'var(--spacing-6)' }}>${product.price}</p>
          
          <button className="btn-primary" style={{ marginBottom: 'var(--spacing-12)' }} onClick={() => {
            addItem({ productId: product.id, handle: product.handle, title: product.title, price: Number(product.price), image: product.image });
            openDrawer();
          }}>Add to Cart</button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-6)' }}>
            <h2 style={{ fontSize: '2rem', margin: 0 }}>Tracklist</h2>
            {tracks.length > 0 && (
              <button 
                onClick={handlePlayAlbum}
                className="btn-secondary flex-center" 
                style={{ gap: 'var(--spacing-2)', padding: 'var(--spacing-2) var(--spacing-6)' }}
              >
                <Play size={18} /> Play Full Album
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
            {tracks.length === 0 ? <p style={{ color: 'var(--color-text-secondary)' }}>No digital stream available.</p> : null}
            {tracks.map((track, idx) => {
              const isActive = isCurrentPlaylist && currentTrackIndex === idx;
              return (
                <div 
                  key={idx} 
                  className="glass-panel flex-between"
                  style={{ 
                    padding: 'var(--spacing-3) var(--spacing-4)', 
                    cursor: 'pointer',
                    borderColor: isActive ? 'var(--color-accent-primary)' : 'var(--color-glass-border)',
                    transform: isActive ? 'scale(1.02)' : 'none'
                  }}
                  onClick={() => handlePlayTrack(idx)}
                >
                  <div style={{ display: 'flex', gap: 'var(--spacing-4)', alignItems: 'center' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>{(idx + 1).toString().padStart(2, '0')}</span>
                    <span style={{ fontWeight: isActive ? 600 : 400, color: isActive ? 'var(--color-accent-primary)' : 'inherit' }}>{track.title}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--spacing-4)', alignItems: 'center' }}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        addItem({
                           songId: track.id,
                           handle: `${product.handle}-track-${track.id}`,
                           title: track.title,
                           price: track.price ? Number(track.price) : 0.99,
                           artist: product.artistName || product.title,
                           image: product.image
                        });
                        openDrawer();
                      }}
                      className="btn-secondary"
                      style={{ fontSize: '0.8rem', padding: '2px 8px', borderColor: 'var(--color-accent-secondary)', color: 'var(--color-accent-secondary)' }}
                    >
                      + ${(track.price && Number(track.price) > 0) ? Number(track.price).toFixed(2) : '0.99'}
                    </button>
                    {isActive && isPlaying ? <Pause size={18} color="var(--color-accent-primary)" /> : <Play size={18} color="var(--color-text-secondary)" />}
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      </div>
    </div>
  )
}
