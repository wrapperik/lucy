import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AltArrowRightLinear, QrCodeLinear, StarsLinear, Book2Linear } from '@solar-icons/react-perf';

const STEPS = [
  {
    title: "A Hidden Story",
    description: "Lucy left behind a pocket video diary. She documented her walks, her favourite spots, and her secrets. But she didn't make it easy to find.",
    icon: <Book2Linear style={{ width: '100%', height: '100%', color: 'var(--accent)' }} />,
  },
  {
    title: "Interact & Unlock",
    description: "To reveal the next days of her diary, you must complete challenges. Scan QR codes at her routes, photograph the sky, or wait as the timer runs down.",
    icon: <QrCodeLinear style={{ width: '100%', height: '100%', color: 'var(--accent)' }} />,
  },
  {
    title: "Selfie with Lucy",
    description: "Visit her locations and take a selfie. Lucy will gently join your photos — documenting that you were there too.",
    icon: <StarsLinear style={{ width: '100%', height: '100%', color: 'var(--accent)' }} />,
  },
];

export default function OnboardingScreen() {
  const { completeOnboarding } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [isShortScreen, setIsShortScreen] = useState(false);

  // Detect short screens (like iPhone SE) to dynamically adjust layout sizes
  useEffect(() => {
    const handleResize = () => {
      setIsShortScreen(window.innerHeight < 680);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        backgroundColor: 'var(--bg-app)',
        zIndex: 9990,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        display: 'flex',
        flexDirection: 'column',
      }}
      className="corner-glow"
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '100%',
          width: '100%',
          maxWidth: '480px',
          margin: '0 auto',
          padding: isShortScreen ? '24px 20px 32px' : '40px 24px 60px',
          boxSizing: 'border-box',
          gap: '24px',
        }}
      >
        {/* Top logo */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexShrink: 0
          }}
        >
          <div
            style={{
              width: isShortScreen ? '36px' : '48px',
              height: isShortScreen ? '36px' : '48px',
              borderRadius: '12px',
              border: '1px solid var(--accent-glow-strong)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--accent-glow)',
            }}
          >
            <Book2Linear size={isShortScreen ? 16 : 20} style={{ color: 'var(--accent)' }} />
          </div>
        </div>

        {/* Main Card container */}
        <div
          style={{
            flex: '1 1 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <div
            key={currentStep}
            className="animate-fade-in-up"
            style={{
              background: 'transparent',
              border: 'none',
              padding: isShortScreen ? '12px 10px' : '20px 12px',
              boxShadow: 'none',
              width: '100%',
              maxWidth: '360px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxSizing: 'border-box',
            }}
          >
            {/* Step Icon */}
            <div
              style={{
                width: isShortScreen ? '56px' : '76px',
                height: isShortScreen ? '56px' : '76px',
                borderRadius: '50%',
                background: 'var(--accent-glow)',
                border: '1px solid var(--accent-glow-strong)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: isShortScreen ? '14px' : '20px',
                marginBottom: isShortScreen ? '16px' : '28px',
                boxSizing: 'border-box',
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
                marginBottom: isShortScreen ? '6px' : '8px',
                margin: 0,
              }}
            >
              CHAPTER {currentStep + 1} OF 3
            </p>

            {/* Title */}
            <h2
              style={{
                fontFamily: "'Outfit', sans-serif",
                color: 'var(--text-primary)',
                fontSize: isShortScreen ? '20px' : '24px',
                fontWeight: 700,
                marginBottom: isShortScreen ? '10px' : '14px',
                lineHeight: 1.25,
                marginTop: '4px',
              }}
            >
              {activeStep.title}
            </h2>

            {/* Description */}
            <p
              style={{
                fontSize: isShortScreen ? '12.5px' : '13.5px',
                lineHeight: 1.6,
                color: 'var(--text-secondary)',
                margin: 0,
                textAlign: 'center',
              }}
            >
              {activeStep.description}
            </p>
          </div>
        </div>

        {/* Bottom controls */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: isShortScreen ? '16px' : '24px',
            width: '100%',
            maxWidth: '360px',
            margin: '0 auto',
            flexShrink: 0,
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
              padding: isShortScreen ? '14px' : '16px',
              borderRadius: '16px',
              fontSize: '15px',
              background: 'linear-gradient(135deg, var(--accent-light), var(--accent-dark))',
              color: 'white',
              border: 'none',
              boxShadow: '0 8px 28px rgba(243, 129, 85, 0.25)',
              cursor: 'pointer',
              boxSizing: 'border-box',
            }}
          >
            {currentStep === STEPS.length - 1 ? "Start exploring" : "Continue"}
            <AltArrowRightLinear size={16} />
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
                padding: '4px',
              }}
            >
              Skip walkthrough
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
