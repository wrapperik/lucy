import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, LogOut, Check } from 'lucide-react';

export default function AdminPage() {
  const { isAdmin, loginAdmin, entries, unlockEntry, isEntryUnlocked } = useApp();
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginAdmin(passphrase)) {
      setError('');
    } else {
      setError('Wrong passphrase');
      setPassphrase('');
    }
  };

  const handleForceUnlock = (entryId) => {
    unlockEntry(entryId);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  // Not authenticated
  if (!isAdmin) {
    return (
      <div
        id="admin-page"
        className="pb-safe flex flex-col items-center justify-center text-center"
        style={{ minHeight: 'calc(100vh - var(--nav-height))', padding: '0 28px' }}
      >
        <div
          className="flex items-center justify-center animate-float"
          style={{
            width: '68px',
            height: '68px',
            borderRadius: '20px',
            background: 'var(--accent-glow)',
            border: '1px solid var(--accent-glow-strong)',
            marginBottom: '22px',
          }}
        >
          <Lock size={30} style={{ color: 'var(--accent)' }} />
        </div>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            color: 'var(--text-primary)',
            fontSize: '26px',
            fontWeight: 700,
            marginBottom: '8px',
          }}
        >
          Admin only
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '36px' }}>
          This is where you upload Lucy's diary entries.
        </p>

        <form
          onSubmit={handleLogin}
          className="w-full flex"
          style={{ maxWidth: '320px', gap: '10px' }}
        >
          <input
            type="password"
            value={passphrase}
            onChange={(e) => { setPassphrase(e.target.value); setError(''); }}
            placeholder="Passphrase"
            style={{
              flex: 1,
              padding: '14px 18px',
              borderRadius: '14px',
              fontSize: '14px',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'var(--border-card)'}`,
              fontFamily: 'inherit',
            }}
          />
          <button
            type="submit"
            className="font-semibold transition-transform active:scale-95"
            style={{
              padding: '14px 22px',
              borderRadius: '14px',
              fontSize: '14px',
              background: 'linear-gradient(135deg, var(--accent-light), var(--accent-dark))',
              color: 'white',
              border: 'none',
              boxShadow: '0 2px 10px rgba(200, 149, 108, 0.2)',
            }}
          >
            Enter
          </button>
        </form>
        {error && (
          <p style={{ fontSize: '12px', marginTop: '14px', color: '#ef4444' }}>{error}</p>
        )}
      </div>
    );
  }

  // Authenticated admin panel
  return (
    <div id="admin-page" className="pb-safe" style={{ padding: '28px 20px 0' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
        <div>
          <p
            style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              fontFamily: "'Space Mono', monospace",
              marginBottom: '4px',
            }}
          >
            ADMIN PANEL
          </p>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '26px',
              fontWeight: 700,
              color: 'var(--text-primary)',
            }}
          >
            Manage Entries
          </h1>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem('lucy-admin');
            window.location.reload();
          }}
          className="flex items-center transition-transform active:scale-95"
          style={{
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '12px',
            fontSize: '13px',
            background: 'var(--bg-card)',
            color: 'var(--text-muted)',
            border: '1px solid var(--border-card)',
          }}
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>

      {showSuccess && (
        <div
          className="flex items-center"
          style={{
            gap: '10px',
            marginBottom: '16px',
            padding: '14px 18px',
            borderRadius: '14px',
            background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.25)',
          }}
        >
          <Check size={16} style={{ color: '#22c55e' }} />
          <span style={{ fontSize: '13px', color: '#22c55e', fontWeight: 500 }}>Entry unlocked!</span>
        </div>
      )}

      {/* Entry list */}
      <div className="flex flex-col" style={{ gap: '10px' }}>
        {entries.map((entry) => {
          const unlocked = isEntryUnlocked(entry.id);
          return (
            <div
              key={entry.id}
              className="flex items-center"
              style={{
                gap: '16px',
                padding: '18px 18px',
                borderRadius: '18px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
              }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center" style={{ gap: '8px', marginBottom: '4px' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      color: 'var(--accent)',
                      fontFamily: "'Space Mono', monospace",
                    }}
                  >
                    DAY {entry.day}
                  </span>
                  {unlocked ? (
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        padding: '3px 10px',
                        borderRadius: '999px',
                        background: 'rgba(34,197,94,0.12)',
                        color: '#22c55e',
                      }}
                    >
                      Unlocked
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        padding: '3px 10px',
                        borderRadius: '999px',
                        background: 'var(--accent-glow)',
                        color: 'var(--accent)',
                        textTransform: 'capitalize',
                      }}
                    >
                      {entry.lockType}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {entry.title}
                </p>
              </div>
              {!unlocked && (
                <button
                  onClick={() => handleForceUnlock(entry.id)}
                  className="shrink-0 font-semibold transition-transform active:scale-90"
                  style={{
                    padding: '10px 16px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    background: 'var(--accent-glow)',
                    color: 'var(--accent)',
                    border: '1px solid var(--accent-glow-strong)',
                  }}
                >
                  Force Unlock
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
