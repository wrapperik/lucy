import { useApp } from '../context/AppContext';
import HeroAvatar from './hero/HeroAvatar';
import HeroStatusBar from './hero/HeroStatusBar';

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
        <HeroAvatar src="/lucy-avatar.png" alt="Lucy" />
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

      <HeroStatusBar timeStr={timeStr} unlockedCount={unlockedCount} totalEntries={totalEntries} />
    </div>
  );
}
