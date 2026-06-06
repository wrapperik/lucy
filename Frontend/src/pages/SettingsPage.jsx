import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  LetterLinear, 
  RefreshLinear, 
  LogoutLinear, 
  CheckCircleLinear, 
  ShieldWarningLinear, 
  StarsLinear, 
  HeartLinear, 
  CameraLinear,
  AltArrowRightLinear,
  Widget3Linear
} from '@solar-icons/react-perf';

export default function SettingsPage() {
  const navigate = useNavigate();
  const {
    currentUser,
    isAdmin,
    logoutUser,
    entries,
    unlockedEntries,
    selfies,
    usingBackend,
  } = useApp();

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Statistics
  const totalEntriesCount = entries.length;
  const unlockedEntriesCount = entries.filter(e => unlockedEntries.includes(String(e.id))).length;
  const unlockedPercentage = totalEntriesCount > 0 ? Math.round((unlockedEntriesCount / totalEntriesCount) * 100) : 0;
  const selfiesCount = selfies.length;

  const handleLogout = () => {
    logoutUser();
    window.location.href = '/';
  };

  const handleResetProgress = () => {
    setResetting(true);
    setTimeout(() => {
      localStorage.removeItem('lucy-unlocked');
      localStorage.removeItem('lucy-selfies');
      localStorage.removeItem('lucy-scanned');
      localStorage.removeItem('lucy-arrival');
      window.location.reload();
    }, 1500);
  };

  return (
    <div id="settings-page" className="pb-safe" style={{ padding: '28px 16px 0' }}>
      {/* Header */}
      <div className="animate-fade-in-up" style={{ marginBottom: '28px' }}>
        <p
          style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            fontFamily: "'Space Mono', monospace",
            marginBottom: '10px',
          }}
        >
          YOUR ACCOUNT
        </p>
        <h1
          style={{
            fontFamily: "'Outfit', sans-serif",
            color: 'var(--text-primary)',
            fontSize: '30px',
            fontWeight: 700,
            lineHeight: 1.15,
          }}
        >
          Settings
        </h1>
      </div>

      <div className="flex flex-col" style={{ gap: '16px' }}>
        {/* ─── Profile Card ─── */}
        <div
          className="glass animate-fade-in-up"
          style={{
            padding: '22px 20px',
            borderRadius: 'var(--radius-card)',
            border: '1px solid var(--border-card)',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          <div className="flex items-center" style={{ gap: '16px' }}>
            {/* Avatar */}
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent-light), var(--accent))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '20px',
                fontWeight: 700,
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(243, 129, 85, 0.25)',
              }}
            >
              {currentUser?.username ? currentUser.username[0].toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center" style={{ gap: '8px', marginBottom: '2px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  {currentUser?.username || 'User'}
                </h3>
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    borderRadius: '8px',
                    fontFamily: "'Space Mono', monospace",
                    background: isAdmin ? 'rgba(239, 68, 68, 0.08)' : 'var(--accent-glow)',
                    color: isAdmin ? '#ef4444' : 'var(--accent)',
                    border: isAdmin ? '1px solid rgba(239, 68, 68, 0.15)' : '1px solid var(--accent-glow-strong)',
                  }}
                >
                  {isAdmin ? 'Director' : 'Traveler'}
                </span>
              </div>
              <p className="flex items-center" style={{ fontSize: '13px', color: 'var(--text-secondary)', gap: '6px' }}>
                <LetterLinear size={13} style={{ color: 'var(--text-muted)' }} />
                {currentUser?.email || '—'}
              </p>
            </div>
          </div>
        </div>

        {/* ─── Director Console Card (admin-only) ─── */}
        {isAdmin && (
          <button
            onClick={() => navigate('/admin')}
            className="glass animate-fade-in-up flex items-center transition-transform active:scale-[0.98]"
            style={{
              gap: '16px',
              padding: '20px',
              borderRadius: 'var(--radius-card)',
              border: '1px solid var(--accent-glow-strong)',
              boxShadow: '0 8px 24px rgba(243, 129, 85, 0.08)',
              background: 'var(--accent-glow)',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, var(--accent-light), var(--accent))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(243, 129, 85, 0.25)',
              }}
            >
              <Widget3Linear size={20} style={{ color: 'white' }} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, marginBottom: '2px' }}>
                Director Console
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                Manage diary entries, upload chapters, and configure unlock triggers.
              </p>
            </div>
            <AltArrowRightLinear size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          </button>
        )}

        {/* ─── Journey Statistics ─── */}
        <div
          className="glass animate-fade-in-up"
          style={{
            padding: '22px 20px',
            borderRadius: 'var(--radius-card)',
            border: '1px solid var(--border-card)',
            boxShadow: 'var(--card-shadow)',
            animationDelay: '0.1s',
            animationFillMode: 'backwards',
          }}
        >
          <h3
            style={{
              fontSize: '14px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '16px',
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            Journey Statistics
          </h3>

          <div className="flex flex-col" style={{ gap: '14px' }}>
            {/* Progress bar */}
            <div>
              <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
                <span className="flex items-center font-semibold" style={{ fontSize: '12.5px', color: 'var(--text-secondary)', gap: '6px' }}>
                  <HeartLinear size={14} style={{ color: 'var(--accent)' }} />
                  Diary Unlocked
                </span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'Space Mono', monospace" }}>
                  {unlockedEntriesCount} / {totalEntriesCount} ({unlockedPercentage}%)
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '7px',
                  background: 'var(--bg-card-inner)',
                  borderRadius: '99px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${unlockedPercentage}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--accent-light), var(--accent))',
                    borderRadius: '99px',
                    transition: 'width 0.8s ease-out',
                  }}
                />
              </div>
            </div>

            {/* Selfies */}
            <div
              className="flex items-center justify-between"
              style={{
                paddingTop: '12px',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <span className="flex items-center font-semibold" style={{ fontSize: '12.5px', color: 'var(--text-secondary)', gap: '6px' }}>
                <CameraLinear size={14} style={{ color: 'var(--accent)' }} />
                Selfies Taken
              </span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'Space Mono', monospace" }}>
                {selfiesCount} photos
              </span>
            </div>

            {/* Cloud connection */}
            <div
              className="flex items-center justify-between"
              style={{
                paddingTop: '12px',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <span className="flex items-center font-semibold" style={{ fontSize: '12.5px', color: 'var(--text-secondary)', gap: '6px' }}>
                {usingBackend ? (
                  <CheckCircleLinear size={14} style={{ color: '#22c55e' }} />
                ) : (
                  <ShieldWarningLinear size={14} style={{ color: 'var(--text-muted)' }} />
                )}
                Cloud Sync
              </span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: usingBackend ? '#22c55e' : 'var(--text-muted)',
                  fontFamily: "'Space Mono', monospace",
                  textTransform: 'uppercase',
                }}
              >
                {usingBackend ? 'Connected' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* ─── Diagnostics & Reset ─── */}
        <div
          className="glass animate-fade-in-up"
          style={{
            padding: '22px 20px',
            borderRadius: 'var(--radius-card)',
            border: '1px solid var(--border-card)',
            boxShadow: 'var(--card-shadow)',
            animationDelay: '0.2s',
            animationFillMode: 'backwards',
          }}
        >
          <h3
            style={{
              fontSize: '14px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '10px',
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            Reset Journey
          </h3>

          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
            Experience Lucy's story from the beginning. This will re-lock all chapters and clear your selfie roll.
          </p>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center justify-center font-semibold transition-transform active:scale-95"
            style={{
              gap: '8px',
              width: '100%',
              padding: '11px 16px',
              borderRadius: '14px',
              fontSize: '12.5px',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              background: 'rgba(239, 68, 68, 0.03)',
              color: '#ef4444',
              cursor: 'pointer',
            }}
          >
            <RefreshLinear size={14} />
            Reset Progress
          </button>
        </div>

        {/* ─── Sign Out ─── */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center font-semibold transition-transform active:scale-95"
            style={{
              gap: '8px',
              width: '100%',
              padding: '14px',
              borderRadius: '16px',
              fontSize: '13px',
              background: 'var(--bg-card)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-card)',
              boxShadow: 'var(--card-shadow)',
              cursor: 'pointer',
            }}
          >
            <LogoutLinear size={15} />
            Sign Out
          </button>
        </div>
      </div>

      {/* ─── Reset Confirmation Modal ─── */}
      {showResetConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '24px',
          }}
        >
          <div
            className="glass animate-fade-scale"
            style={{
              maxWidth: '340px',
              width: '100%',
              borderRadius: 'var(--radius-card)',
              border: '1px solid var(--border-card)',
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.15)',
              padding: '28px 24px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444',
                margin: '0 auto 18px',
              }}
            >
              <RefreshLinear size={24} className={resetting ? 'animate-spin-slow' : ''} />
            </div>

            <h3
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '10px',
              }}
            >
              {resetting ? 'Resetting...' : 'Are you sure?'}
            </h3>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '24px' }}>
              This will lock all diary chapters and clear your selfies. This cannot be undone.
            </p>

            {!resetting && (
              <div className="flex" style={{ gap: '10px' }}>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 font-semibold transition-transform active:scale-95"
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    background: 'var(--bg-card-inner)',
                    color: 'var(--text-secondary)',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetProgress}
                  className="flex-1 font-semibold transition-transform active:scale-95"
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 2px 10px rgba(239, 68, 68, 0.25)',
                    cursor: 'pointer',
                  }}
                >
                  Confirm Reset
                </button>
              </div>
            )}

            {resetting && (
              <div className="flex justify-center" style={{ gap: '6px' }}>
                <StarsLinear size={16} className="animate-spin-slow" style={{ color: 'var(--accent)' }} />
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Resetting journey...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
