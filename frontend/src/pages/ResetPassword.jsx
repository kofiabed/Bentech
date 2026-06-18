import { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function ResetPassword({ onRedirectToLogin }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setMessage('Password updated successfully! Redirecting to login...');
      setTimeout(() => {
        onRedirectToLogin();
      }, 3000);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{
      display: 'flex',
      minHeight: 'calc(100vh - var(--header-height))',
      backgroundColor: '#ffffff',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '40px 32px',
        boxShadow: '0 10px 45px rgba(62, 10, 54, 0.04)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-secondary-light)',
            color: 'var(--color-primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            fontWeight: '900',
            marginBottom: '16px'
          }}>
            TN
          </div>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--color-primary-dark)', fontWeight: '800', margin: '0 0 6px 0', textTransform: 'none', letterSpacing: '-0.02em' }}>
            SET NEW PASSWORD
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: 0 }}>
            Enter your new credentials below to synchronize and update your access token.
          </p>
        </div>

        {errorMsg && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(198, 40, 40, 0.05)',
            color: 'var(--color-error)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem',
            fontWeight: '600',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <i className="bi bi-exclamation-triangle-fill" />
            {errorMsg}
          </div>
        )}

        {message && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(46, 125, 50, 0.05)',
            color: 'var(--color-success)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem',
            fontWeight: '600',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <i className="bi bi-check-circle-fill" />
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="form-group-premium">
            <label className="form-label-premium">New Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="form-input-premium"
              disabled={isLoading}
            />
          </div>

          <div className="form-group-premium">
            <label className="form-label-premium">Confirm Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="form-input-premium"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px', padding: '14px' }}
          >
            {isLoading ? 'UPDATING...' : 'UPDATE PASSWORD'}
          </button>
        </form>
      </div>
    </div>
  );
}
