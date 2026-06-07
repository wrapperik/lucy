/* eslint-disable no-unused-vars */
import { NavLink } from 'react-router-dom';
import { Widget3Linear, StarsLinear, ScannerLinear, SettingsLinear } from '@solar-icons/react-perf';

const navItems = [
  { to: '/', icon: Widget3Linear, label: 'Diary' },
  { to: '/selfie', icon: StarsLinear, label: 'Selfie' },
  { to: '/scan', icon: ScannerLinear, label: 'Scan' },
  { to: '/settings', icon: SettingsLinear, label: 'Settings' },
];

function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center transition-colors duration-200 py-1 w-full ${
          isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
        }`
      }
      style={{
        textDecoration: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {({ isActive }) => (
        <>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '3px',
            }}
          >
            <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
          </div>
          <span
            style={{
              fontSize: '10px',
              fontWeight: isActive ? 600 : 500,
              letterSpacing: '0.02em',
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
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        zIndex: 9999,
        background: 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(0, 0, 0, 0.05)',
        boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.02)',
        paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 0px))',
        paddingTop: '8px',
      }}
      className="animate-fade-in-up"
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          width: '100%',
          maxWidth: '480px',
          margin: '0 auto',
          padding: '0 12px',
        }}
      >
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </div>
    </nav>
  );
}
