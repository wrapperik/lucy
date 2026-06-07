import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LockLinear, LetterLinear, UserLinear, StarsLinear, CheckCircleLinear, ShieldWarningLinear, AltArrowRightLinear } from '@solar-icons/react-perf';

export default function AuthScreen() {
  const { registerUser, loginUser } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form values
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [adminCode, setAdminCode] = useState('');

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
        if (role === 'admin' && !adminCode) {
          setError('Please enter the Director Verification Code');
          setLoading(false);
          return;
        }
        const res = await registerUser(username, email, password, role, adminCode);
        if (res.success) {
          window.history.replaceState({}, '', '/');
          setSuccess(true);
          // currentUser is set in context → App.jsx re-renders past the auth gate
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
          window.history.replaceState({}, '', '/');
          setSuccess(true);
          // currentUser is set in context → App.jsx re-renders past the auth gate
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
        {/* Title */}
        <h2
          className="font-serif"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            color: 'var(--text-primary)',
            fontSize: '28px',
            fontWeight: 700,
            marginBottom: '6px',
          }}
        >
          {isSignUp ? 'Create your profile.' : 'Welcome to Lucy.'}
        </h2>

        <p
          style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            marginBottom: '28px',
          }}
        >
          {isSignUp
            ? 'Set up your account to save and synchronize your journey progress.'
            : 'Sign in to access your diary entries and continue where you left off.'}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Role Selector (Sign Up only) */}
          {isSignUp && (
            <div style={{
              display: 'flex',
              background: 'var(--bg-card-inner)',
              border: '1px solid var(--border-card)',
              borderRadius: '12px',
              padding: '4px',
              marginBottom: '4px',
              width: '100%',
            }}>
              <button
                type="button"
                onClick={() => { setRole('user'); setError(''); }}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '9px',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: role === 'user' ? 'linear-gradient(135deg, var(--accent-light), var(--accent))' : 'transparent',
                  color: role === 'user' ? 'white' : 'var(--text-secondary)',
                  boxShadow: role === 'user' ? '0 2px 8px rgba(0, 0, 0, 0.08)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                Traveler
              </button>
              <button
                type="button"
                onClick={() => { setRole('admin'); setError(''); }}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '9px',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: role === 'admin' ? 'linear-gradient(135deg, var(--accent-light), var(--accent))' : 'transparent',
                  color: role === 'admin' ? 'white' : 'var(--text-secondary)',
                  boxShadow: role === 'admin' ? '0 2px 8px rgba(0, 0, 0, 0.08)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                Director
              </button>
            </div>
          )}

          {/* Director Verification Code (Sign Up + Admin only) */}
          {isSignUp && role === 'admin' && (
            <div style={{ position: 'relative', width: '100%' }}>
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <LockLinear size={16} />
              </span>
              <input
                type="password"
                placeholder="Director Verification Code"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
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

          {/* Username (Sign Up only) */}
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

          {/* Email / Username */}
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

          {/* Password */}
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
              <span>Success! Loading your journey...</span>
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
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
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
            setRole('user');
            setAdminCode('');
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
      </div>
    </div>
  );
}
