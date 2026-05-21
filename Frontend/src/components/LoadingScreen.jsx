import { Loader2 } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#0c1015',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '24px',
        textAlign: 'center',
      }}
      className="corner-glow"
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: '320px',
        }}
        className="animate-fade-in-up"
      >
        {/* Animated Avatar / Ring */}
        <div
          style={{
            position: 'relative',
            width: '90px',
            height: '90px',
            borderRadius: '28px',
            border: '2px solid rgba(200, 149, 108, 0.25)',
            padding: '4px',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(200, 149, 108, 0.15)',
          }}
        >
          <img
            src="/lucy-avatar.png"
            alt="Lucy"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '22px',
            }}
          />
          {/* Pulsing ring around avatar */}
          <div
            style={{
              position: 'absolute',
              inset: '-6px',
              borderRadius: '34px',
              border: '1.5px solid var(--accent)',
              opacity: 0.5,
            }}
            className="animate-pulse-glow"
          />
        </div>

        {/* Brand Title */}
        <p
          style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            fontFamily: "'Space Mono', monospace",
            marginBottom: '10px',
          }}
        >
          LUCY'S POCKET DIARY
        </p>

        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            color: 'var(--text-primary)',
            fontSize: '26px',
            fontWeight: 700,
            lineHeight: 1.2,
            marginBottom: '20px',
          }}
        >
          Hey, it's me.
        </h1>

        {/* Ambient quote */}
        <p
          style={{
            fontSize: '13px',
            fontStyle: 'italic',
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            marginBottom: '32px',
            minHeight: '40px',
          }}
        >
          "I started recording because I didn't want to forget."
        </p>

        {/* Spinner */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Loader2 size={18} className="animate-spin-slow" style={{ color: 'var(--accent)' }} />
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              fontFamily: "'Space Mono', monospace",
            }}
          >
            Opening diary
          </span>
        </div>
      </div>
    </div>
  );
}
