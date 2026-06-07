import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AltArrowRightLinear } from '@solar-icons/react-perf';

const STEPS = [
  {
    title: "A Hidden Story.",
    description: "Lucy left behind a pocket video diary. She documented her walks, her favourite spots, and her secrets. But she didn't make it easy to find.",
    image: "/onboarding-diary.png",
  },
  {
    title: "Interact & Unlock.",
    description: "To reveal the next days of her diary, you must complete challenges. Scan QR codes at her routes, photograph the sky, or wait as the timer runs down.",
    image: "/onboarding-unlock.png",
  },
  {
    title: "Selfie with Lucy.",
    description: "Visit her locations and take a selfie. Lucy will gently join your photos — documenting that you were there too.",
    image: "/onboarding-selfie.png",
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
        backgroundColor: '#FFFFFF',
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
          minHeight: '100%',
          width: '100%',
          maxWidth: '480px',
          margin: '0 auto',
          padding: isShortScreen ? '24px 20px 32px' : '40px 24px 48px',
          boxSizing: 'border-box',
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: isShortScreen ? '20px' : '40px',
            flexShrink: 0,
          }}
        >
          {/* L/D Brand Mark */}
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: '1px solid var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'Space Mono', monospace",
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text-primary)',
            }}
          >
            L/D
          </div>

          {/* Minimal 3-line Menu Icon */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ width: '18px', height: '1.5px', backgroundColor: 'var(--text-primary)' }} />
            <div style={{ width: '18px', height: '1.5px', backgroundColor: 'var(--text-primary)' }} />
            <div style={{ width: '18px', height: '1.5px', backgroundColor: 'var(--text-primary)' }} />
          </div>
        </div>

        {/* Illustration Container */}
        <div
          style={{
            flex: '1 1 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: isShortScreen ? '24px' : '40px',
          }}
        >
          <img
            src={activeStep.image}
            alt={activeStep.title}
            style={{
              maxHeight: isShortScreen ? '220px' : '300px',
              maxWidth: '100%',
              objectFit: 'contain',
            }}
            className="animate-fade-in-up"
          />
        </div>

        {/* Text and Actions */}
        <div style={{ flexShrink: 0 }}>
          {/* Title */}
          <h2
            className="font-serif"
            style={{
              color: 'var(--text-primary)',
              fontSize: isShortScreen ? '28px' : '34px',
              fontWeight: 700,
              lineHeight: 1.15,
              marginBottom: '12px',
              textAlign: 'left',
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
              marginBottom: isShortScreen ? '24px' : '36px',
              textAlign: 'left',
              maxWidth: '95%',
            }}
          >
            {activeStep.description}
          </p>

          {/* Progress Indicators */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            {STEPS.map((_, i) => (
              <div
                key={i}
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: i === currentStep ? 'var(--text-primary)' : 'rgba(0, 0, 0, 0.15)',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>

          {/* Thin Divider Line */}
          <div
            style={{
              width: '100%',
              height: '1px',
              backgroundColor: 'rgba(0, 0, 0, 0.08)',
              marginBottom: '12px',
            }}
          />

          {/* Bottom Next Step Row */}
          <div
            onClick={handleNext}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              padding: '8px 0 12px',
            }}
            className="group"
          >
            <span
              className="font-serif"
              style={{
                fontSize: '17px',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              {currentStep === STEPS.length - 1 ? "Start exploring." : STEPS[currentStep + 1].title}
            </span>
            <AltArrowRightLinear
              size={18}
              style={{
                color: 'var(--text-primary)',
                transition: 'transform 0.2s ease',
              }}
              className="group-hover:translate-x-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
