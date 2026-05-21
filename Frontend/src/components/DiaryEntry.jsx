import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Play, Pause, VolumeX, Volume2 } from 'lucide-react';
import EntryHeader from './diary/EntryHeader';
import EntryLocked from './diary/EntryLocked';
import EntryQuote from './diary/EntryQuote';

export default function DiaryEntry({ entry, index }) {
  const { isEntryUnlocked, unlockEntry, getTimeRemaining } = useApp();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);

  const unlocked = isEntryUnlocked(entry.id);

  // Handle time-lock countdown
  useEffect(() => {
    if (entry.lockType !== 'time' || unlocked) return;
    const update = () => {
      const remaining = getTimeRemaining(entry);
      if (remaining <= 0) {
        unlockEntry(entry.id);
        setTimeLeft(null);
      } else {
        setTimeLeft(remaining);
      }
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [entry, unlocked, getTimeRemaining, unlockEntry]);

  const formatTime = (ms) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  };

  return (
    <div
      className="mx-5 rounded-[20px] overflow-hidden animate-fade-in-up"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-card)',
        boxShadow: 'var(--card-shadow)',
        animationDelay: `${index * 0.1}s`,
        animationFillMode: 'backwards',
      }}
    >
      <EntryHeader day={entry.day} duration={entry.duration} title={entry.title} />

      {/* Video / Lock area */}
      <div style={{ padding: '0 22px 8px' }}>
        <div
          className="relative overflow-hidden"
          style={{
            background: 'var(--bg-card-inner)',
            borderRadius: '16px',
            aspectRatio: '16 / 11',
          }}
        >
          {unlocked ? (
            <>
              <img
                src={entry.thumbnail}
                alt={entry.title}
                className="w-full h-full object-cover"
              />
              {/* Play button overlay */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="absolute inset-0 flex items-center justify-center transition-colors"
                style={{ background: isPlaying ? 'transparent' : 'rgba(0,0,0,0.22)' }}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {!isPlaying && (
                  <div
                    className="flex items-center justify-center backdrop-blur-sm"
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.18)',
                      border: '2px solid rgba(255,255,255,0.30)',
                    }}
                  >
                    <Play size={22} fill="white" className="text-white" style={{ marginLeft: '2px' }} />
                  </div>
                )}
              </button>
              {/* Top-right controls */}
              <div className="absolute flex items-center" style={{ top: '12px', right: '12px', gap: '8px' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                  className="flex items-center justify-center backdrop-blur-sm transition-transform active:scale-90"
                  style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(0,0,0,0.50)' }}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX size={15} className="text-white" /> : <Volume2 size={15} className="text-white" />}
                </button>
                {isPlaying && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setIsPlaying(false); }}
                    className="flex items-center justify-center backdrop-blur-sm transition-transform active:scale-90"
                    style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(0,0,0,0.50)' }}
                    aria-label="Pause"
                  >
                    <Pause size={15} className="text-white" />
                  </button>
                )}
              </div>
            </>
          ) : (
            <EntryLocked entry={entry} timeLeft={timeLeft} formatTime={formatTime} />
          )}
        </div>
      </div>

      <EntryQuote quote={entry.quote} recordedAt={entry.recordedAt} />
    </div>
  );
}
