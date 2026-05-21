import { Clock, QrCode, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const lockIcons = {
  time: <Clock size={28} style={{ color: 'var(--accent)' }} />,
  qr: <QrCode size={28} style={{ color: 'var(--accent)' }} />,
  camera: <Camera size={28} style={{ color: 'var(--accent)' }} />,
};

export default function EntryLocked({ entry, timeLeft, formatTime }) {
  const navigate = useNavigate();

  return (
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
        {lockIcons[entry.lockType]}
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
  );
}
