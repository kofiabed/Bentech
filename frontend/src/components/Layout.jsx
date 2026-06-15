import { useState, useEffect } from 'react';

export default function Layout({ user, cartCount, currentPage, navigateTo, onLogout, children }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (page, category = null) => {
    navigateTo(page, category);
    setMobileMenuOpen(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
      {/* HEADER */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: scrolled ? '1px solid rgba(62, 10, 54, 0.08)' : '1px solid rgba(62, 10, 54, 0.04)',
        transition: 'all 0.2s ease',
        boxShadow: scrolled ? '0 4px 20px rgba(62, 10, 54, 0.02)' : 'none'
      }}>
        <div className="container-premium flex-between" style={{ height: '72px' }}>
          {/* Logo */}
          <div onClick={() => handleNav('home')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--color-primary)', letterSpacing: '-0.03em' }}>BEN-TECHNOVA</span>
            <span style={{ fontSize: '0.6rem', fontWeight: '700', color: 'var(--color-text-muted)', letterSpacing: '0.15em', borderLeft: '1px solid rgba(62, 10, 54, 0.15)', paddingLeft: '6px', marginLeft: '4px' }}>GHANA</span>
          </div>

          {/* Desktop Nav */}
          <nav style={{ display: 'flex', gap: '32px', alignItems: 'center' }} className="desktop-nav-only">
            {['home', 'catalog', 'dashboard'].map((page) => {
              const isActive = currentPage === page;
              return (
                <button
                  key={page}
                  onClick={() => handleNav(page)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    padding: '8px 0',
                    position: 'relative',
                    transition: 'color 0.2s ease'
                  }}
                >
                  {page === 'dashboard' ? 'Account' : page}
                  {isActive && (
                    <span style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: '2px',
                      backgroundColor: 'var(--color-primary)',
                      animation: 'fadeIn 0.2s ease'
                    }} />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => handleNav('cart')}
              style={{
                position: 'relative',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '6px',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center'
              }}
              aria-label="Shopping Cart"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  backgroundColor: 'var(--color-primary)',
                  color: '#ffffff',
                  fontSize: '9px',
                  fontWeight: '800',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {cartCount}
                </span>
              )}
            </button>

            <div className="desktop-nav-only">
              {user ? (
                <button onClick={onLogout} className="btn btn-outline btn-sm">LOG OUT</button>
              ) : (
                <button onClick={() => handleNav('auth')} className="btn btn-primary btn-sm">SIGN IN</button>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--color-primary)' }}
              className="mobile-hamburger-only"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div style={{
            position: 'absolute',
            top: '72px',
            left: 0,
            width: '100%',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid var(--border-color)',
            padding: 'var(--space-md) var(--space-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            animation: 'fadeIn 0.2s ease',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
          }}>
            <button onClick={() => handleNav('home')} style={mobileLinkStyle(currentPage === 'home')}>Home</button>
            <button onClick={() => handleNav('catalog')} style={mobileLinkStyle(currentPage === 'catalog')}>Catalog</button>
            <button onClick={() => handleNav('dashboard')} style={mobileLinkStyle(currentPage === 'dashboard')}>Account</button>
            <button onClick={() => handleNav('cart')} style={mobileLinkStyle(currentPage === 'cart')}>Cart ({cartCount})</button>
            <hr style={{ border: 'none', height: '1px', backgroundColor: 'var(--border-color)', margin: '4px 0' }} />
            {user ? (
              <button onClick={() => { onLogout(); setMobileMenuOpen(false); }} style={mobileLinkStyle(false)}>Log Out</button>
            ) : (
              <button onClick={() => handleNav('auth')} style={mobileLinkStyle(currentPage === 'auth')}>Sign In</button>
            )}
          </div>
        )}
      </header>

      {/* MAIN CONTAINER */}
      <main style={{ flex: 1 }}>
        {children}
      </main>

      {/* FOOTER */}
      <footer style={{
        backgroundColor: 'var(--color-primary-dark)',
        color: '#ffffff',
        padding: '64px 0 32px',
        borderTop: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div className="container-premium">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '40px',
            marginBottom: '48px'
          }} className="footer-columns-responsive">
            
            {/* Branding Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: '900', letterSpacing: '-0.03em', color: '#ffffff' }}>BEN-TECHNOVA</span>
                <span style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--color-secondary)', letterSpacing: '0.15em', borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '6px', marginLeft: '4px' }}>GHANA</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', lineHeight: '1.6', maxWidth: '240px' }}>
                Premium technology, delivered. Authentic laptops and mobile devices direct to your doorstep.
              </p>
            </div>

            {/* Column 1 */}
            <div>
              <h4 style={{ fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.1em', color: '#ffffff', marginBottom: '20px' }}>SHOP</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'Laptops & PCs', page: 'catalog', cat: 'Laptops' },
                  { label: 'Smartphones & Mobile', page: 'catalog', cat: 'Smartphones' },
                  { label: 'Audio & ANC Sound', page: 'catalog', cat: 'Audio & Sound' },
                  { label: 'Wearable Tech', page: 'catalog', cat: 'Wearables' }
                ].map((item, idx) => (
                  <li key={idx}>
                    <button
                      onClick={() => handleNav(item.page, item.cat)}
                      style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', textAlign: 'left', transition: 'color 0.2s ease' }}
                      onMouseOver={(e) => e.target.style.color = '#ffffff'}
                      onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.6)'}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2 */}
            <div>
              <h4 style={{ fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.1em', color: '#ffffff', marginBottom: '20px' }}>HELP & SUPPORT</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'Track Order', page: 'track-order' },
                  { label: 'Warranty Registration', page: 'warranty' },
                  { label: 'Client Support Inquiries', page: 'inquiries' },
                  { label: 'FAQ Desk', page: 'faq' }
                ].map((item, idx) => (
                  <li key={idx}>
                    <button
                      onClick={() => handleNav(item.page)}
                      style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', textAlign: 'left', transition: 'color 0.2s ease' }}
                      onMouseOver={(e) => e.target.style.color = '#ffffff'}
                      onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.6)'}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h4 style={{ fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.1em', color: '#ffffff', marginBottom: '20px' }}>THE COMPANY</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'About TechNova', page: 'about' },
                  { label: 'Store Locations', page: 'locations' },
                  { label: 'Distributors License', page: 'license' },
                  { label: 'Privacy Policy', page: 'privacy' }
                ].map((item, idx) => (
                  <li key={idx}>
                    <button
                      onClick={() => handleNav(item.page)}
                      style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', textAlign: 'left', transition: 'color 0.2s ease' }}
                      onMouseOver={(e) => e.target.style.color = '#ffffff'}
                      onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.6)'}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Bottom Row */}
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            paddingTop: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }} className="footer-bottom-responsive">
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.02em' }}>
              &copy; {new Date().getFullYear()} BEN-TECHNOVA GHANA. ALL RIGHTS RESERVED.
            </span>
            <div style={{ display: 'flex', gap: '16px' }}>
              {['Terms of Service', 'Privacy Policy'].map((item, idx) => (
                <a
                  key={idx}
                  href="#!"
                  style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem', textDecoration: 'none', transition: 'color 0.2s ease' }}
                  onMouseOver={(e) => e.target.style.color = 'rgba(255,255,255,0.65)'}
                  onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.35)'}
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 768px) {
            .footer-columns-responsive {
              grid-template-columns: 1fr !important;
              gap: 32px !important;
            }
            .footer-bottom-responsive {
              flex-direction: column !important;
              align-items: flex-start !important;
            }
          }
        `}</style>
      </footer>

      {/* Responsive Styles Injection */}
      <style>{`
        @media (min-width: 769px) {
          .mobile-hamburger-only { display: none !important; }
        }
        @media (max-width: 768px) {
          .desktop-nav-only { display: none !important; }
          .mobile-hamburger-only { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

const mobileLinkStyle = (isActive) => ({
  background: 'none',
  border: 'none',
  textAlign: 'left',
  padding: '8px 4px',
  fontSize: '0.85rem',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
  cursor: 'pointer'
});
