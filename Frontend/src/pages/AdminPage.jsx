import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { LockLinear, LogoutLinear, AddCircleLinear, DisketteLinear, RestartLinear, TrashBinTrashLinear, CheckCircleLinear, ShieldWarningLinear, StarsLinear } from '@solar-icons/react-perf';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const TRIGGER_TYPES = [
  { value: 'none', label: 'Available immediately' },
  { value: 'qr', label: 'QR code scan' },
  { value: 'camera', label: 'Camera / selfie prompt' },
  { value: 'time', label: 'Time-delayed' },
];

const DEFAULT_ENTRY = {
  day: '',
  title: '',
  caption: '',
  videoUrl: '',
  posterUrl: '',
  duration: '',
  recordedAt: '',
  triggerType: 'none',
  triggerHint: 'Available now',
  // QR-specific
  qrCode: '',
  // Camera-specific
  cameraPrompt: '',
  // Time-specific
  lockDuration: 5,
};

/* ── Inline styles ── */
const styles = {
  label: {
    display: 'block',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    fontFamily: "'Space Mono', monospace",
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '14px',
    fontSize: '14px',
    fontFamily: 'inherit',
    background: 'var(--bg-card-inner)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-card)',
    transition: 'border-color 0.2s ease',
    outline: 'none',
  },
  textarea: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '14px',
    fontSize: '14px',
    fontFamily: 'inherit',
    background: 'var(--bg-card-inner)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-card)',
    resize: 'vertical',
    minHeight: '80px',
    lineHeight: 1.55,
    outline: 'none',
  },
  select: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '14px',
    fontSize: '14px',
    fontFamily: 'inherit',
    background: 'var(--bg-card-inner)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-card)',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%235c6878' viewBox='0 0 16 16'%3E%3Cpath d='M1.5 5.5l6.5 6 6.5-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 16px center',
    cursor: 'pointer',
    outline: 'none',
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-card)',
    borderRadius: '22px',
    padding: '26px 22px',
    boxShadow: 'var(--card-shadow)',
  },
  fieldGroup: {
    marginBottom: '20px',
  },
  row: {
    display: 'flex',
    gap: '14px',
  },
};

/* ── Entry Card Component ── */
function EntryCard({ entry, index, onChange, onDelete }) {
  const handleChange = (field, value) => {
    onChange(index, { ...entry, [field]: value });
  };

  return (
    <div style={styles.card} className="animate-fade-in-up">
      {/* Card header */}
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: '24px' }}
      >
        <h2
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '20px',
            fontWeight: 700,
            color: 'var(--text-primary)',
          }}
        >
          {entry.day && entry.title
            ? `Day ${String(entry.day).padStart(2, '0')} — ${entry.title}`
            : `New entry`}
        </h2>
        <button
          onClick={() => onDelete(index)}
          className="flex items-center justify-center transition-transform active:scale-90"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.15)',
            color: '#ef4444',
            cursor: 'pointer',
          }}
          aria-label="Delete entry"
        >
          <TrashBinTrashLinear size={16} />
        </button>
      </div>

      {/* Day + Title row */}
      <div style={styles.row}>
        <div style={{ ...styles.fieldGroup, flex: '0 0 90px' }}>
          <label style={styles.label}>Day</label>
          <input
            type="number"
            min="1"
            value={entry.day}
            onChange={(e) => handleChange('day', e.target.value)}
            placeholder="1"
            style={styles.input}
          />
        </div>
        <div style={{ ...styles.fieldGroup, flex: 1 }}>
          <label style={styles.label}>Title</label>
          <input
            type="text"
            value={entry.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Hi. It's me."
            style={styles.input}
          />
        </div>
      </div>

      {/* Caption */}
      <div style={styles.fieldGroup}>
        <label style={styles.label}>Caption</label>
        <textarea
          value={entry.caption}
          onChange={(e) => handleChange('caption', e.target.value)}
          placeholder="I don't really know who's going to find this. But if you're watching... hi. I'm Lucy."
          style={styles.textarea}
        />
      </div>

      {/* Video URL */}
      <div style={styles.fieldGroup}>
        <label style={styles.label}>Video URL (MP4)</label>
        <input
          type="url"
          value={entry.videoUrl}
          onChange={(e) => handleChange('videoUrl', e.target.value)}
          placeholder="https://example.com/video.mp4"
          style={styles.input}
        />
      </div>

      {/* Poster Image URL */}
      <div style={styles.fieldGroup}>
        <label style={styles.label}>Poster Image URL</label>
        <input
          type="text"
          value={entry.posterUrl}
          onChange={(e) => handleChange('posterUrl', e.target.value)}
          placeholder="/assets/lucy-portrait.jpg"
          style={styles.input}
        />
      </div>

      {/* Duration + Recorded row */}
      <div style={styles.row}>
        <div style={{ ...styles.fieldGroup, flex: 1 }}>
          <label style={styles.label}>Duration Label</label>
          <input
            type="text"
            value={entry.duration}
            onChange={(e) => handleChange('duration', e.target.value)}
            placeholder="0:48"
            style={styles.input}
          />
        </div>
        <div style={{ ...styles.fieldGroup, flex: 1 }}>
          <label style={styles.label}>Recorded</label>
          <input
            type="text"
            value={entry.recordedAt}
            onChange={(e) => handleChange('recordedAt', e.target.value)}
            placeholder="Tuesday · 11:42 PM"
            style={styles.input}
          />
        </div>
      </div>

      {/* Trigger section */}
      <div
        style={{
          background: 'var(--bg-app)',
          border: '1px solid var(--border-card)',
          borderRadius: '16px',
          padding: '20px 18px',
          marginTop: '4px',
        }}
      >
        {/* Trigger Type */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Trigger Type</label>
          <select
            value={entry.triggerType}
            onChange={(e) => {
              const val = e.target.value;
              const hints = {
                none: 'Available now',
                qr: 'Find the code along her route.',
                camera: 'Take a photo to unlock.',
                time: `Unlocks after ${entry.lockDuration || 5} minutes.`,
              };
              onChange(index, { ...entry, triggerType: val, triggerHint: hints[val] });
            }}
            style={styles.select}
          >
            {TRIGGER_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Hint */}
        <div style={{ marginBottom: entry.triggerType !== 'none' ? '20px' : 0 }}>
          <label style={styles.label}>Hint Shown to Viewer</label>
          <input
            type="text"
            value={entry.triggerHint}
            onChange={(e) => handleChange('triggerHint', e.target.value)}
            placeholder="Available now"
            style={styles.input}
          />
        </div>

        {/* Conditional trigger fields */}
        {entry.triggerType === 'qr' && (
          <div>
            <label style={styles.label}>QR Code Value</label>
            <input
              type="text"
              value={entry.qrCode}
              onChange={(e) => handleChange('qrCode', e.target.value)}
              placeholder="LUCY-DAY02-WALK"
              style={styles.input}
            />
          </div>
        )}

        {entry.triggerType === 'camera' && (
          <div>
            <label style={styles.label}>Camera Prompt</label>
            <input
              type="text"
              value={entry.cameraPrompt}
              onChange={(e) => handleChange('cameraPrompt', e.target.value)}
              placeholder="Take a photo of the sky."
              style={styles.input}
            />
          </div>
        )}

        {entry.triggerType === 'time' && (
          <div>
            <label style={styles.label}>Lock Duration (minutes)</label>
            <input
              type="number"
              min="1"
              value={entry.lockDuration}
              onChange={(e) => handleChange('lockDuration', e.target.value)}
              placeholder="5"
              style={styles.input}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Toast Notification ── */
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: { bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.25)', text: '#22c55e' },
    error: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', text: '#ef4444' },
  };
  const c = colors[type] || colors.success;

  return (
    <div
      className="flex items-center animate-fade-in-up"
      style={{
        gap: '10px',
        marginBottom: '16px',
        padding: '14px 18px',
        borderRadius: '14px',
        background: c.bg,
        border: `1px solid ${c.border}`,
      }}
    >
      {type === 'success' ? (
        <CheckCircleLinear size={16} style={{ color: c.text }} />
      ) : (
        <ShieldWarningLinear size={16} style={{ color: c.text }} />
      )}
      <span style={{ fontSize: '13px', color: c.text, fontWeight: 500 }}>{message}</span>
    </div>
  );
}

/* ── Main Admin Page ── */
export default function AdminPage() {
  const { isAdmin, loginAdmin, refreshEntries } = useApp();
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Draft entries for the form
  const [draftEntries, setDraftEntries] = useState([{ ...DEFAULT_ENTRY }]);

  // Load entries from backend on auth
  const loadEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/entries`);
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          setDraftEntries(
            data.map((e) => ({
              _id: e._id,
              day: e.day || '',
              title: e.title || '',
              caption: e.caption || '',
              videoUrl: e.videoUrl || '',
              posterUrl: e.posterUrl || '',
              duration: e.duration || '',
              recordedAt: e.recordedAt || '',
              triggerType: e.triggerType || 'none',
              triggerHint: e.triggerHint || 'Available now',
              qrCode: e.qrCode || '',
              cameraPrompt: e.cameraPrompt || '',
              lockDuration: e.lockDuration || 5,
            }))
          );
        }
      }
    } catch {
      // Backend not available, use empty draft
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) loadEntries();
  }, [isAdmin, loadEntries]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginAdmin(passphrase)) {
      setError('');
    } else {
      setError('Wrong passphrase');
      setPassphrase('');
    }
  };

  const handleEntryChange = (index, updatedEntry) => {
    setDraftEntries((prev) => {
      const next = [...prev];
      next[index] = updatedEntry;
      return next;
    });
  };

  const handleAddEntry = () => {
    setDraftEntries((prev) => [...prev, { ...DEFAULT_ENTRY }]);
  };

  const handleDeleteEntry = (index) => {
    setDraftEntries((prev) => {
      if (prev.length <= 1) {
        setToast({ message: 'Need at least one entry', type: 'error' });
        return prev;
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSave = async () => {
    // Validate
    const invalid = draftEntries.find((e) => !e.day || !e.title);
    if (invalid) {
      setToast({ message: 'Every entry needs at least a day number and title.', type: 'error' });
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`${API_URL}/entries/bulk`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draftEntries),
      });

      if (res.ok) {
        const saved = await res.json();
        setDraftEntries(
          saved.map((e) => ({
            _id: e._id,
            day: e.day || '',
            title: e.title || '',
            caption: e.caption || '',
            videoUrl: e.videoUrl || '',
            posterUrl: e.posterUrl || '',
            duration: e.duration || '',
            recordedAt: e.recordedAt || '',
            triggerType: e.triggerType || 'none',
            triggerHint: e.triggerHint || 'Available now',
            qrCode: e.qrCode || '',
            cameraPrompt: e.cameraPrompt || '',
            lockDuration: e.lockDuration || 5,
          }))
        );
        setToast({ message: 'All entries saved to cloud!', type: 'success' });
        // Refresh context so diary page updates without page reload
        await refreshEntries();
      } else {
        setToast({ message: 'Failed to save. Check your server.', type: 'error' });
      }
    } catch {
      setToast({ message: 'Could not reach the server.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    await loadEntries();
    setToast({ message: 'Reloaded from server.', type: 'success' });
  };

  /* ── Login Screen ── */
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
          <LockLinear size={30} style={{ color: 'var(--accent)' }} />
        </div>
        <h1
          style={{
            fontFamily: "'Outfit', sans-serif",
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
            onChange={(e) => {
              setPassphrase(e.target.value);
              setError('');
            }}
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
              boxShadow: '0 2px 10px rgba(243, 129, 85, 0.25)',
              cursor: 'pointer',
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

  /* ── Director Console ── */
  return (
    <div id="admin-page" className="pb-safe" style={{ padding: '28px 20px 0' }}>
      {/* Header */}
      <div
        className="flex items-start justify-between"
        style={{ marginBottom: '10px' }}
      >
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
            DIRECTOR CONSOLE
          </p>
          <h1
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '26px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1.15,
            }}
          >
            Lucy's diary entries
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
            cursor: 'pointer',
          }}
        >
          <LogoutLinear size={14} />
          Sign out
        </button>
      </div>

      {/* Subtitle */}
      <p
        style={{
          fontSize: '13.5px',
          color: 'var(--text-secondary)',
          lineHeight: 1.55,
          marginBottom: '24px',
          maxWidth: '400px',
        }}
      >
        Add an entry, paste a video URL, and pick when or where it should unlock.
        Connected to MongoDB Atlas for cloud storage.
      </p>

      {/* Action buttons */}
      <div className="flex items-center flex-wrap" style={{ gap: '10px', marginBottom: '24px' }}>
        <button
          onClick={handleAddEntry}
          className="flex items-center font-semibold transition-transform active:scale-95"
          style={{
            gap: '8px',
            padding: '12px 20px',
            borderRadius: '14px',
            fontSize: '13px',
            background: 'linear-gradient(135deg, var(--accent-light), var(--accent-dark))',
            color: 'white',
            border: 'none',
            boxShadow: '0 2px 12px rgba(243, 129, 85, 0.25)',
            cursor: 'pointer',
          }}
        >
          <AddCircleLinear size={16} />
          New entry
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center font-semibold transition-transform active:scale-95"
          style={{
            gap: '8px',
            padding: '12px 20px',
            borderRadius: '14px',
            fontSize: '13px',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-card)',
            cursor: isSaving ? 'wait' : 'pointer',
            opacity: isSaving ? 0.6 : 1,
          }}
        >
          {isSaving ? <StarsLinear size={15} className="animate-spin-slow" /> : <DisketteLinear size={15} />}
          {isSaving ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={handleReset}
          className="flex items-center font-semibold transition-transform active:scale-95"
          style={{
            gap: '8px',
            padding: '12px 20px',
            borderRadius: '14px',
            fontSize: '13px',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-card)',
            cursor: 'pointer',
          }}
        >
          <RestartLinear size={14} />
          Reset
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Loading state */}
      {isLoading && (
        <div
          className="flex items-center justify-center"
          style={{ padding: '40px 0' }}
        >
          <StarsLinear size={28} className="animate-spin-slow" style={{ color: 'var(--accent)' }} />
        </div>
      )}

      {/* Entry cards */}
      {!isLoading && (
        <div className="flex flex-col" style={{ gap: '20px' }}>
          {draftEntries.map((entry, index) => (
            <EntryCard
              key={entry._id || index}
              entry={entry}
              index={index}
              onChange={handleEntryChange}
              onDelete={handleDeleteEntry}
            />
          ))}
        </div>
      )}
    </div>
  );
}
