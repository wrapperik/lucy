import { useApp } from '../context/AppContext';
import HeroStatusBar from './hero/HeroStatusBar';

export default function HeroCard() {
  const { currentTime, entries, unlockedEntries, currentUser } = useApp();

  const timeStr = currentTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const totalEntries = entries.length;
  const unlockedCount = entries.filter(e => unlockedEntries.includes(String(e.id))).length;

  return (
    <div
      id="hero-card"
      className="animate-fade-in-up"
      style={{
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
        padding: '16px 16px 0px',
        position: 'relative',
      }}
    >
      {/* Top section: header text */}
      <div style={{ marginBottom: '20px' }}>
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
          LUCY'S POCKET DIARY
        </p>
        <h1
          className="font-serif"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            color: 'var(--text-primary)',
            fontSize: '32px',
            fontWeight: 700,
            lineHeight: 1.1,
          }}
        >
          {currentUser ? `Hey ${currentUser.username}.` : "Hey, it's Lucy."}
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

      <HeroStatusBar timeStr={timeStr} unlockedCount={unlockedCount} totalEntries={totalEntries} />
    </div>
  );
}
