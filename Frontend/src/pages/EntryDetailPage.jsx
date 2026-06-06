import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AltArrowLeftLinear, ClockCircleLinear, QrCodeLinear, CameraLinear, LockLinear, LockUnlockedLinear } from '@solar-icons/react-perf';
import EntryReactions from '../components/diary/EntryReactions';

/**
 * Extract a YouTube video ID from various URL formats.
 * Supports: youtube.com/watch?v=, youtu.be/, youtube.com/embed/
 */
function extractYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

const lockIcons = {
  time: ClockCircleLinear,
  qr: QrCodeLinear,
  camera: CameraLinear,
};

export default function EntryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { entries, isEntryUnlocked, unlockEntry, getTimeRemaining } = useApp();

  const [timeLeft, setTimeLeft] = useState(null);

  // Find the entry by id (supports both string and numeric IDs)
  const entry = entries.find(
    (e) => String(e.id) === String(id)
  );

  const unlocked = entry ? isEntryUnlocked(entry.id) : false;

  // Handle time-lock countdown
  useEffect(() => {
    if (!entry || entry.lockType !== 'time' || unlocked) return;
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

  if (!entry) {
    return (
      <div
        className="detail-page flex flex-col items-center justify-center text-center pb-safe"
        style={{ padding: '60px 28px' }}
      >
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>
          Entry not found.
        </p>
        <button
          onClick={() => navigate('/')}
          className="flex items-center transition-transform active:scale-95"
          style={{
            gap: '6px',
            marginTop: '20px',
            padding: '10px 20px',
            borderRadius: '999px',
            fontSize: '14px',
            fontWeight: 600,
            background: 'linear-gradient(135deg, var(--accent-light), var(--accent-dark))',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <AltArrowLeftLinear size={16} />
          Back to diary
        </button>
      </div>
    );
  }

  const youtubeId = extractYouTubeId(entry.videoUrl);
  const LockIcon = lockIcons[entry.lockType] || LockLinear;

  return (
    <div className="detail-page pb-safe animate-slide-in">
      {/* Back button */}
      <div style={{ padding: '16px 16px 0' }}>
        <button
          onClick={() => navigate('/')}
          className="flex items-center justify-center transition-transform active:scale-90"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            boxShadow: 'var(--card-shadow)',
            cursor: 'pointer',
            color: 'var(--text-primary)',
          }}
          aria-label="Go back"
        >
          <AltArrowLeftLinear size={20} />
        </button>
      </div>

      {/* Header section */}
      <div
        className="animate-fade-in-up"
        style={{ padding: '20px 16px 0', textAlign: 'center' }}
      >
        {/* Day label */}
        <p
          style={{
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '0.1em',
            color: 'var(--accent)',
            fontFamily: "'Space Mono', monospace",
            marginBottom: '8px',
          }}
        >
          Day {entry.day}
        </p>

        {/* Title */}
        <h1
          style={{
            fontFamily: "'Outfit', sans-serif",
            color: 'var(--text-primary)',
            fontSize: '30px',
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: '14px',
          }}
        >
          {entry.title}
        </h1>

        {/* Metadata pills */}
        <div
          className="flex items-center justify-center flex-wrap"
          style={{ gap: '8px', marginBottom: '24px' }}
        >
          {entry.recordedAt && (
            <span
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: 500,
                color: 'var(--text-secondary)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
              }}
            >
              {entry.recordedAt}
            </span>
          )}
          {entry.duration && entry.duration !== '0:00' && (
            <span
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: 500,
                color: 'var(--accent)',
                background: 'var(--accent-glow)',
                border: '1px solid var(--accent-glow-strong)',
                fontFamily: "'Space Mono', monospace",
              }}
            >
              {entry.duration}
            </span>
          )}
          <span className={`lock-badge ${unlocked ? 'unlocked' : 'locked'}`}>
            {unlocked ? (
              <>
                <LockUnlockedLinear size={10} />
                UNLOCKED
              </>
            ) : (
              <>
                <LockLinear size={10} />
                LOCKED
              </>
            )}
          </span>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        {unlocked ? (
          <>
            {/* YouTube embed */}
            {youtubeId && (
              <div
                className="youtube-embed-wrapper animate-fade-in-up"
                style={{
                  marginBottom: '24px',
                  animationDelay: '0.1s',
                  animationFillMode: 'backwards',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
                }}
              >
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1&showinfo=0&iv_load_policy=3&color=white`}
                  title={entry.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {/* Caption / Quote */}
            {entry.quote && (
              <div
                className="animate-fade-in-up"
                style={{
                  animationDelay: '0.15s',
                  animationFillMode: 'backwards',
                  padding: '20px 24px',
                  borderRadius: '18px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-card)',
                  boxShadow: 'var(--card-shadow)',
                  marginBottom: '20px',
                }}
              >
                <p
                  style={{
                    fontSize: '15px',
                    fontStyle: 'italic',
                    lineHeight: 1.7,
                    color: 'var(--text-secondary)',
                  }}
                >
                  {entry.quote}
                </p>
              </div>
            )}

            {/* Reactions */}
            <div
              className="animate-fade-in-up"
              style={{
                animationDelay: '0.2s',
                animationFillMode: 'backwards',
                padding: '12px 0',
                borderRadius: '20px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                boxShadow: 'var(--card-shadow)',
              }}
            >
              <EntryReactions entryId={String(entry.id)} />
            </div>
          </>
        ) : (
          /* Locked state */
          <div
            className="animate-fade-scale"
            style={{
              padding: '48px 28px',
              borderRadius: '24px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              boxShadow: 'var(--card-shadow)',
              textAlign: 'center',
            }}
          >
            <div
              className="flex items-center justify-center animate-float"
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'var(--accent-glow)',
                margin: '0 auto 20px',
              }}
            >
              <LockIcon size={32} style={{ color: 'var(--accent)' }} />
            </div>

            <p
              style={{
                fontSize: '18px',
                fontWeight: 600,
                lineHeight: 1.45,
                color: 'var(--text-primary)',
                marginBottom: '10px',
              }}
            >
              {entry.lockMessage || 'This entry is locked'}
            </p>

            {entry.lockType === 'time' && timeLeft !== null && (
              <p
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'var(--accent)',
                  fontFamily: "'Space Mono', monospace",
                  marginTop: '8px',
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
                  margin: '20px auto 0',
                  padding: '12px 26px',
                  borderRadius: '999px',
                  fontSize: '14px',
                  background: 'linear-gradient(135deg, var(--accent-light), var(--accent-dark))',
                  color: 'white',
                  border: 'none',
                  boxShadow: '0 4px 16px rgba(243, 129, 85, 0.25)',
                  cursor: 'pointer',
                }}
              >
                <QrCodeLinear size={16} />
                Scan QR code
              </button>
            )}

            {entry.lockType === 'camera' && entry.lockHint && (
              <p
                style={{
                  fontSize: '13px',
                  marginTop: '12px',
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
  );
}
