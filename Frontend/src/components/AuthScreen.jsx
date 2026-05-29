import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LockLinear, LetterLinear, UserLinear, StarsLinear, CheckCircleLinear, ShieldWarningLinear, AltArrowRightLinear, Book2Linear } from '@solar-icons/react-perf';

export default function AuthScreen({ onComplete }) {
  const { registerUser, loginUser } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form values
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!username || !email || !password) {
          setError('Please fill in all fields');
          setLoading(false);
          return;
        }
        const res = await registerUser(username, email, password);
        if (res.success) {
          setSuccess(true);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 1500);
        } else {
          setError(res.error);
        }
      } else {
        if (!email || !password) {
          setError('Please enter your credentials');
          setLoading(false);
          return;
        }
        const res = await loginUser(email, password);
        if (res.success) {
          setSuccess(true);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 1500);
        } else {
          setError(res.error);
        }
      }
    } catch {
      setError('Connection to backend failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--bg-app)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9970,
        padding: '24px',
        textAlign: 'center',
      }}
      className="corner-glow"
    >
      <div
        className="animate-fade-in-up"
        style={{
          background: 'transparent',
          border: 'none',
          padding: '20px 12px',
          boxShadow: 'none',
          maxWidth: '360px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* App Logo Emblem */}
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '18px',
            border: '1px solid var(--accent-glow-strong)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--accent-glow)',
            marginBottom: '18px',
          }}
          className="animate-float"
        >
            <Book2Linear size={24} style={{ color: 'var(--accent)' }} />
        </div>

        {/* Title */}
        <h2
          style={{
            fontFamily: "'Outfit', sans-serif",
            color: 'var(--text-primary)',
            fontSize: '24px',
            fontWeight: 700,
            marginBottom: '6px',
          }}
        >
          {isSignUp ? 'Create your profile' : 'Sign in to Lucy'}
        </h2>

        <p
          style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            marginBottom: '28px',
          }}
        >
          {isSignUp
            ? 'Track your journey and synchronize your progress with MongoDB Atlas.'
            : 'Access your unlocked diary entries and selfies from any device.'}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {isSignUp && (
            <div style={{ position: 'relative', width: '100%' }}>
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <UserLinear size={16} />
              </span>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 44px',
                  borderRadius: '14px',
                  fontSize: '14px',
                  background: 'var(--bg-card-inner)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-card)',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
            </div>
          )}

          <div style={{ position: 'relative', width: '100%' }}>
            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <LetterLinear size={16} />
            </span>
            <input
              type="text"
              placeholder={isSignUp ? 'Email address' : 'Username or Email'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px 14px 44px',
                borderRadius: '14px',
                fontSize: '14px',
                background: 'var(--bg-card-inner)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-card)',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ position: 'relative', width: '100%' }}>
            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <LockLinear size={16} />
            </span>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px 14px 44px',
                borderRadius: '14px',
                fontSize: '14px',
                background: 'var(--bg-card-inner)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-card)',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
          </div>

          {/* Feedback toasts */}
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#ef4444',
                fontSize: '12px',
                textAlign: 'left',
              }}
            >
              <ShieldWarningLinear size={14} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'rgba(34, 197, 94, 0.08)',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                color: '#22c55e',
                fontSize: '12px',
                textAlign: 'left',
              }}
            >
              <CheckCircleLinear size={14} style={{ flexShrink: 0 }} />
              <span>Success! Synchronizing profile...</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || success}
            className="flex items-center justify-center font-semibold transition-transform active:scale-95 w-full"
            style={{
              gap: '8px',
              padding: '14px',
              borderRadius: '14px',
              fontSize: '14px',
              background: 'linear-gradient(135deg, var(--accent-light), var(--accent-dark))',
              color: 'white',
              border: 'none',
              boxShadow: '0 4px 16px rgba(243, 129, 85, 0.25)',
              cursor: loading || success ? 'wait' : 'pointer',
              marginTop: '8px',
            }}
          >
            {loading ? (
              <StarsLinear size={16} className="animate-spin-slow" />
            ) : isSignUp ? (
              'Create Profile'
            ) : (
              'Sign In'
            )}
            {!loading && <AltArrowRightLinear size={15} />}
          </button>
        </form>

        {/* Toggle Mode */}
        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError('');
          }}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--accent)',
            cursor: 'pointer',
            marginTop: '20px',
          }}
        >
          {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
        </button>

        {/* Guest Skip */}
        <button
          onClick={onComplete}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--text-muted)',
            cursor: 'pointer',
            marginTop: '12px',
          }}
        >
          Continue as Guest
        </button>
      </div>
    </div>
  );
}
