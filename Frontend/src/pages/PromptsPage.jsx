import { useApp } from '../context/AppContext';
import { CameraLinear, StarsLinear } from '@solar-icons/react-perf';
import { useNavigate } from 'react-router-dom';

export default function PromptsPage() {
  const { entries } = useApp();
  const navigate = useNavigate();

  const cameraEntries = entries.filter(e => e.lockType === 'camera');

  return (
    <div id="prompts-page" className="pb-safe" style={{ padding: '28px 16px 0' }}>
      {/* Header */}
      <div className="animate-fade-in-up" style={{ marginBottom: '28px' }}>
        <p
          style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            fontFamily: "'Space Mono', monospace",
            marginBottom: '10px',
          }}
        >
          CAMERA PROMPTS
        </p>
        <h1
          style={{
            fontFamily: "'Outfit', sans-serif",
            color: 'var(--text-primary)',
            fontSize: '30px',
            fontWeight: 700,
            lineHeight: 1.15,
            marginBottom: '14px',
          }}
        >
          Some entries are<br />hiding in plain sight.
        </h1>
        <p
          style={{
            fontSize: '14px',
            lineHeight: 1.65,
            color: 'var(--text-secondary)',
          }}
        >
          Lucy left clues. Photograph what she asks for and the next page of her diary opens.
        </p>
      </div>

      {/* Prompt cards */}
      <div className="flex flex-col" style={{ gap: '12px' }}>
        {cameraEntries.map((entry, index) => (
          <div
            key={entry.id}
            className="flex items-center animate-fade-in-up"
            style={{
              gap: '16px',
              padding: '18px 16px',
              borderRadius: '20px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              boxShadow: 'var(--card-shadow)',
              animationDelay: `${(index + 1) * 0.1}s`,
              animationFillMode: 'backwards',
            }}
          >
            {/* Camera icon */}
            <div
              className="flex items-center justify-center shrink-0"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'var(--accent-glow)',
                border: '1px solid var(--accent-glow-strong)',
              }}
            >
              <CameraLinear size={20} style={{ color: 'var(--accent)' }} />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'var(--accent)',
                  fontFamily: "'Space Mono', monospace",
                  marginBottom: '4px',
                }}
              >
                DAY {entry.day} · {entry.title.toUpperCase()}
              </p>
              <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                {entry.cameraPrompt}
              </p>
            </div>

            {/* Try button */}
            <button
              onClick={() => navigate('/selfie')}
              className="flex items-center shrink-0 font-semibold transition-transform active:scale-90"
              style={{
                gap: '6px',
                padding: '10px 18px',
                borderRadius: '999px',
                fontSize: '13px',
                background: 'linear-gradient(135deg, var(--accent-light), var(--accent-dark))',
                color: 'white',
                border: 'none',
                boxShadow: '0 2px 10px rgba(243, 129, 85, 0.25)',
              }}
            >
              <StarsLinear size={13} />
              Try
            </button>
          </div>
        ))}
      </div>

      {cameraEntries.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center" style={{ paddingTop: '80px' }}>
          <CameraLinear size={44} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>
            No camera prompts yet.
          </p>
          <p style={{ fontSize: '13px', marginTop: '6px', color: 'var(--text-muted)' }}>
            Keep watching Lucy's diary for clues.
          </p>
        </div>
      )}
    </div>
  );
}
