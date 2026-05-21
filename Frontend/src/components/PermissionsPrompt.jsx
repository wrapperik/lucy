import { useApp } from '../context/AppContext';
import { Camera, Check, ShieldAlert } from 'lucide-react';
import { useState } from 'react';

export default function PermissionsPrompt({ onProceed }) {
  const { requestCameraPermission } = useApp();
  const [requesting, setRequesting] = useState(false);

  const handleGrant = async () => {
    setRequesting(true);
    await requestCameraPermission();
    setRequesting(false);
    if (onProceed) onProceed();
  };

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
        zIndex: 9980,
        padding: '24px',
        textAlign: 'center',
      }}
      className="corner-glow"
    >
      <div
        className="animate-fade-in-up"
        style={{
          background: 'linear-gradient(160deg, var(--bg-card-elevated) 0%, var(--bg-card) 100%)',
          border: '1px solid var(--border-card)',
          borderRadius: '24px',
          padding: '36px 24px',
          boxShadow: 'var(--card-shadow)',
          maxWidth: '360px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Animated Camera Icon */}
        <div
          style={{
            width: '76px',
            height: '76px',
            borderRadius: '50%',
            background: 'var(--accent-glow)',
            border: '1px solid var(--accent-glow-strong)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px',
          }}
          className="animate-float"
        >
          <Camera size={32} style={{ color: 'var(--accent)' }} />
        </div>

        {/* Title */}
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            color: 'var(--text-primary)',
            fontSize: '22px',
            fontWeight: 700,
            marginBottom: '10px',
            lineHeight: 1.25,
          }}
        >
          Enable Camera Access
        </h2>

        {/* Description */}
        <p
          style={{
            fontSize: '13.5px',
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            marginBottom: '28px',
          }}
        >
          Lucy's diary contains interactive prompts. To scan hidden QR codes or take a selfie for the AI composite, the app needs access to your camera.
        </p>

        {/* Features Bullet List */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginBottom: '32px',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: 'rgba(34, 197, 94, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '2px',
                flexShrink: 0,
              }}
            >
              <Check size={11} style={{ color: '#22c55e' }} />
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-primary)', margin: 0 }}>
              <strong>QR Code Scanner:</strong> Scan clues at physical landmarks to unlock entries.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: 'rgba(34, 197, 94, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '2px',
                flexShrink: 0,
              }}
            >
              <Check size={11} style={{ color: '#22c55e' }} />
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-primary)', margin: 0 }}>
              <strong>AI Compositing:</strong> Take a photo to blend with Lucy's avatar portrait.
            </p>
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={handleGrant}
          disabled={requesting}
          className="flex items-center justify-center font-semibold transition-transform active:scale-95 w-full"
          style={{
            gap: '8px',
            padding: '15px',
            borderRadius: '14px',
            fontSize: '14px',
            background: 'linear-gradient(135deg, var(--accent-light), var(--accent-dark))',
            color: 'white',
            border: 'none',
            boxShadow: '0 4px 16px rgba(200, 149, 108, 0.2)',
            cursor: requesting ? 'wait' : 'pointer',
            marginBottom: '12px',
          }}
        >
          {requesting ? 'Activating camera...' : 'Grant Access'}
        </button>

        <button
          onClick={onProceed}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          Maybe later
        </button>
      </div>

      {/* Trust disclaimer */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '24px', color: 'var(--text-muted)' }}>
        <ShieldAlert size={14} />
        <span style={{ fontSize: '12px' }}>Your images are processed locally on your device.</span>
      </div>
    </div>
  );
}
