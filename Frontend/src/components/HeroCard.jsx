import { useApp } from '../context/AppContext';
import HeroAvatar from './hero/HeroAvatar';
import HeroStatusBar from './hero/HeroStatusBar';
import { LogOut, User } from 'lucide-react';

export default function HeroCard() {
  const { currentTime, entries, unlockedEntries, currentUser, logoutUser } = useApp();

  const timeStr = currentTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const totalEntries = entries.length;
  const unlockedCount = unlockedEntries.length;

  const handleLogout = () => {
    // Reset dismissal state so they can log back in
    localStorage.removeItem('lucy-auth-dismissed');
    logoutUser();
    window.location.reload();
  };

  return (
    <div
      id="hero-card"
      className="mx-5 mt-6 rounded-[20px] animate-fade-in-up"
      style={{
        background: 'linear-gradient(160deg, var(--bg-card-elevated) 0%, var(--bg-card) 100%)',
        border: '1px solid var(--border-card)',
        boxShadow: 'var(--card-shadow)',
        padding: '24px 22px 20px',
        position: 'relative',
      }}
    >
      {/* User profile capsule tag */}
      {currentUser && (
        <div
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 10px',
            borderRadius: '99px',
            background: 'var(--bg-card-inner)',
            border: '1px solid var(--border-card)',
          }}
        >
          <div
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: 'var(--accent-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <User size={10} style={{ color: 'var(--accent)' }} />
          </div>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              fontFamily: "'Space Mono', monospace",
              maxWidth: '80px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {currentUser.username}
          </span>
          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              marginLeft: '2px',
            }}
            title="Sign out"
          >
            <LogOut size={10} />
          </button>
        </div>
      )}

      {/* Top section: avatar + text */}
      <div className="flex items-start gap-4" style={{ marginBottom: '20px' }}>
        <HeroAvatar src="/lucy-avatar.png" alt="Lucy" />
        <div className="flex-1 min-w-0 pt-0.5" style={{ paddingRight: currentUser ? '110px' : '0px' }}>
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
      </div>

      <HeroStatusBar timeStr={timeStr} unlockedCount={unlockedCount} totalEntries={totalEntries} />
    </div>
  );
}
