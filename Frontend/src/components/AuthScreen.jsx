import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, Mail, User, Loader2, Check, AlertCircle, ArrowRight, BookOpen } from 'lucide-react';

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
    } catch (err) {
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
        backgroundColor: '#0c1015',
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
        {/* App Logo Emblem */}
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '18px',
            border: '1px solid rgba(200, 149, 108, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--accent-glow)',
            marginBottom: '18px',
          }}
          className="animate-float"
        >
          <BookOpen size={24} style={{ color: 'var(--accent)' }} />
        </div>

        {/* Title */}
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
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
                <User size={16} />
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
              <Mail size={16} />
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
              <Lock size={16} />
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
              <AlertCircle size={14} style={{ flexShrink: 0 }} />
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
              <Check size={14} style={{ flexShrink: 0 }} />
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
              boxShadow: '0 4px 16px rgba(200, 149, 108, 0.2)',
              cursor: loading || success ? 'wait' : 'pointer',
              marginTop: '8px',
            }}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin-slow" />
            ) : isSignUp ? (
              'Create Profile'
            ) : (
              'Sign In'
            )}
            {!loading && <ArrowRight size={15} />}
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
