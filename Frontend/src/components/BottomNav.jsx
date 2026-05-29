/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
      className={({ isActive }) =>
        `flex flex-col items-center transition-all duration-300 relative z-10 ${isActive ? 'active-nav-item' : ''
        }`
      }
      style={({ isActive }) => ({
        gap: '4px',
        padding: '6px 12px',
        borderRadius: '24px',
        minWidth: '60px',
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={20} strokeWidth={isActive ? 2 : 1.7} />
          </div>
          <span
            style={{
              fontSize: '10px',
              fontWeight: isActive ? 600 : 500,
              letterSpacing: '0.04em',
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
  const location = useLocation();
  const containerRef = useRef(null);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, height: 0, top: 0, opacity: 0 });

  useEffect(() => {
    const updatePill = () => {
      if (!containerRef.current) return;
      const activeEl = containerRef.current.querySelector('.active-nav-item');
      if (activeEl) {
        const parentRect = containerRef.current.getBoundingClientRect();
        const activeRect = activeEl.getBoundingClientRect();
        setPillStyle({
          left: activeRect.left - parentRect.left,
          width: activeRect.width,
          height: activeRect.height,
          top: activeRect.top - parentRect.top,
          opacity: 1,
        });
      } else {
        setPillStyle((prev) => ({ ...prev, opacity: 0 }));
      }
    };

    updatePill();
    const timer = setTimeout(updatePill, 50);

    // Add window resize listener to keep pill aligned perfectly
    window.addEventListener('resize', updatePill);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePill);
    };
  }, [location.pathname]);

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
          ref={containerRef}
          className="flex items-center justify-around relative"
          style={{ height: '72px' }}
        >
          {/* Smoothly sliding background pill */}
          <div
            className="absolute transition-all duration-300 ease-out z-0"
            style={{
              left: `${pillStyle.left}px`,
              width: `${pillStyle.width}px`,
              height: `${pillStyle.height}px`,
              top: `${pillStyle.top}px`,
              opacity: pillStyle.opacity,
              background: 'var(--accent-glow)',
              border: '1px solid var(--accent-glow-strong)',
              borderRadius: '24px',
              pointerEvents: 'none',
            }}
          />

          {/* Left nav items */}
          {leftItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}

          {/* Center scan button — elevated circle */}
          <NavLink
            to="/scan"
            className="relative flex items-center justify-center transition-transform active:scale-90 z-10"
            style={({ isActive }) => ({
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              marginTop: '-22px',
              background: isActive
                ? 'linear-gradient(135deg, var(--accent-light), var(--accent))'
                : 'linear-gradient(135deg, var(--accent-light), var(--accent-dark))',
              boxShadow: '0 6px 20px rgba(243, 130, 85, 0.59), 0 0 0 4px var(--bg-app)',
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

