import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Play, Pause, VolumeX, Volume2, Clock, QrCode, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DiaryEntry({ entry, index }) {
  const { isEntryUnlocked, unlockEntry, getTimeRemaining } = useApp();
  const navigate = useNavigate();
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

  const getLockIcon = () => {
    switch (entry.lockType) {
      case 'time': return <Clock size={28} style={{ color: 'var(--accent)' }} />;
      case 'qr': return <QrCode size={28} style={{ color: 'var(--accent)' }} />;
      case 'camera': return <Camera size={28} style={{ color: 'var(--accent)' }} />;
      default: return null;
    }
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
      {/* Entry header */}
      <div style={{ padding: '22px 22px 12px' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              fontFamily: "'Space Mono', monospace",
            }}
          >
            DAY {entry.day}
          </span>
          <span
            style={{
              fontSize: '11px',
              padding: '4px 10px',
              borderRadius: '8px',
              color: 'var(--accent)',
              fontFamily: "'Space Mono', monospace",
              background: 'var(--accent-glow)',
            }}
          >
            {entry.duration}
          </span>
        </div>
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            color: 'var(--text-primary)',
            fontSize: '24px',
            fontWeight: 700,
            lineHeight: 1.2,
          }}
        >
          {entry.title}
        </h2>
      </div>

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
                    <Play
                      size={22}
                      fill="white"
                      className="text-white"
                      style={{ marginLeft: '2px' }}
                    />
                  </div>
                )}
              </button>
              {/* Top-right controls */}
              <div className="absolute flex items-center" style={{ top: '12px', right: '12px', gap: '8px' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                  className="flex items-center justify-center backdrop-blur-sm transition-transform active:scale-90"
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.50)',
                  }}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? (
                    <VolumeX size={15} className="text-white" />
                  ) : (
                    <Volume2 size={15} className="text-white" />
                  )}
                </button>
                {isPlaying && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setIsPlaying(false); }}
                    className="flex items-center justify-center backdrop-blur-sm transition-transform active:scale-90"
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: 'rgba(0,0,0,0.50)',
                    }}
                    aria-label="Pause"
                  >
                    <Pause size={15} className="text-white" />
                  </button>
                )}
              </div>
            </>
          ) : (
            /* Locked state */
            <div
              className="flex flex-col items-center justify-center h-full text-center"
              style={{ padding: '32px 24px' }}
            >
              <div
                className="flex items-center justify-center animate-float"
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'var(--accent-glow)',
                  marginBottom: '16px',
                }}
              >
                {getLockIcon()}
              </div>
              <p
                style={{
                  fontSize: '16px',
                  fontWeight: 500,
                  lineHeight: 1.45,
                  color: 'var(--text-primary)',
                  maxWidth: '280px',
                }}
              >
                {entry.lockMessage}
              </p>
              {entry.lockType === 'time' && timeLeft !== null && (
                <p
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    marginTop: '12px',
                    color: 'var(--accent)',
                    fontFamily: "'Space Mono', monospace",
                  }}
                >
                  Unlocks in {formatTime(timeLeft)}
                </p>
              )}
              {entry.lockType === 'qr' && (
                <button
                  onClick={() => navigate('/scan')}
                  className="flex items-center font-semibold transition-transform active:scale-95"
                  style={{
                    gap: '8px',
                    marginTop: '16px',
                    padding: '10px 22px',
                    borderRadius: '999px',
                    fontSize: '13px',
                    background: 'linear-gradient(135deg, var(--accent-light), var(--accent-dark))',
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 4px 16px rgba(200, 149, 108, 0.2)',
                  }}
                >
                  <QrCode size={15} />
                  Scan QR code
                </button>
              )}
              {entry.lockType === 'camera' && (
                <p
                  style={{
                    fontSize: '13px',
                    marginTop: '10px',
                    color: 'var(--text-muted)',
                  }}
                >
                  {entry.lockHint}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quote section */}
      <div style={{ padding: '14px 22px 20px' }}>
        <p
          style={{
            fontSize: '13.5px',
            fontStyle: 'italic',
            lineHeight: 1.65,
            color: 'var(--text-secondary)',
          }}
        >
          {entry.quote}
        </p>
        <p
          style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.15em',
            marginTop: '14px',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            fontFamily: "'Space Mono', monospace",
          }}
        >
          {entry.recordedAt}
        </p>
      </div>
    </div>
  );
}
