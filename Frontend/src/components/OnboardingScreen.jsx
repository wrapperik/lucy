import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRight, QrCode, Sparkles, BookOpen, Camera } from 'lucide-react';

const STEPS = [
  {
    title: "A Hidden Story",
    description: "Lucy left behind a pocket video diary. She documented her walks, her favourite spots, and her secrets. But she didn't make it easy to find.",
    icon: <BookOpen size={36} style={{ color: 'var(--accent)' }} />,
  },
  {
    title: "Interact & Unlock",
    description: "To reveal the next days of her diary, you must complete challenges. Scan QR codes at her routes, photograph the sky, or wait as the timer runs down.",
    icon: <QrCode size={36} style={{ color: 'var(--accent)' }} />,
  },
  {
    title: "Selfie with Lucy",
    description: "Visit her locations and take a selfie. Through ambient AI compositing, Lucy will gently join your photos — documenting that you were there too.",
    icon: <Sparkles size={36} style={{ color: 'var(--accent)' }} />,
  },
];

export default function OnboardingScreen() {
  const { completeOnboarding } = useApp();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const activeStep = STEPS[currentStep];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#0c1015',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        zIndex: 9990,
        padding: '40px 24px 60px',
        textAlign: 'center',
      }}
      className="corner-glow"
    >
      {/* Top logo */}
      <div className="flex items-center justify-center" style={{ marginTop: '20px' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '16px',
            border: '1px solid rgba(200, 149, 108, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--accent-glow)',
          }}
        >
          <BookOpen size={20} style={{ color: 'var(--accent)' }} />
        </div>
      </div>

      {/* Main card */}
      <div
        key={currentStep}
        className="animate-fade-in-up"
        style={{
          background: 'linear-gradient(160deg, var(--bg-card-elevated) 0%, var(--bg-card) 100%)',
          border: '1px solid var(--border-card)',
          borderRadius: '24px',
          padding: '40px 24px 32px',
          boxShadow: 'var(--card-shadow)',
          maxWidth: '360px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Step Icon */}
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
            marginBottom: '28px',
          }}
          className="animate-float"
        >
          {activeStep.icon}
        </div>

        {/* Brand label */}
        <p
          style={{
            fontSize: '9px',
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            fontFamily: "'Space Mono', monospace",
            marginBottom: '8px',
          }}
        >
          CHAPTER {currentStep + 1} OF 3
        </p>

        {/* Title */}
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            color: 'var(--text-primary)',
            fontSize: '24px',
            fontWeight: 700,
            marginBottom: '14px',
            lineHeight: 1.25,
          }}
        >
          {activeStep.title}
        </h2>

        {/* Description */}
        <p
          style={{
            fontSize: '13.5px',
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            margin: 0,
          }}
        >
          {activeStep.description}
        </p>
      </div>

      {/* Bottom controls */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          maxWidth: '360px',
          margin: '0 auto w-full',
          width: '100%',
        }}
      >
        {/* Steps indicator dots */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === currentStep ? '24px' : '8px',
                height: '8px',
                borderRadius: '99px',
                background: i === currentStep ? 'var(--accent)' : 'var(--text-muted)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={handleNext}
          className="flex items-center justify-center font-semibold transition-transform active:scale-95 w-full"
          style={{
            gap: '8px',
            padding: '16px',
            borderRadius: '16px',
            fontSize: '15px',
            background: 'linear-gradient(135deg, var(--accent-light), var(--accent-dark))',
            color: 'white',
            border: 'none',
            boxShadow: '0 8px 28px rgba(200, 149, 108, 0.25)',
            cursor: 'pointer',
          }}
        >
          {currentStep === STEPS.length - 1 ? "Start exploring" : "Continue"}
          <ArrowRight size={16} />
        </button>

        {/* Skip button */}
        {currentStep < STEPS.length - 1 && (
          <button
            onClick={completeOnboarding}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            Skip walkthrough
          </button>
        )}
      </div>
    </div>
  );
}
