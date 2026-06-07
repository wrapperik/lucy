import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AltArrowLeftLinear, ClockCircleLinear, QrCodeLinear, CameraLinear, LockLinear, LockUnlockedLinear, MapPointLinear, RestartLinear, StarsLinear } from '@solar-icons/react-perf';
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
  const [showCredits, setShowCredits] = useState(false);
  const creditsRef = useRef(null);
  const scrollIntervalRef = useRef(null);

  useEffect(() => {
    if (showCredits) {
      const delayTimeout = setTimeout(() => {
        if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
        
        scrollIntervalRef.current = setInterval(() => {
          if (creditsRef.current) {
            const container = creditsRef.current;
            if (container.scrollTop + container.clientHeight >= container.scrollHeight - 1) {
              clearInterval(scrollIntervalRef.current);
            } else {
              container.scrollTop += 0.8;
            }
          }
        }, 16);
      }, 1500);

      return () => {
        clearTimeout(delayTimeout);
        if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
      };
    } else {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    }
  }, [showCredits]);

  const handleUserScroll = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  };

  const handleResetProgress = () => {
    if (window.confirm("Are you sure you want to reset your journey? This will re-lock all entries and clear your selfies.")) {
      localStorage.removeItem('lucy-unlocked');
      localStorage.removeItem('lucy-selfies');
      localStorage.removeItem('lucy-scanned');
      localStorage.removeItem('lucy-arrival');
      window.location.href = '/';
    }
  };

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
          className="font-serif"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            color: 'var(--text-primary)',
            fontSize: '32px',
            fontWeight: 700,
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

            {/* Where to find the next entry — director's breadcrumb */}
            {entry.nextLocationHint && (
              <div
                className="animate-fade-in-up"
                style={{
                  animationDelay: '0.25s',
                  animationFillMode: 'backwards',
                  marginTop: '20px',
                  padding: '22px 22px 24px',
                  borderRadius: '20px',
                  background:
                    'linear-gradient(135deg, var(--accent-glow), var(--bg-card))',
                  border: '1px solid var(--accent-glow-strong)',
                  boxShadow: '0 8px 28px rgba(0, 0, 0, 0.04)',
                }}
              >
                <div
                  className="flex items-center"
                  style={{ gap: '10px', marginBottom: '10px' }}
                >
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '12px',
                      background: 'var(--accent-glow-strong)',
                      color: 'var(--accent)',
                    }}
                  >
                    <MapPointLinear size={18} />
                  </div>
                  <p
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: 'var(--accent)',
                      fontFamily: "'Space Mono', monospace",
                    }}
                  >
                    Where to find the next entry
                  </p>
                </div>
                <p
                  style={{
                    fontSize: '15px',
                    lineHeight: 1.6,
                    color: 'var(--text-primary)',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {entry.nextLocationHint}
                </p>
              </div>
            )}

            {entry.isLastEntry && (
              <div
                className="animate-fade-in-up"
                style={{
                  animationDelay: '0.3s',
                  animationFillMode: 'backwards',
                  marginTop: '24px',
                  textAlign: 'center',
                }}
              >
                <button
                  onClick={() => setShowCredits(true)}
                  className="flex items-center justify-center font-semibold transition-all duration-300 active:scale-95 hover:opacity-90 animate-pulse-glow"
                  style={{
                    width: '100%',
                    gap: '10px',
                    padding: '16px 24px',
                    borderRadius: '16px',
                    fontSize: '13px',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    background: 'linear-gradient(135deg, #1A1A1A, #000000)',
                    color: '#FFFFFF',
                    border: 'none',
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                    cursor: 'pointer',
                    fontFamily: "'Space Mono', monospace",
                  }}
                >
                  <StarsLinear size={15} style={{ color: '#FFFFFF' }} />
                  View Credits
                </button>
              </div>
            )}
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
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
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

      {/* Credits Fullscreen Overlay */}
      {showCredits && (
        <div
          onWheel={handleUserScroll}
          onTouchStart={handleUserScroll}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: '#0A0A0A',
            color: '#FFFFFF',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header Bar */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              right: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 10,
            }}
          >
            <span
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                letterSpacing: '0.2em',
                color: '#888888',
                textTransform: 'uppercase',
              }}
            >
              The End.
            </span>
            <button
              onClick={() => setShowCredits(false)}
              className="transition-transform active:scale-95 animate-fade-in-up"
              style={{
                padding: '8px 16px',
                borderRadius: '99px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                letterSpacing: '0.1em',
                cursor: 'pointer',
              }}
            >
              Skip
            </button>
          </div>

          {/* Scrolling Container */}
          <div
            ref={creditsRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '60px 24px 120px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              scrollBehavior: 'smooth',
            }}
          >
            {/* Top spacing to start the scroll effect */}
            <div style={{ minHeight: '60vh' }} />

            {/* Sketched Logo */}
            <img
              src="/sketched-logo.jpeg"
              alt="Lucy Sketched Logo"
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                marginBottom: '24px',
                border: 'none',
                opacity: 0.9,
              }}
            />

            <h2
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '36px',
                fontWeight: 700,
                lineHeight: 1.2,
                color: '#FFFFFF',
                marginBottom: '6px',
              }}
            >
              LUCY.
            </h2>
            <p
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                letterSpacing: '0.25em',
                color: '#888',
                textTransform: 'uppercase',
                marginBottom: '60px',
              }}
            >
              A Pocket Diary Experience
            </p>

            {/* Credit Blocks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '44px', width: '100%', maxWidth: '480px' }}>
              <div>
                <p
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '10px',
                    letterSpacing: '0.2em',
                    color: '#666',
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                  }}
                >
                  Written & Directed by
                </p>
                <h3
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '22px',
                    fontWeight: 700,
                  }}
                >
                  Rikus Pretorius.
                </h3>
              </div>

              <div>
                <p
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '10px',
                    letterSpacing: '0.2em',
                    color: '#666',
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                  }}
                >
                  Starring
                </p>
                <h3
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '22px',
                    fontWeight: 700,
                  }}
                >
                  Lucy.
                </h3>
              </div>

              <div>
                <p
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '10px',
                    letterSpacing: '0.2em',
                    color: '#666',
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                  }}
                >
                  Production Design
                </p>
                <h3
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '20px',
                    fontWeight: 700,
                  }}
                >
                  The Diary Archive.
                </h3>
              </div>

              <div>
                <p
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '10px',
                    letterSpacing: '0.2em',
                    color: '#666',
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                  }}
                >
                  Technical Architecture
                </p>
                <h3
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '20px',
                    fontWeight: 700,
                  }}
                >
                  Antigravity AI.
                </h3>
              </div>

              <div>
                <p
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '10px',
                    letterSpacing: '0.2em',
                    color: '#666',
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                  }}
                >
                  Soundtrack
                </p>
                <h3
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '18px',
                    fontWeight: 700,
                  }}
                >
                  Urban Echoes & Silence.
                </h3>
              </div>
            </div>

            {/* Separator */}
            <div
              style={{
                width: '40px',
                height: '1px',
                background: 'rgba(255,255,255,0.15)',
                margin: '60px auto 40px',
              }}
            />

            {/* Ending Quote */}
            <p
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '20px',
                fontStyle: 'italic',
                color: '#DDDDDD',
                lineHeight: 1.6,
                maxWidth: '320px',
                marginBottom: '10px',
              }}
            >
              "Thank you for keeping my secrets. For walking the paths. For listening."
            </p>
            <p
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                letterSpacing: '0.2em',
                color: '#888',
                textTransform: 'uppercase',
                marginBottom: '80px',
              }}
            >
              — Lucy
            </p>

            {/* Interactive Actions at the End */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                width: '100%',
                maxWidth: '280px',
                marginTop: '20px',
              }}
            >
              <button
                onClick={() => setShowCredits(false)}
                className="transition-transform active:scale-95"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  background: '#FFFFFF',
                  color: '#0A0A0A',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: "'Space Mono', monospace",
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                Return to Diary
              </button>
              <button
                onClick={handleResetProgress}
                className="flex items-center justify-center transition-transform active:scale-95"
                style={{
                  width: '100%',
                  gap: '8px',
                  padding: '14px',
                  borderRadius: '12px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#EF4444',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  cursor: 'pointer',
                  fontFamily: "'Space Mono', monospace",
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                <RestartLinear size={14} style={{ color: '#EF4444' }} />
                Restart Journey
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
