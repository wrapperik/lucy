/* eslint-disable no-unused-vars */
import { NavLink } from 'react-router-dom';
import { Widget3Linear, StarsLinear, ScannerLinear, CameraLinear, SettingsLinear } from '@solar-icons/react-perf';

const leftItems = [
  { to: '/', icon: Widget3Linear, label: 'Diary' },
  { to: '/selfie', icon: StarsLinear, label: 'Selfie' },
];

const rightItems = [
  { to: '/prompts', icon: CameraLinear, label: 'Prompts' },
  { to: '/admin', icon: SettingsLinear, label: 'Admin' },
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
      className="fixed left-1/2 -translate-x-1/2 w-[90%] max-w-[430px] z-50 animate-fade-in-up"
      style={{ bottom: '20px' }}
    >
      {/* Glass background bar */}
      <div
        className="glass"
        style={{
          borderRadius: '999px',
          border: '1px solid var(--border-card)',
          boxShadow: 'var(--card-shadow)',
          padding: '0 8px',
        }}
      >
        <div
          className="flex items-center justify-around relative"
          style={{ height: '72px' }}
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
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              marginTop: '-22px',
              background: isActive
                ? 'linear-gradient(135deg, var(--accent-light), var(--accent))'
                : 'linear-gradient(135deg, var(--accent-light), var(--accent-dark))',
              boxShadow: '0 6px 20px rgba(243, 129, 85, 0.35), 0 0 0 4px var(--bg-app)',
              border: 'none',
              flexShrink: 0,
            })}
          >
            <ScannerLinear size={22} className="text-white" />
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
