import { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, X } from 'lucide-react';
import { useAudioStore } from '../store/audioStore';

export default function GlobalAudioPlayer() {
  const { playlist, currentTrackIndex, isPlaying, togglePlay, nextTrack, prevTrack, setIsPlaying, clearPlayer } = useAudioStore();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);

  const currentTrack = playlist[currentTrackIndex];

  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;
    
    // Auto-play logic sync
    if (isPlaying) {
      // Browsers require DOM interactions for auto-plays sometimes, catch rejection
      audioRef.current.play().catch(e => {
        console.error("Playback prevented:", e);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrackIndex, currentTrack, setIsPlaying]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(p || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newTime = (Number(e.target.value) / 100) * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setProgress(Number(e.target.value));
    }
  };

  if (!currentTrack) return null;

  return (
    <div className="glass-panel" style={{
      position: 'fixed',
      bottom: '1rem',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '90%',
      maxWidth: '800px',
      zIndex: 1000,
      padding: 'var(--spacing-3) var(--spacing-6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: 'var(--radius-full)',
      backdropFilter: 'blur(30px)'
    }}>
      <audio 
        ref={audioRef} 
        src={currentTrack.url} 
        onTimeUpdate={handleTimeUpdate}
        onEnded={nextTrack}
        autoPlay={isPlaying}
      />
      
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
        <div style={{ width: '40px', height: '40px', minWidth: '40px', borderRadius: '50%', background: 'var(--color-accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Volume2 size={20} color="white" />
        </div>
        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          <strong style={{ display: 'block', fontSize: '0.95rem' }}>{currentTrack.title}</strong>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Me-Commerce Audio Stream</span>
        </div>
      </div>

      <div style={{ flex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
          <button onClick={prevTrack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-primary)' }}><SkipBack size={20} /></button>
          
          <button onClick={togglePlay} style={{ 
            background: 'var(--color-text-primary)', color: 'var(--color-bg-primary)', 
            border: 'none', borderRadius: '50%', width: '40px', height: '40px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            transition: 'transform 0.1s'
          }} onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'} onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}>
            {isPlaying ? <Pause fill="currentColor" size={20} /> : <Play fill="currentColor" size={20} style={{ marginLeft: '2px' }} />}
          </button>
          
          <button onClick={nextTrack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-primary)' }}><SkipForward size={20} /></button>
        </div>
        
        <input 
          type="range" 
          min="0" max="100" 
          value={isNaN(progress) ? 0 : progress} 
          onChange={handleSeek}
          style={{ width: '100%', height: '4px', cursor: 'pointer', accentColor: 'var(--color-accent-primary)' }} 
        />
      </div>
      
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', paddingRight: '1rem', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
        Track {currentTrackIndex + 1} of {playlist.length}
        <button 
          onClick={clearPlayer} 
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', marginLeft: 'var(--spacing-4)' }}
          title="Close Player"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )
}
