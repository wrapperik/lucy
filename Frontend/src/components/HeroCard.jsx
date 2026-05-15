import { useApp } from '../context/AppContext';
import { Clock, QrCode } from 'lucide-react';

export default function HeroCard() {
  const { currentTime, entries, unlockedEntries } = useApp();

  const timeStr = currentTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const totalEntries = entries.length;
  const unlockedCount = unlockedEntries.length;

  return (
    <div
      id="hero-card"
      className="mx-5 mt-6 rounded-[20px] animate-fade-in-up"
      style={{
        background: 'linear-gradient(160deg, var(--bg-card-elevated) 0%, var(--bg-card) 100%)',
        border: '1px solid var(--border-card)',
        boxShadow: 'var(--card-shadow)',
        padding: '24px 22px 20px',
      }}
    >
      {/* Top section: avatar + text */}
      <div className="flex items-start gap-4" style={{ marginBottom: '20px' }}>
        <div className="relative shrink-0">
          <img
            src="/lucy-avatar.png"
            alt="Lucy"
            className="rounded-full object-cover"
            style={{
              width: '60px',
              height: '60px',
              border: '2.5px solid rgba(200, 149, 108, 0.35)',
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              bottom: '-1px',
              right: '-1px',
              width: '14px',
              height: '14px',
              backgroundColor: 'var(--accent)',
              border: '2.5px solid var(--bg-card)',
            }}
          />
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <p
            style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              fontFamily: "'Space Mono', monospace",
              marginBottom: '6px',
            }}
          >
            A VIDEO DIARY
          </p>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              color: 'var(--text-primary)',
              fontSize: '28px',
              fontWeight: 700,
              lineHeight: 1.1,
            }}
          >
            Hey, it's Lucy.
          </h1>
          <p
            style={{
              fontSize: '13.5px',
              marginTop: '6px',
              lineHeight: 1.55,
              color: 'var(--text-secondary)',
            }}
          >
            Scan QR codes at each location to unlock the next chapter of her story.
          </p>
        </div>
      </div>

      {/* Status bar */}
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
          <Clock size={14} style={{ color: 'var(--accent)', opacity: 0.9 }} />
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
          <QrCode size={14} style={{ color: 'var(--accent)', opacity: 0.9 }} />
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
    </div>
  );
}
