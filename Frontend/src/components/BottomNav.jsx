import { NavLink } from 'react-router-dom';
import { LayoutGrid, Sparkles, ScanLine, Camera, Settings } from 'lucide-react';

const leftItems = [
  { to: '/', icon: LayoutGrid, label: 'Diary' },
  { to: '/selfie', icon: Sparkles, label: 'Selfie' },
];

const rightItems = [
  { to: '/prompts', icon: Camera, label: 'Prompts' },
  { to: '/admin', icon: Settings, label: 'Admin' },
];

function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className="flex flex-col items-center transition-all duration-300"
      style={({ isActive }) => ({
        gap: '4px',
        padding: '6px 0',
        minWidth: '56px',
        color: isActive ? 'var(--accent)' : 'var(--text-muted)',
      })}
    >
      {({ isActive }) => (
        <>
          <div
            className="relative"
            style={{
              transform: isActive ? 'scale(1.08)' : 'scale(1)',
              transition: 'transform 0.3s ease',
            }}
          >
            <Icon size={22} strokeWidth={isActive ? 2 : 1.7} />
            {isActive && (
              <div
                className="absolute animate-pulse-glow"
                style={{
                  inset: '-6px',
                  borderRadius: '50%',
                  background: 'var(--accent-glow)',
                }}
              />
            )}
          </div>
          <span
            style={{
              fontSize: '10px',
              fontWeight: isActive ? 600 : 500,
              letterSpacing: '0.04em',
              fontFamily: "'Space Mono', monospace",
            }}
          >
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
}

export default function BottomNav() {
  return (
    <nav
      id="bottom-nav"
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Glass background bar */}
      <div
        className="glass"
        style={{
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <div
          className="flex items-center justify-around max-w-lg mx-auto relative"
          style={{ height: 'var(--nav-height)', padding: '0 12px' }}
        >
          {/* Left nav items */}
          {leftItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}

          {/* Center scan button — elevated circle */}
          <NavLink
            to="/scan"
            className="relative flex items-center justify-center transition-transform active:scale-90"
            style={({ isActive }) => ({
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              marginTop: '-26px',
              background: isActive
                ? 'linear-gradient(135deg, var(--accent-light), var(--accent))'
                : 'linear-gradient(135deg, var(--accent-light), var(--accent-dark))',
              boxShadow: '0 6px 24px rgba(200, 149, 108, 0.35), 0 0 0 4px var(--bg-app)',
              border: 'none',
              flexShrink: 0,
            })}
          >
            <ScanLine size={24} className="text-white" />
          </NavLink>

          {/* Right nav items */}
          {rightItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </div>
      </div>
    </nav>
  );
}
