import { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext(null);

export function useNotification() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const [modal, setModal] = useState(null); // { message, title, type, onClose }
  const [toasts, setToasts] = useState([]); // Array of { id, message, type }

  // Expose a function to trigger toasts
  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Expose a function to trigger a custom alert modal
  const showAlert = (message, title = 'Notification', type = 'info') => {
    return new Promise((resolve) => {
      setModal({
        message,
        title,
        type,
        onClose: () => {
          setModal(null);
          resolve();
        }
      });
    });
  };

  // Override window.alert with our premium UI
  useEffect(() => {
    window.alert = (message) => {
      // Determine if it looks like a success or error message for richer UX
      let type = 'info';
      let title = 'System Alert';
      const lower = message.toLowerCase();
      if (lower.includes('success') || lower.includes('created') || lower.includes('sent')) {
        type = 'success';
        title = 'Success';
      } else if (lower.includes('failed') || lower.includes('error') || lower.includes('invalid') || lower.includes('select a valid')) {
        type = 'error';
        title = 'Alert';
      }
      
      showAlert(message, title, type);
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ showToast, showAlert }}>
      {children}

      {/* CUSTOM MODAL FEEDBACK (FLOATING TOP-CENTER POPUP) */}
      {modal && (
        <div style={{
          position: 'fixed',
          top: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100vw - 48px)',
          maxWidth: '400px',
          zIndex: 9999,
          animation: 'slideDownNotification 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
          pointerEvents: 'auto'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 20px 48px rgba(62, 10, 54, 0.16)',
            border: '1px solid rgba(62, 10, 54, 0.08)',
            padding: '24px 20px',
            position: 'relative',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            {/* Close Cross icon in corner */}
            <button
              onClick={modal.onClose}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Dismiss Alert"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Status Icon */}
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px',
              backgroundColor: modal.type === 'success' ? 'rgba(46, 125, 50, 0.08)' : modal.type === 'error' ? 'rgba(198, 40, 40, 0.08)' : 'rgba(62, 10, 54, 0.08)',
              color: modal.type === 'success' ? 'var(--color-success)' : modal.type === 'error' ? 'var(--color-error)' : 'var(--color-primary)'
            }}>
              {modal.type === 'success' && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {modal.type === 'error' && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              )}
              {modal.type === 'info' && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              )}
            </div>

            <h3 style={{
              margin: '0 0 6px 0',
              fontSize: '1.05rem',
              fontWeight: '800',
              color: 'var(--color-primary-dark)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {modal.title}
            </h3>

            <p style={{
              margin: '0 0 16px 0',
              fontSize: '0.85rem',
              lineHeight: '1.4',
              color: 'var(--color-text-secondary)'
            }}>
              {modal.message}
            </p>

            <button
              onClick={modal.onClose}
              className="btn btn-primary btn-sm"
              style={{
                width: '100%',
                padding: '10px 16px',
                borderRadius: '6px',
                fontWeight: '700',
                fontSize: '0.72rem',
                letterSpacing: '0.08em'
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* TOAST SYSTEM */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        zIndex: 99999,
        pointerEvents: 'none'
      }}>
        {toasts.map(t => (
          <div
            key={t.id}
            style={{
              pointerEvents: 'auto',
              backgroundColor: '#ffffff',
              borderLeft: `4px solid ${t.type === 'success' ? 'var(--color-success)' : t.type === 'error' ? 'var(--color-error)' : 'var(--color-primary)'}`,
              boxShadow: '0 10px 30px rgba(62, 10, 54, 0.08)',
              padding: '16px 20px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              minWidth: '280px',
              maxWidth: '380px',
              animation: 'slideInToast 0.3s cubic-bezier(0.16, 1, 0.3, 1) both'
            }}
          >
            <span style={{
              color: t.type === 'success' ? 'var(--color-success)' : t.type === 'error' ? 'var(--color-error)' : 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center'
            }}>
              {t.type === 'success' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>}
              {t.type === 'error' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>}
              {t.type === 'info' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>}
            </span>
            <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-text-dark)' }}>{t.message}</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideDownNotification {
          from { opacity: 0; transform: translate(-50%, -20px) scale(0.95); }
          to { opacity: 1; transform: translate(-50%, 0) scale(1); }
        }
        @keyframes slideInToast {
          from { opacity: 0; transform: translateY(20px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </NotificationContext.Provider>
  );
}
