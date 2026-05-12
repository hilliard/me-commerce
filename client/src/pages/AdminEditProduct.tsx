import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Plus } from 'lucide-react';

interface TrackInput {
  id: number;
  trackNumber: string;
  title: string;
  duration: string;
  bpm: string;
  isrc: string;
  file: File | null;
  fileFormat: string;
  price: string;
  genre: string;
  featuredArtist: string;
  isExplicit: boolean;
  songId?: number;
  existingPathUrl?: string;
}

export default function AdminEditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [productType, setProductType] = useState('album');
  const [title, setTitle] = useState('');
  const [artistId, setArtistId] = useState('');
  const [price, setPrice] = useState('0.00');
  const [imagePath, setImagePath] = useState('');
  const [description, setDescription] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [genre, setGenre] = useState('');
  const [stock, setStock] = useState('12');

  const [tracks, setTracks] = useState<TrackInput[]>([]);
  const [deleteTrackIds, setDeleteTrackIds] = useState<number[]>([]);

  useEffect(() => {
    fetch(`/api/admin/products/${id}/full`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setTitle(data.title || '');
          setProductType(data.productType || 'album');
          setArtistId(data.artistId?.toString() || '');
          setPrice(data.price?.toString() || '0.00');
          setImagePath(data.image || '');
          setDescription(data.description || '');
          setYear(data.year?.toString() || '');
          setGenre(data.genre || '');
          setStock(data.stock?.toString() || '0');

          if (data.tracks && Array.isArray(data.tracks)) {
            const loaded: TrackInput[] = data.tracks.map((t: any, idx: number) => ({
               id: Date.now() + idx,
               songId: t.songId,
               trackNumber: t.trackOrder?.toString() || (idx + 1).toString(),
               title: t.title || '',
               duration: t.durationSeconds?.toString() || '',
               bpm: t.bpm?.toString() || '',
               isrc: t.isrc || '',
               file: null,
               fileFormat: t.fileFormat || 'MP3',
               price: t.price?.toString() || '0.99',
               genre: t.genre || '',
               featuredArtist: t.featuredArtist || '',
               isExplicit: t.isExplicit || false,
               existingPathUrl: t.pathUrl
            }));
            setTracks(loaded);
          }
        }
      })
      .catch(e => console.error(e));
  }, [id]);

  const addTrackRow = () => {
    setTracks([...tracks, {
      id: Date.now(),
      trackNumber: (tracks.length + 1).toString(),
      title: '',
      duration: '',
      bpm: '',
      isrc: '',
      file: null,
      fileFormat: 'MP3',
      price: '0.99',
      genre: 'Use Album Genre',
      featuredArtist: '',
      isExplicit: false
    }]);
  };

  const updateTrack = (id: number, field: keyof TrackInput, value: any) => {
    setTracks(tracks.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const removeTrack = (id: number) => {
    const target = tracks.find(t => t.id === id);
    if (target && target.songId) {
       setDeleteTrackIds([...deleteTrackIds, target.songId]);
    }
    setTracks(tracks.filter(t => t.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !artistId || !price) {
      alert('Missing core product fields (Title, Artist ID, Price)');
      return;
    }

    const formData = new FormData();
    formData.append('productType', productType);
    formData.append('title', title);
    formData.append('artistId', artistId);
    formData.append('price', price);
    formData.append('imagePath', imagePath || '');
    formData.append('description', description || '');
    formData.append('year', year || '');
    formData.append('genre', genre || '');
    formData.append('stockQuantity', stock || '0');
    formData.append('deleteTrackIds', JSON.stringify(deleteTrackIds));

    // Serialize all the raw metadata except the File object
    const trackDetails = tracks.map(t => ({
      trackNumber: t.trackNumber,
      title: t.title,
      duration: t.duration,
      bpm: t.bpm,
      isrc: t.isrc,
      fileFormat: t.fileFormat,
      price: t.price,
      genre: t.genre === 'Use Album Genre' ? genre : t.genre,
      featuredArtist: t.featuredArtist,
      isExplicit: t.isExplicit,
      hasFile: !!t.file,
      songId: t.songId,
      existingPathUrl: t.existingPathUrl
    }));

    formData.append('trackDetails', JSON.stringify(trackDetails));

    tracks.forEach(track => {
      if (track.file) {
        formData.append('mediaFiles', track.file);
      }
    });

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        body: formData 
      });
      const data = await res.json();
      if (res.ok) {
        alert('Product securely architected and media formally updated!');
        navigate('/admin/products');
      } else {
        alert(data.error);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: 'var(--spacing-8) 0', color: 'white' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-8)' }}>
        <h1 style={{ fontSize: '3rem', fontFamily: 'var(--font-heading)' }}>Artestry Defined</h1>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--color-text-secondary)', fontWeight: 400 }}>Edit Deep Media Product</h2>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: 'var(--spacing-8)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>

        {/* Core Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
          <label style={{ fontWeight: 600 }}>Product Type *</label>
          <select value={productType} onChange={e => setProductType(e.target.value)} className="glass-panel" style={{ padding: 'var(--spacing-3)', color: 'white' }}>
            <option style={{ color: 'initial' }} value="album">Album</option>
            <option style={{ color: 'initial' }} value="single">Single</option>
            <option style={{ color: 'initial' }} value="EP">EP</option>
            <option style={{ color: 'initial' }} value="merchandise">Merchandise</option>
          </select>
          {['album', 'single', 'EP'].includes(productType) && <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Singles and EPs require track listings</span>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
          <label style={{ fontWeight: 600 }}>Product Title *</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter product title" className="glass-panel" style={{ padding: 'var(--spacing-3)', color: 'white' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
          <label style={{ fontWeight: 600 }}>Artist/Brand DB ID *</label>
          <input value={artistId} onChange={e => setArtistId(e.target.value)} placeholder="Enter Numeric Database ID (e.g. 19 for Stevie)" className="glass-panel" style={{ padding: 'var(--spacing-3)', color: 'white' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
          <label style={{ fontWeight: 600 }}>Price (USD) *</label>
          <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="glass-panel" style={{ padding: 'var(--spacing-3)', color: 'white' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
          <label style={{ fontWeight: 600 }}>Image Path *</label>
          <input value={imagePath} onChange={e => setImagePath(e.target.value)} placeholder="e.g. sandy-door.png" className="glass-panel" style={{ padding: 'var(--spacing-3)', color: 'white' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
          <label style={{ fontWeight: 600 }}>Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Marketing copy or history..." rows={3} className="glass-panel" style={{ padding: 'var(--spacing-3)', color: 'white', resize: 'vertical' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--spacing-4)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
            <label style={{ fontWeight: 600 }}>Year</label>
            <input value={year} onChange={e => setYear(e.target.value)} className="glass-panel" style={{ padding: 'var(--spacing-3)', color: 'white' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
            <label style={{ fontWeight: 600 }}>Genre</label>
            <select value={genre} onChange={e => setGenre(e.target.value)} className="glass-panel" style={{ padding: 'var(--spacing-3)', color: 'white' }}>
              <option style={{ color: 'initial' }} value="">Select Genre...</option>
              <option style={{ color: 'initial' }} value="Soul">Soul</option>
              <option style={{ color: 'initial' }} value="RnB">RnB</option>
              <option style={{ color: 'initial' }} value="Funk">Funk</option>
              <option style={{ color: 'initial' }} value="Gospel">Gospel</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
            <label style={{ fontWeight: 600 }}>Stock Quantity</label>
            <input type="number" value={stock} onChange={e => setStock(e.target.value)} className="glass-panel" style={{ padding: 'var(--spacing-3)', color: 'white' }} />
          </div>
        </div>

        {/* Dynamic Detailed Track Listing */}
        {['album', 'single', 'EP'].includes(productType) && (
          <div style={{ marginTop: 'var(--spacing-4)', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)' }}>
            <h3 style={{ color: 'var(--color-accent-secondary)', marginBottom: 'var(--spacing-2)' }}>Track Listing</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: 'var(--spacing-4)' }}>Add songs/tracks for this release (optional - can be added later)</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)', marginBottom: 'var(--spacing-6)' }}>
              {tracks.map((track) => (
                <div key={track.id} className="glass-panel" style={{ padding: 'var(--spacing-6)', position: 'relative', borderLeft: '3px solid var(--color-accent-secondary)' }}>

                  <div className="flex-between" style={{ marginBottom: 'var(--spacing-6)' }}>
                    <h4 style={{ margin: 0, fontSize: '1.2rem' }}>Track {track.trackNumber}</h4>
                    <button type="button" onClick={() => removeTrack(track.id)} className="btn-primary" style={{ backgroundColor: 'var(--color-error)', padding: 'var(--spacing-1) var(--spacing-4)', fontSize: '0.85rem' }}>Remove</button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-4)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                      <label style={{ fontSize: '0.9rem' }}>Track Number *</label>
                      <input value={track.trackNumber} onChange={e => updateTrack(track.id, 'trackNumber', e.target.value)} className="glass-panel" style={{ padding: 'var(--spacing-3)', color: 'white', background: 'rgba(0,0,0,0.3)' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                      <label style={{ fontSize: '0.9rem' }}>Song Title *</label>
                      <input value={track.title} onChange={e => updateTrack(track.id, 'title', e.target.value)} className="glass-panel" style={{ padding: 'var(--spacing-3)', color: 'white', background: 'rgba(0,0,0,0.3)' }} placeholder="Song title" />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-4)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                      <label style={{ fontSize: '0.9rem' }}>Duration (seconds)</label>
                      <input value={track.duration} onChange={e => updateTrack(track.id, 'duration', e.target.value)} className="glass-panel" style={{ padding: 'var(--spacing-3)', color: 'white', background: 'rgba(0,0,0,0.3)' }} placeholder="e.g., 245" />
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Optional - leave blank if unknown</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                      <label style={{ fontSize: '0.9rem' }}>BPM</label>
                      <input value={track.bpm} onChange={e => updateTrack(track.id, 'bpm', e.target.value)} className="glass-panel" style={{ padding: 'var(--spacing-3)', color: 'white', background: 'rgba(0,0,0,0.3)' }} placeholder="e.g., 120" />
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Beats per minute (optional)</span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-4)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                      <label style={{ fontSize: '0.9rem' }}>ISRC Code</label>
                      <input value={track.isrc} onChange={e => updateTrack(track.id, 'isrc', e.target.value)} className="glass-panel" style={{ padding: 'var(--spacing-3)', color: 'white', background: 'rgba(0,0,0,0.3)' }} placeholder="CC-XXX-YY-NNNNN" />
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>International Standard Recording Code (optional)</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                      <label style={{ fontSize: '0.9rem' }}>Real File Upload</label>
                      <input type="file" onChange={e => updateTrack(track.id, 'file', e.target.files?.[0] || null)} className="glass-panel" style={{ padding: 'var(--spacing-3)', color: 'white', background: 'rgba(0,0,0,0.3)' }} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Bind explicit local memory streams to server formally</span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-4)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                      <label style={{ fontSize: '0.9rem' }}>File Format</label>
                      <select value={track.fileFormat} onChange={e => updateTrack(track.id, 'fileFormat', e.target.value)} className="glass-panel" style={{ padding: 'var(--spacing-3)', color: 'white', background: 'rgba(0,0,0,0.3)' }}>
                        <option style={{ color: 'initial' }} value="MP3">MP3</option>
                        <option style={{ color: 'initial' }} value="WAV">WAV</option>
                        <option style={{ color: 'initial' }} value="FLAC">FLAC</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                      <label style={{ fontSize: '0.9rem' }}>Price (USD)</label>
                      <input value={track.price} onChange={e => updateTrack(track.id, 'price', e.target.value)} className="glass-panel" style={{ padding: 'var(--spacing-3)', color: 'white', background: 'rgba(0,0,0,0.3)' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-4)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                      <label style={{ fontSize: '0.9rem' }}>Genre</label>
                      <select value={track.genre} onChange={e => updateTrack(track.id, 'genre', e.target.value)} className="glass-panel" style={{ padding: 'var(--spacing-3)', color: 'white', background: 'rgba(0,0,0,0.3)' }}>
                        <option style={{ color: 'initial' }} value="Use Album Genre">Use Album Genre</option>
                        <option style={{ color: 'initial' }} value="Soul">Soul</option>
                        <option style={{ color: 'initial' }} value="RnB">RnB</option>
                        <option style={{ color: 'initial' }} value="Funk">Funk</option>
                        <option style={{ color: 'initial' }} value="Gospel">Gospel</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', alignSelf: 'center', marginTop: 'var(--spacing-4)' }}>
                      <input type="checkbox" checked={track.isExplicit} onChange={e => updateTrack(track.id, 'isExplicit', e.target.checked)} style={{ transform: 'scale(1.5)', marginRight: 'var(--spacing-2)' }} />
                      <label style={{ fontSize: '1rem' }}>Explicit Content</label>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                    <label style={{ fontSize: '0.9rem' }}>Featured Artist (Optional)</label>
                    <input value={track.featuredArtist} onChange={e => updateTrack(track.id, 'featuredArtist', e.target.value)} className="glass-panel" style={{ padding: 'var(--spacing-3)', color: 'white', background: 'rgba(0,0,0,0.3)' }} placeholder="e.g., feat. Jay-Z" />
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Leave blank to use album artist</span>
                  </div>

                </div>
              ))}
            </div>

            <button type="button" onClick={addTrackRow} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', backgroundColor: 'var(--color-success)', color: 'white', border: 'none' }}>
              <Plus size={16} /> Add Track
            </button>
          </div>
        )}

        <button type="submit" className="btn-primary" style={{ marginTop: 'var(--spacing-6)', width: '100%', fontSize: '1.2rem', padding: 'var(--spacing-4)' }}>Commit Deep Update</button>
      </form>
    </div>
  )
}
