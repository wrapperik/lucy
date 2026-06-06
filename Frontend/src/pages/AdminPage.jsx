import { useState, useEffect, useCallback, useRef } from 'react';
import QRCode from 'qrcode';
import { useApp } from '../context/AppContext';
import { LockLinear, LogoutLinear, AddCircleLinear, DisketteLinear, RestartLinear, TrashBinTrashLinear, CheckCircleLinear, ShieldWarningLinear, StarsLinear, DownloadLinear, PrinterLinear, CopyLinear } from '@solar-icons/react-perf';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  AddCircleLinear,
  DisketteLinear,
  RestartLinear,
  TrashBinTrashLinear,
  CheckCircleLinear,
  ShieldWarningLinear,
  StarsLinear,
  AltArrowLeftLinear
} from '@solar-icons/react-perf';

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
  qrCode: '',
  cameraPrompt: '',
  lockDuration: 5,
  // Free-text breadcrumb pointing players to the NEXT entry's IRL location
  nextLocationHint: '',
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

/* ── QR Code Preview Block ──
   Renders the QR encoding a deep-link URL that opens /scan?code=<value>.
   Supports download (PNG), print (clean A6-ish page), copy URL. */
function QrCodeBlock({ entry, qrValue }) {
  const canvasRef = useRef(null);
  const [dataUrl, setDataUrl] = useState('');

  // Build the deep-link URL: scanning with any phone camera opens the app
  // and auto-unlocks the matching entry via ScanPage's ?code= handler.
  const deepLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/scan?code=${encodeURIComponent(qrValue)}`
      : '';

  useEffect(() => {
    let cancelled = false;
    if (!qrValue || !canvasRef.current) {
      queueMicrotask(() => { if (!cancelled) setDataUrl(''); });
      return () => { cancelled = true; };
    }
    (async () => {
      try {
        await QRCode.toCanvas(canvasRef.current, deepLink, {
          width: 280,
          margin: 2,
          errorCorrectionLevel: 'H',
          color: { dark: '#1a1a1a', light: '#ffffff' },
        });
        const url = await QRCode.toDataURL(deepLink, {
          width: 1024,
          margin: 2,
          errorCorrectionLevel: 'H',
        });
        if (!cancelled) setDataUrl(url);
      } catch (err) {
        console.warn('QR render error:', err);
      }
    })();
    return () => { cancelled = true; };
  }, [qrValue, deepLink]);

  const downloadPng = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `lucy-day${entry.day || 'x'}-${qrValue}.png`;
    a.click();
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(deepLink);
    } catch {
      // ignore; older browsers
    }
  };

  const printQr = () => {
    if (!dataUrl) return;
    const w = window.open('', 'qrPrint', 'width=720,height=900');
    if (!w) return;
    const dayLabel = entry.day ? `Day ${String(entry.day).padStart(2, '0')}` : 'Lucy';
    const title = entry.title || 'Lucy\'s diary';
    w.document.write(`<!doctype html>
<html><head><meta charset="utf-8" />
<title>QR — ${dayLabel}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Outfit','Helvetica',sans-serif;color:#1a1a1a;background:#fff;padding:48px;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;}
  .tag{font-family:'Space Mono',monospace;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#f38155;margin-bottom:10px;}
  h1{font-size:28px;font-weight:700;margin-bottom:6px;text-align:center;}
  .subtitle{font-size:14px;color:#555;margin-bottom:28px;text-align:center;}
  img{width:340px;height:340px;border:1px solid #eee;padding:14px;background:#fff;border-radius:18px;}
  .code{margin-top:18px;font-family:'Space Mono',monospace;font-size:13px;color:#444;}
  .hint{margin-top:30px;font-size:13px;color:#777;max-width:340px;text-align:center;line-height:1.5;}
  @media print { body{padding:0;} .noprint{display:none;} }
</style></head>
<body>
  <p class="tag">${dayLabel}</p>
  <h1>${title.replace(/</g, '&lt;')}</h1>
  <p class="subtitle">Scan to unlock this diary entry.</p>
  <img src="${dataUrl}" alt="QR code" />
  <p class="code">${qrValue}</p>
  <p class="hint">Point any phone camera at this code. The Lucy app will open and reveal the entry.</p>
</body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  };

  if (!qrValue) {
    return (
      <div
        style={{
          marginTop: '12px',
          padding: '14px 16px',
          borderRadius: '12px',
          background: 'var(--bg-card-inner)',
          border: '1px dashed var(--border-card)',
          fontSize: '12px',
          color: 'var(--text-muted)',
          textAlign: 'center',
        }}
      >
        Enter a QR code value above to generate a scannable code.
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: '16px',
        padding: '20px',
        borderRadius: '16px',
        background: 'white',
        border: '1px solid var(--border-card)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          maxWidth: '100%',
          height: 'auto',
          borderRadius: '8px',
          background: 'white',
        }}
      />
      <div
        style={{
          marginTop: '14px',
          fontSize: '11px',
          color: '#666',
          fontFamily: "'Space Mono', monospace",
          wordBreak: 'break-all',
          textAlign: 'center',
          maxWidth: '280px',
        }}
      >
        {deepLink}
      </div>
      <div className="flex" style={{ gap: '8px', marginTop: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={downloadPng}
          className="flex items-center font-semibold transition-transform active:scale-95"
          style={{
            gap: '6px',
            padding: '10px 16px',
            borderRadius: '10px',
            fontSize: '12px',
            background: 'linear-gradient(135deg, var(--accent-light), var(--accent-dark))',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(243, 129, 85, 0.20)',
          }}
        >
          <DownloadLinear size={14} />
          Download PNG
        </button>
        <button
          type="button"
          onClick={printQr}
          className="flex items-center font-semibold transition-transform active:scale-95"
          style={{
            gap: '6px',
            padding: '10px 16px',
            borderRadius: '10px',
            fontSize: '12px',
            background: 'var(--bg-card)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-card)',
            cursor: 'pointer',
          }}
        >
          <PrinterLinear size={14} />
          Print
        </button>
        <button
          type="button"
          onClick={copyUrl}
          className="flex items-center font-semibold transition-transform active:scale-95"
          style={{
            gap: '6px',
            padding: '10px 16px',
            borderRadius: '10px',
            fontSize: '12px',
            background: 'var(--bg-card)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-card)',
            cursor: 'pointer',
          }}
        >
          <CopyLinear size={14} />
          Copy link
        </button>
      </div>
    </div>
  );
}

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
            <div className="flex" style={{ gap: '8px' }}>
              <input
                type="text"
                value={entry.qrCode}
                onChange={(e) => handleChange('qrCode', e.target.value)}
                placeholder="Auto-generate or type a code"
                style={{ ...styles.input, flex: 1 }}
              />
              <button
                type="button"
                onClick={() => {
                  const day = entry.day ? String(entry.day).padStart(2, '0') : 'XX';
                  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
                  handleChange('qrCode', `LUCY-DAY${day}-${rand}`);
                }}
                className="flex items-center font-semibold transition-transform active:scale-95"
                style={{
                  gap: '6px',
                  padding: '0 16px',
                  borderRadius: '14px',
                  fontSize: '12px',
                  whiteSpace: 'nowrap',
                  background: 'linear-gradient(135deg, var(--accent-light), var(--accent-dark))',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(243, 129, 85, 0.20)',
                  flexShrink: 0,
                }}
              >
                Generate
              </button>
            </div>
            <QrCodeBlock entry={entry} qrValue={entry.qrCode} />
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

      {/* Next-entry location breadcrumb */}
      <div
        style={{
          marginTop: '18px',
          padding: '20px 18px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, var(--accent-glow), transparent)',
          border: '1px dashed var(--accent-glow-strong)',
        }}
      >
        <label style={styles.label}>Where to find the NEXT entry</label>
        <p
          style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            marginTop: '-4px',
            marginBottom: '10px',
            lineHeight: 1.5,
          }}
        >
          Shown to the viewer once they finish this entry, as a clue toward the next IRL location.
        </p>
        <textarea
          value={entry.nextLocationHint || ''}
          onChange={(e) => handleChange('nextLocationHint', e.target.value)}
          placeholder="Try the old willow tree behind the library. She left something taped under the bench."
          style={{ ...styles.textarea, minHeight: '90px' }}
        />
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
    <div style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', zIndex: 100 }}>
      <div
        className="flex items-center animate-fade-in-up"
        style={{
          gap: '10px',
          padding: '14px 22px',
          borderRadius: '99px',
          background: 'rgba(255, 255, 255, 0.95)',
          border: `1px solid ${c.border}`,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          whiteSpace: 'nowrap',
        }}
      >
        {type === 'success' ? (
          <CheckCircleLinear size={18} style={{ color: c.text }} />
        ) : (
          <ShieldWarningLinear size={18} style={{ color: c.text }} />
        )}
        <span style={{ fontSize: '13px', color: c.text, fontWeight: 600 }}>{message}</span>
      </div>
    </div>
  );
}

/* ── Main Admin Page ── */
export default function AdminPage() {
  const navigate = useNavigate();
  const { refreshEntries } = useApp();
  const [toast, setToast] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Draft entries for the form
  const [draftEntries, setDraftEntries] = useState([{ ...DEFAULT_ENTRY }]);
  const [activeEntryIndex, setActiveEntryIndex] = useState(0);

  // Load entries from backend
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
              nextLocationHint: e.nextLocationHint || '',
            }))
          );
          setActiveEntryIndex(0);
        }
      }
    } catch {
      // Backend not available, use empty draft
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleEntryChange = (index, updatedEntry) => {
    setDraftEntries((prev) => {
      const next = [...prev];
      next[index] = updatedEntry;
      return next;
    });
  };

  const handleAddEntry = () => {
    setDraftEntries((prev) => [...prev, { ...DEFAULT_ENTRY }]);
    setActiveEntryIndex(draftEntries.length);
  };

  const handleDeleteEntry = (index) => {
    setDraftEntries((prev) => {
      if (prev.length <= 1) {
        setToast({ message: 'Need at least one entry', type: 'error' });
        return prev;
      }

      // Keep activeEntryIndex valid
      if (activeEntryIndex === index) {
        setActiveEntryIndex(Math.max(0, index - 1));
      } else if (activeEntryIndex > index) {
        setActiveEntryIndex(activeEntryIndex - 1);
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

  /* ── Director Console ── */
  return (
    <div id="admin-page" className="pb-safe" style={{ padding: '20px 16px 140px' }}>
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
          onClick={() => navigate('/settings')}
          className="flex items-center transition-transform active:scale-95"
          style={{
            gap: '6px',
            padding: '10px 16px',
            borderRadius: '12px',
            fontSize: '13px',
            background: 'var(--bg-card)',
            color: 'var(--text-muted)',
            border: '1px solid var(--border-card)',
            cursor: 'pointer',
          }}
        >
          <AltArrowLeftLinear size={14} />
          Settings
        </button>
      </div>

      {/* Subtitle */}
      <p
        style={{
          fontSize: '13.5px',
          color: 'var(--text-secondary)',
          lineHeight: 1.55,
          marginBottom: '20px',
          maxWidth: '400px',
        }}
      >
        Add an entry, paste a video URL, and pick when or where it should unlock.
        Connected to MongoDB Atlas for cloud storage.
      </p>

      {/* Action buttons */}
      <div className="flex items-center" style={{ gap: '10px', marginBottom: '24px' }}>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 flex items-center justify-center font-semibold transition-transform active:scale-95"
          style={{
            gap: '8px',
            padding: '12px 20px',
            borderRadius: '14px',
            fontSize: '13px',
            background: 'linear-gradient(135deg, var(--accent-light), var(--accent-dark))',
            color: 'white',
            border: 'none',
            boxShadow: '0 4px 14px rgba(243, 129, 85, 0.22)',
            cursor: isSaving ? 'wait' : 'pointer',
            opacity: isSaving ? 0.6 : 1,
          }}
        >
          {isSaving ? (
            <StarsLinear size={15} className="animate-spin-slow" />
          ) : (
            <DisketteLinear size={15} />
          )}
          {isSaving ? 'Saving entries...' : 'Save all changes'}
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
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-card)',
            cursor: 'pointer',
          }}
        >
          <RestartLinear size={14} />
          Reset
        </button>
      </div>

      {/* Tab Navigation */}
      <div
        className="flex items-center"
        style={{
          gap: '8px',
          marginBottom: '16px',
          overflowX: 'auto',
          padding: '4px 0 12px 0',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          borderBottom: '1px solid var(--border-card)'
        }}
      >
        {/* Hide default scrollbar in Chrome/Safari */}
        <style dangerouslySetInnerHTML={{__html: `
          div::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
            background: transparent !important;
          }
        `}} />

        {draftEntries.map((entry, index) => {
          const isActive = index === activeEntryIndex;
          const displayDay = entry.day ? `Day ${entry.day}` : `Day ${index + 1}`;

          return (
            <button
              key={entry._id || index}
              onClick={() => setActiveEntryIndex(index)}
              className="transition-all duration-300 font-semibold"
              style={{
                padding: '8px 16px',
                borderRadius: '12px',
                fontSize: '13px',
                cursor: 'pointer',
                fontFamily: "'Space Mono', monospace",
                border: '1px solid ' + (isActive ? 'var(--accent)' : 'var(--border-card)'),
                background: isActive ? 'var(--accent)' : 'var(--bg-card)',
                color: isActive ? 'white' : 'var(--text-secondary)',
                boxShadow: isActive ? '0 4px 12px rgba(243, 129, 85, 0.25)' : 'none',
                flexShrink: 0,
              }}
            >
              {displayDay}
            </button>
          );
        })}

        {/* Add Entry Tab */}
        <button
          onClick={handleAddEntry}
          className="flex items-center transition-all duration-300 font-semibold"
          style={{
            padding: '8px 14px',
            borderRadius: '12px',
            fontSize: '13px',
            cursor: 'pointer',
            fontFamily: "'Space Mono', monospace",
            border: '1px dashed var(--accent)',
            background: 'transparent',
            color: 'var(--accent)',
            gap: '4px',
            flexShrink: 0,
          }}
        >
          <AddCircleLinear size={14} />
          Add Day
        </button>
      </div>

      {/* Editing indicator */}
      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '20px', fontFamily: "'Space Mono', monospace", letterSpacing: '0.05em' }}>
        EDITING ENTRY {activeEntryIndex + 1} OF {draftEntries.length}
      </p>

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
      {!isLoading && draftEntries[activeEntryIndex] && (
        <div className="flex flex-col" style={{ gap: '20px' }}>
          <EntryCard
            key={draftEntries[activeEntryIndex]._id || activeEntryIndex}
            entry={draftEntries[activeEntryIndex]}
            index={activeEntryIndex}
            onChange={handleEntryChange}
            onDelete={handleDeleteEntry}
          />
        </div>
      )}
    </div>
  );
}
