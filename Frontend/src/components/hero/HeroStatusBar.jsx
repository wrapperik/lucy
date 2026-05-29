import { ClockCircleLinear, QrCodeLinear } from '@solar-icons/react-perf';

export default function HeroStatusBar({ timeStr, unlockedCount, totalEntries }) {
  return (
    <div
      className="flex items-center justify-between"
      style={{
        padding: '12px 18px',
        borderRadius: '14px',
        background: 'var(--bg-card-inner)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <div className="flex items-center" style={{ gap: '10px' }}>
        <ClockCircleLinear size={14} style={{ color: 'var(--accent)', opacity: 0.9 }} />
        <span
          style={{
            fontSize: '11.5px',
            letterSpacing: '0.06em',
            color: 'var(--text-secondary)',
            fontFamily: "'Space Mono', monospace",
          }}
        >
          {timeStr}
        </span>
      </div>
      <div className="flex items-center" style={{ gap: '10px' }}>
        <QrCodeLinear size={14} style={{ color: 'var(--accent)', opacity: 0.9 }} />
        <span
          style={{
            fontSize: '11.5px',
            letterSpacing: '0.06em',
            color: 'var(--text-secondary)',
            fontFamily: "'Space Mono', monospace",
          }}
        >
          {unlockedCount}/{totalEntries} UNLOCKED
        </span>
      </div>
    </div>
  );
}
