import { useState, useEffect } from 'react';

export default function Layout({ user, cartCount, currentPage, navigateTo, onLogout, children }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [currentPage]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

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
        backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: scrolled ? '1px solid rgba(62, 10, 54, 0.08)' : '1px solid rgba(62, 10, 54, 0.04)',
        transition: 'all 0.2s ease',
        boxShadow: scrolled ? '0 4px 20px rgba(62, 10, 54, 0.02)' : 'none'
      }}>
        <div className="container-premium flex-between" style={{ height: 'var(--header-height)', gap: '8px' }}>
          {/* Logo */}
          <div 
            onClick={() => handleNav('home')} 
            style={{ 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px',
              flexShrink: 0 
            }}
          >
            <span style={{ fontSize: 'clamp(0.85rem, 3vw, 1.1rem)', fontWeight: '900', color: 'var(--color-primary)', letterSpacing: '-0.03em', whiteSpace: 'nowrap' }}>
              BEN-TECHNOVA
            </span>
            <span className="brand-suffix" style={{ fontSize: 'clamp(0.5rem, 1.5vw, 0.6rem)', fontWeight: '700', color: 'var(--color-text-muted)', letterSpacing: '0.15em', borderLeft: '1px solid rgba(62, 10, 54, 0.15)', paddingLeft: '6px', marginLeft: '4px', whiteSpace: 'nowrap' }}>
              GHANA
            </span>
          </div>

          {/* Desktop Nav */}
          <nav style={{ display: 'flex', gap: 'clamp(16px, 3vw, 32px)', alignItems: 'center' }} className="desktop-nav-only">
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <button
              onClick={() => handleNav('cart')}
              style={{
                position: 'relative',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
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
                  top: '0',
                  right: '0',
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

            {/* Desktop auth button */}
            <div className="desktop-nav-only" style={{ alignItems: 'center', display: 'flex' }}>
              {user ? (
                <button onClick={onLogout} className="btn btn-outline btn-sm" style={{ whiteSpace: 'nowrap' }}>
                  LOG OUT
                </button>
              ) : (
                <button onClick={() => handleNav('auth')} className="btn btn-primary btn-sm" style={{ whiteSpace: 'nowrap' }}>
                  SIGN IN
                </button>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer', 
                padding: '8px', 
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              className="mobile-hamburger-only"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer - Full screen overlay */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div 
              style={{
                position: 'fixed',
                top: 'var(--header-height)',
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                zIndex: 998
              }}
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Drawer */}
            <div style={{
              position: 'fixed',
              top: 'var(--header-height)',
              right: 0,
              width: 'min(320px, 85vw)',
              height: 'calc(100vh - var(--header-height))',
              backgroundColor: '#ffffff',
              borderLeft: '1px solid var(--border-color)',
              padding: 'var(--space-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1) both',
              boxShadow: '-10px 0 40px rgba(0,0,0,0.08)',
              zIndex: 999,
              overflowY: 'auto'
            }}>
              {/* Mobile user greeting */}
              {user && (
                <div style={{
                  padding: '12px 8px',
                  marginBottom: '8px',
                  borderBottom: '1px solid var(--border-color-light)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '0.8rem',
                    flexShrink: 0
                  }}>
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-dark)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.name}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.email}
                    </span>
                  </div>
                </div>
              )}

              <div style={{ fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.12em', color: 'var(--color-text-muted)', textTransform: 'uppercase', padding: '8px 8px 4px' }}>
                Navigation
              </div>
              <MobileNavItem onClick={() => handleNav('home')} isActive={currentPage === 'home'} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>} label="Home" />
              <MobileNavItem onClick={() => handleNav('catalog')} isActive={currentPage === 'catalog'} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>} label="Catalog" />
              <MobileNavItem onClick={() => handleNav('dashboard')} isActive={currentPage === 'dashboard'} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>} label="Account" />
              <MobileNavItem onClick={() => handleNav('cart')} isActive={currentPage === 'cart'} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>} label={`Cart (${cartCount})`} cartCount={cartCount} />

              <hr style={{ border: 'none', height: '1px', backgroundColor: 'var(--border-color)', margin: '12px 0' }} />

              <div style={{ fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.12em', color: 'var(--color-text-muted)', textTransform: 'uppercase', padding: '8px 8px 4px' }}>
                Help & Info
              </div>
              <MobileNavItem onClick={() => handleNav('track-order')} isActive={false} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>} label="Track Order" />
              <MobileNavItem onClick={() => handleNav('faq')} isActive={false} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>} label="FAQ" />
              <MobileNavItem onClick={() => handleNav('about')} isActive={false} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>} label="About Us" />

              <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                {user ? (
                  <button 
                    onClick={() => { onLogout(); setMobileMenuOpen(false); }} 
                    style={{
                      width: '100%',
                      padding: '14px',
                      backgroundColor: 'rgba(198, 40, 40, 0.05)',
                      color: 'var(--color-error)',
                      border: '1px solid rgba(198, 40, 40, 0.15)',
                      borderRadius: '8px',
                      fontWeight: '700',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    LOG OUT
                  </button>
                ) : (
                  <button 
                    onClick={() => handleNav('auth')} 
                    style={{
                      width: '100%',
                      padding: '14px',
                      backgroundColor: 'var(--color-primary)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '700',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    SIGN IN / REGISTER
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </header>

      {/* MAIN CONTAINER */}
      <main style={{ flex: 1, width: '100%', overflowX: 'hidden' }}>
        {children}
      </main>

      {/* FOOTER */}
      <footer style={{
        backgroundColor: 'var(--color-primary-dark)',
        color: '#ffffff',
        padding: '48px 0 24px',
        borderTop: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div className="container-premium">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '32px',
            marginBottom: '32px'
          }}>
            
            {/* Branding Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '1rem', fontWeight: '900', letterSpacing: '-0.03em', color: '#ffffff' }}>BEN-TECHNOVA</span>
                <span style={{ fontSize: '0.6rem', fontWeight: '700', color: 'var(--color-secondary)', letterSpacing: '0.15em', borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '6px', marginLeft: '4px' }}>GHANA</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem', lineHeight: '1.6', maxWidth: '220px' }}>
                Premium technology, delivered. Authentic laptops and mobile devices direct to your doorstep.
              </p>
            </div>

            {/* Column 1 */}
            <div>
              <h4 style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.1em', color: '#ffffff', marginBottom: '16px' }}>SHOP</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { label: 'Laptops & PCs', page: 'catalog', cat: 'Laptops' },
                  { label: 'Smartphones & Mobile', page: 'catalog', cat: 'Smartphones' },
                  { label: 'Audio & ANC Sound', page: 'catalog', cat: 'Audio & Sound' },
                  { label: 'Wearable Tech', page: 'catalog', cat: 'Wearables' }
                ].map((item, idx) => (
                  <li key={idx}>
                    <button
                      onClick={() => handleNav(item.page, item.cat)}
                      style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.55)', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', textAlign: 'left', transition: 'color 0.2s ease', padding: '2px 0' }}
                      onMouseOver={(e) => e.target.style.color = '#ffffff'}
                      onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.55)'}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2 */}
            <div>
              <h4 style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.1em', color: '#ffffff', marginBottom: '16px' }}>HELP & SUPPORT</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { label: 'Track Order', page: 'track-order' },
                  { label: 'Warranty Registration', page: 'warranty' },
                  { label: 'Client Support Inquiries', page: 'inquiries' },
                  { label: 'FAQ Desk', page: 'faq' }
                ].map((item, idx) => (
                  <li key={idx}>
                    <button
                      onClick={() => handleNav(item.page)}
                      style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.55)', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', textAlign: 'left', transition: 'color 0.2s ease', padding: '2px 0' }}
                      onMouseOver={(e) => e.target.style.color = '#ffffff'}
                      onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.55)'}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h4 style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.1em', color: '#ffffff', marginBottom: '16px' }}>THE COMPANY</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { label: 'About TechNova', page: 'about' },
                  { label: 'Store Locations', page: 'locations' },
                  { label: 'Distributors License', page: 'license' },
                  { label: 'Privacy Policy', page: 'privacy' }
                ].map((item, idx) => (
                  <li key={idx}>
                    <button
                      onClick={() => handleNav(item.page)}
                      style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.55)', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', textAlign: 'left', transition: 'color 0.2s ease', padding: '2px 0' }}
                      onMouseOver={(e) => e.target.style.color = '#ffffff'}
                      onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.55)'}
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
            paddingTop: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.02em' }}>
              &copy; {new Date().getFullYear()} BEN-TECHNOVA GHANA. ALL RIGHTS RESERVED.
            </span>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {['Terms of Service', 'Privacy Policy'].map((item, idx) => (
                <a
                  key={idx}
                  href="#!"
                  style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', textDecoration: 'none', transition: 'color 0.2s ease' }}
                  onMouseOver={(e) => e.target.style.color = 'rgba(255,255,255,0.65)'}
                  onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.3)'}
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Responsive & Animation Styles Injection */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        
        /* Force footer columns to stack nicely on small screens */
        @media (max-width: 768px) {
          footer [style*="grid-template-columns"] {
            grid-template-columns: 1fr 1fr !important;
            gap: 24px !important;
          }
        }
        
        @media (max-width: 480px) {
          footer [style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .brand-suffix {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function MobileNavItem({ onClick, isActive, icon, label, cartCount }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 8px',
        background: isActive ? 'rgba(62, 10, 54, 0.05)' : 'transparent',
        border: 'none',
        borderRadius: '8px',
        color: isActive ? 'var(--color-primary)' : 'var(--color-text-primary)',
        fontWeight: isActive ? '700' : '500',
        fontSize: '0.85rem',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.15s ease',
        position: 'relative'
      }}
      onMouseOver={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(62, 10, 54, 0.03)'; }}
      onMouseOut={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
    >
      <span style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)', display: 'flex', flexShrink: 0 }}>
        {icon}
      </span>
      {label}
      {cartCount > 0 && (
        <span style={{
          marginLeft: 'auto',
          backgroundColor: 'var(--color-primary)',
          color: '#ffffff',
          fontSize: '10px',
          fontWeight: '800',
          padding: '2px 8px',
          borderRadius: '10px',
          minWidth: '20px',
          textAlign: 'center'
        }}>
          {cartCount}
        </span>
      )}
    </button>
  );
}