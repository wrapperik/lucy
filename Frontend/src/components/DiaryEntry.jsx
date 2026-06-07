import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { LockLinear, LockUnlockedLinear, ClockCircleLinear, QrCodeLinear, CameraLinear } from '@solar-icons/react-perf';

const lockIcons = {
  time: ClockCircleLinear,
  qr: QrCodeLinear,
  camera: CameraLinear,
};

export default function DiaryEntry({ entry, index }) {
  const navigate = useNavigate();
  const { isEntryUnlocked, unlockEntry, getTimeRemaining } = useApp();
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
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const LockIcon = lockIcons[entry.lockType] || LockLinear;

  return (
    <div
      onClick={() => navigate(`/entry/${entry.id}`)}
      className="entry-card-compact overflow-hidden animate-fade-in-up flex flex-col"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/entry/${entry.id}`)}
      style={{
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
        animationDelay: `${index * 0.08}s`,
        animationFillMode: 'backwards',
        padding: '0 0 16px 0',
        cursor: 'pointer',
        width: '100%',
        gap: '12px',
      }}
    >
      {/* Thumbnail (Large aspect-square) */}
      <div
        style={{
          width: '100%',
          aspectRatio: '1 / 1',
          borderRadius: '16px',
          overflow: 'hidden',
          position: 'relative',
          background: 'var(--bg-card-inner)',
          flexShrink: 0,
        }}
      >
        {unlocked ? (
          <img
            src={entry.thumbnail}
            alt={entry.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        ) : (
          <div
            className="flex items-center justify-center"
            style={{
              width: '100%',
              height: '100%',
              background: 'var(--accent-glow)',
            }}
          >
            <LockIcon size={32} style={{ color: 'var(--accent)' }} className="animate-float" />
          </div>
        )}
      </div>

      {/* Text content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0, padding: '0 16px' }}>
        {/* Day & Duration Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', justifyContent: 'space-between' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              fontFamily: "'Space Mono', monospace",
            }}
          >
            DAY {entry.day}
          </span>
          {entry.duration && entry.duration !== '0:00' && (
            <span
              style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                fontFamily: "'Space Mono', monospace",
              }}
            >
              {entry.duration}
            </span>
          )}
        </div>

        {/* Title (Line Clamped) */}
        <h3
          className="font-serif"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            color: 'var(--text-primary)',
            fontSize: '18px',
            fontWeight: 700,
            lineHeight: 1.3,
            margin: '2px 0',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            textOverflow: 'ellipsis',
          }}
        >
          {entry.title}
        </h3>

        {/* Status Badge */}
        <div style={{ display: 'flex', marginTop: '4px' }}>
          {unlocked ? (
            <span className="lock-badge unlocked" style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '9px' }}>
              <LockUnlockedLinear size={9} />
              UNLOCKED
            </span>
          ) : (
            <span className="lock-badge locked" style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '9px' }}>
              <LockLinear size={9} />
              {entry.lockType === 'time' && timeLeft !== null
                ? formatTime(timeLeft)
                : 'LOCKED'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
