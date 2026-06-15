import { useState, useEffect } from 'react';

export default function Auth({ onAuthSuccess }) {
  const [authMode, setAuthMode] = useState('login');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
      if (!clientId) return;
      window.google?.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredentialResponse
      });
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleGoogleCredentialResponse = async (response) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Google authentication failed.');
      localStorage.setItem('token', data.token);
      onAuthSuccess(data.user);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerGoogleSocialAuth = () => {
    if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      setErrorMessage('Google OAuth is not configured on the client.');
      return;
    }
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed()) {
          setErrorMessage('Unable to show Google sign-in prompt. Please try again.');
        }
      });
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const emailLower = formData.email.toLowerCase();
    const endpoint = authMode === 'login' ? 'login' : 'register';

    try {
        const response = await fetch(`/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: emailLower,
          password: formData.password,
          role: authMode === 'register' ? 'customer' : undefined
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed.');
      }

      localStorage.setItem('token', data.token);
      alert(authMode === 'login' ? 'Signed in successfully!' : 'Account created!');
      onAuthSuccess(data.user);

    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // const triggerGoogleSocialAuth = () => {
  //   alert("OAuth2 Redirect: Contacting Google Identity federation server arrays...");
  // };

  return (
    <div className="animate-fade-in" style={{
      display: 'flex',
      minHeight: 'calc(100vh - var(--header-height))',
      backgroundColor: '#ffffff'
    }}>
      
      {/* Left Column: Brand Editorial Visual Panel */}
      <div className="auth-visual-panel" style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '64px',
        color: '#ffffff'
      }}>
        {/* Background Image with Dark Brand Color Overlay */}
        <img
          src="/hero_tech_showcase.png"
          alt="TechNova Brand Visual"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 1
          }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(62, 10, 54, 0.88) 0%, rgba(11, 15, 25, 0.92) 100%)',
          zIndex: 2
        }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 3, maxWidth: '440px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '24px' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: '900', letterSpacing: '-0.03em', color: '#ffffff' }}>BEN-TECHNOVA</span>
            <span style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--color-secondary)', letterSpacing: '0.15em', borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '6px', marginLeft: '4px' }}>GHANA</span>
          </div>
          
          <h2 style={{ fontSize: '2rem', color: '#ffffff', fontWeight: '800', lineHeight: '1.1', marginBottom: '16px', letterSpacing: '-0.03em' }}>
            ELEVATE YOUR DIGITAL WORKSPACE
          </h2>
          
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', lineHeight: '1.7' }}>
            Register or sign in to synchronize your order histories, secure warranty logs, and get priority access to restocks across Accra, Kumasi, Tema, and Tamale.
          </p>
        </div>
      </div>

      {/* Right Column: Clean Form Panel */}
      <div className="auth-form-panel" style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        backgroundColor: '#ffffff'
      }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>
          
          {/* Mobile-only logo */}
          <div className="auth-mobile-logo-only" style={{ marginBottom: '28px', display: 'none', justifyContent: 'center' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '950',
              fontSize: '1rem'
            }}>
              TN
            </div>
          </div>

          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', letterSpacing: '-0.02em' }}>
            {authMode === 'login' ? 'WELCOME BACK' : 'CREATE ACCOUNT'}
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '32px' }}>
            {authMode === 'login'
              ? 'Sign in to access your dashboard'
              : 'Join TechNova Ghana for premium electronics'}
          </p>

          {/* Mode Switcher Tabs */}
          {authMode !== 'forgot' && (
            <div style={{
              display: 'flex',
              borderBottom: '1px solid var(--border-color)',
              marginBottom: '28px'
            }}>
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setErrorMessage(''); }}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: authMode === 'login' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  borderBottom: authMode === 'login' ? '2px solid var(--color-primary)' : '2px solid transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('register'); setErrorMessage(''); }}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: authMode === 'register' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  borderBottom: authMode === 'register' ? '2px solid var(--color-primary)' : '2px solid transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                Register
              </button>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: 'rgba(198, 40, 40, 0.05)',
              color: 'var(--color-error)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '24px'
            }}>
              <i className="bi bi-exclamation-triangle-fill" />
              {errorMessage}
            </div>
          )}

          {/* Forms */}
          {authMode !== 'forgot' ? (
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {authMode === 'register' && (
                <div className="form-group-premium">
                  <label className="form-label-premium">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="form-input-premium"
                    disabled={isLoading}
                  />
                </div>
              )}

              <div className="form-group-premium">
                <label className="form-label-premium">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="form-input-premium"
                  disabled={isLoading}
                />
              </div>

              <div className="form-group-premium">
                <label className="form-label-premium">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="form-input-premium"
                  disabled={isLoading}
                />
              </div>

              {authMode === 'login' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-4px' }}>
                  <span
                    onClick={() => setAuthMode('forgot')}
                    style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--color-primary)', cursor: 'pointer', letterSpacing: '0.02em', textTransform: 'uppercase' }}
                  >
                    Forgot Password?
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '8px', padding: '14px' }}
              >
                {isLoading ? 'PROCESSING...' : authMode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
              </button>
            </form>
          ) : (
            /* Forgot Password */
            <form
              onSubmit={(e) => { e.preventDefault(); alert("Reset link sent."); setAuthMode('login'); }}
              style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}
            >
              <h4 style={{ fontSize: '0.9rem', fontWeight: '800', marginBottom: '4px' }}>RESET YOUR PASSWORD</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: '1.5', marginBottom: '8px' }}>
                Enter your registered email address and we'll send you a password reset link.
              </p>
              
              <div className="form-group-premium">
                <label className="form-label-premium">Email Address</label>
                <input type="email" required placeholder="your-email@domain.com" className="form-input-premium" />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setAuthMode('login')} className="btn btn-outline" style={{ flex: 1, padding: '12px' }}>
                  CANCEL
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2, padding: '12px' }}>
                  SEND LINK
                </button>
              </div>
            </form>
          )}

          {/* Social Sign-In */}
          {authMode !== 'forgot' && (
            <>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                margin: '28px 0 24px',
                position: 'relative'
              }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
                <span style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 12px' }}>
                  or continue with
                </span>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
              </div>

              <button
                type="button"
                onClick={triggerGoogleSocialAuth}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: '#ffffff',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  color: 'var(--color-text-primary)',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-secondary-light)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
            </>
          )}

        </div>
      </div>

      {/* Split Responsive Styling Injection */}
      <style>{`
        @media (max-width: 900px) {
          .auth-visual-panel {
            display: none !important;
          }
          .auth-mobile-logo-only {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}