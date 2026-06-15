import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';

const CATEGORIES = [
  { name: "Smartphones", icon: "bi-phone" },
  { name: "Laptops", icon: "bi-laptop" },
  { name: "Audio & Sound", icon: "bi-headphones" },
  { name: "Wearables", icon: "bi-watch" },
  { name: "Gaming", icon: "bi-controller" },
  { name: "Accessories", icon: "bi-plugin" }
];

const REVIEWS = [
  { id: 1, name: "Kwame A.", rating: 5, text: "The delivery in Accra was extremely fast. The ProBook quality is top notch!", date: "Yesterday" },
  { id: 2, name: "Ama O.", rating: 5, text: "Excellent customer service and response rate. High-end packaging.", date: "3 days ago" },
  { id: 3, name: "Kofi M.", rating: 5, text: "Best electronics store in Ghana. Their warranty service is unmatched.", date: "1 week ago" },
  { id: 4, name: "Esi D.", rating: 4, text: "Great prices and genuine products. Will definitely order again.", date: "2 weeks ago" },
];

export default function Home({ onItemAdd, onNavigate, user }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState(REVIEWS);
  const [homeSearch, setHomeSearch] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/products');
        const data = await response.json();
        if (data.success) setProducts(data.products);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/reviews');
        const data = await response.json();
        if (data.success && data.reviews.length > 0) setReviews(data.reviews);
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      }
    };
    fetchReviews();
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const flashProducts = products.filter(p => p.tag === "Flash Sale");

  return (
    <div className="animate-fade-in" style={{ backgroundColor: '#ffffff' }}>
      
      {/* ============ HERO SECTION ============ */}
      {user ? (
        /* ============ LOGGED-IN DISCOVERY HUB ============ */
        <section style={{ 
          background: 'linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%)', 
          color: '#ffffff',
          padding: '64px 0 54px 0',
          borderBottom: '1px solid var(--border-color)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background ambient light */}
          <div style={{ position: 'absolute', top: '-20%', left: '30%', width: '300px', height: '300px', borderRadius: '50%', backgroundColor: 'var(--color-secondary)', opacity: 0.08, filter: 'blur(60px)', pointerEvents: 'none' }} />
          
          <div className="container-premium" style={{ position: 'relative', zIndex: 1 }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: '800',
              letterSpacing: '0.15em',
              color: 'var(--color-secondary)',
              textTransform: 'uppercase',
              marginBottom: '12px',
              display: 'block'
            }}>
              Welcome back, {user.name.split(' ')[0]}
            </span>
            
            <h1 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: '900',
              letterSpacing: '-0.03em',
              marginBottom: '28px',
              color: '#ffffff',
              textTransform: 'none',
              lineHeight: '1.2'
            }}>
              What are you looking for today?
            </h1>
            
            {/* Search Form */}
            <form onSubmit={(e) => { e.preventDefault(); onNavigate('catalog', null, homeSearch); }} style={{ 
              maxWidth: '600px', 
              margin: '0 auto 36px',
              display: 'flex',
              gap: '12px',
              position: 'relative'
            }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="text"
                  placeholder="Search laptops, smartphones, noise-canceling headphones..."
                  value={homeSearch}
                  onChange={(e) => setHomeSearch(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="form-input-premium"
                  style={{ 
                    padding: '16px 20px 16px 48px', 
                    borderRadius: '12px', 
                    fontSize: '1rem',
                    backgroundColor: isFocused ? '#ffffff' : 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: isFocused ? 'var(--color-text-primary)' : '#ffffff',
                    transition: 'all 0.2s ease-in-out',
                    outline: 'none'
                  }}
                />
                <i className="bi bi-search" style={{ 
                  position: 'absolute', 
                  left: '18px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: isFocused ? 'var(--color-text-muted)' : 'rgba(255, 255, 255, 0.6)',
                  fontSize: '1.1rem'
                }} />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ 
                  padding: '16px 32px', 
                  borderRadius: '12px', 
                  backgroundColor: 'var(--color-secondary)', 
                  color: 'var(--color-primary)',
                  fontWeight: '700',
                  letterSpacing: '0.05em'
                }}
              >
                Search
              </button>
            </form>

            {/* Quick Links Categories Icons Grid */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '12px', 
              flexWrap: 'wrap' 
            }}>
              {CATEGORIES.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => onNavigate('catalog', cat.name)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '30px',
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                  }}
                >
                  <i className={`bi ${cat.icon}`} />
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </section>
      ) : (
        /* ============ EDITORIAL HERO (LOGGED-OUT GUEST) ============ */
        <section style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--space-2xl)' }}>
          <div className="container-premium hero-split">
            
            {/* Left - Content Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'left' }}>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: '800',
                letterSpacing: '0.15em',
                color: 'var(--color-primary)',
                textTransform: 'uppercase',
                marginBottom: '16px',
                display: 'block'
              }}>
                NEW COLLECTION / SEASON 2026
              </span>
              
              <h1 style={{
                fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                fontWeight: '900',
                lineHeight: '0.95',
                letterSpacing: '-0.04em',
                marginBottom: '24px',
                color: 'var(--color-primary-dark)'
              }}>
                PREMIUM TECH,<br />
                <span style={{ color: 'var(--color-primary-light)' }}>DELIVERED.</span>
              </h1>
              
              <p style={{
                fontSize: '1rem',
                color: 'var(--color-text-secondary)',
                lineHeight: '1.7',
                maxWidth: '460px',
                marginBottom: '36px'
              }}>
                Explore Ghana's finest curated catalog of genuine laptops, accessories, and smartphones. Precision-engineered products backed by warranty.
              </p>
              
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => onNavigate('auth')}
                  className="btn btn-primary"
                  style={{ minWidth: '180px' }}
                >
                  JOIN TECHNOVA
                </button>
                <button
                  onClick={() => onNavigate('catalog')}
                  className="btn btn-outline"
                  style={{ minWidth: '180px' }}
                >
                  BROWSE LATEST
                </button>
              </div>

              {/* Stats */}
              <div style={{
                display: 'flex',
                gap: '40px',
                marginTop: '48px',
                paddingTop: '24px',
                borderTop: '1px solid var(--border-color)'
              }}>
                <div>
                  <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-primary)', display: 'block' }}>500+</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>GENUINE ITEMS</span>
                </div>
                <div>
                  <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-primary)', display: 'block' }}>48h</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>DELIVERY GUARANTEE</span>
                </div>
                <div>
                  <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-primary)', display: 'block' }}>100%</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>WARRANTY SUPPORT</span>
                </div>
              </div>
            </div>

            {/* Right - Premium Visual Art Panel */}
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', position: 'relative', alignItems: 'center' }}>
              <div className="hero-glow-shadow" />
              <div className="hero-image-container">
                <img 
                  src="/hero_tech_showcase.png" 
                  alt="Premium Technology Showcase" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                {/* Overlaid clean text block */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(to top, rgba(11, 15, 25, 0.9) 0%, rgba(11, 15, 25, 0.4) 70%, rgba(11, 15, 25, 0) 100%)',
                  padding: '32px 24px',
                  color: '#ffffff',
                  textAlign: 'left'
                }}>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: '800',
                    letterSpacing: '0.15em',
                    color: 'var(--color-secondary)',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: '6px'
                  }}>
                    SELECTION 2026
                  </span>
                  <h3 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: '800', margin: '0 0 4px', textTransform: 'none', letterSpacing: '-0.02em' }}>
                    The Future of Laptops & Mobile
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', margin: '0 0 12px' }}>
                    Authentic products directly sourced from Authorized Brand Distributors.
                  </p>
                  <span style={{
                    display: 'inline-block',
                    border: '1px solid rgba(255,255,255,0.25)',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.65rem',
                    fontWeight: '700',
                    letterSpacing: '0.05em'
                  }}>
                    ACCRA / TEMA / KUMASI / TAMALE
                  </span>
                </div>
              </div>
            </div>
            
          </div>
        </section>
      )}

      {/* ============ MINIMALIST CATEGORIES GRID ============ */}
      <section style={{ borderBottom: '1px solid var(--border-color)', padding: 'var(--space-2xl) 0' }}>
        <div className="container-premium">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '36px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>SHOP BY CATEGORY</h2>
            <button onClick={() => onNavigate('catalog')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-primary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              ALL DEPARTMENTS &rarr;
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '1px',
            backgroundColor: 'var(--border-color)',
            border: '1px solid var(--border-color)'
          }}>
            {CATEGORIES.map((cat, idx) => (
              <div
                key={idx}
                onClick={() => onNavigate('catalog', cat.name)}
                style={{
                  padding: '36px 16px',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-secondary-light)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-card-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  color: 'var(--color-primary)'
                }}>
                  <i className={`bi ${cat.icon}`} />
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-dark)' }}>{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FLASH SALE (MINIMAL CAROUSEL) ============ */}
      {flashProducts.length > 0 && (
        <section style={{ borderBottom: '1px solid var(--border-color)', padding: 'var(--space-2xl) 0' }}>
          <div className="container-premium">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '36px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--color-error)', borderRadius: '50%', display: 'inline-block' }} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>LIMITED FLASH SALE</h2>
              </div>
              <button onClick={() => onNavigate('catalog')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-primary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                VIEW ALL &rarr;
              </button>
            </div>

            <div style={{
              display: 'flex',
              gap: '24px',
              overflowX: 'auto',
              paddingBottom: '16px',
              scrollSnapType: 'x mandatory'
            }}>
              {flashProducts.map(product => (
                <div key={product._id || product.id} style={{ minWidth: '220px', flex: '0 0 220px', scrollSnapAlign: 'start' }}>
                  <ProductCard
                    product={product}
                    onAdd={onItemAdd}
                    onClick={() => onNavigate('catalog')}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ LATEST ARRIVALS GRID ============ */}
      <section style={{ padding: 'var(--space-2xl) 0', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container-premium">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '36px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>LATEST ARRIVALS</h2>
            <button onClick={() => onNavigate('catalog')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-primary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              BROWSE ALL &rarr;
            </button>
          </div>

          {products.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '40px 24px'
            }}>
              {products.slice(0, 8).map(product => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                  onAdd={onItemAdd}
                  onClick={() => onNavigate('catalog')}
                />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '64px', backgroundColor: 'var(--color-card-bg)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '1.5rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '8px' }}>📦</span>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>No products cataloged yet. Check back soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* ============ EDITORIAL REVIEWS ============ */}
      <section style={{ padding: 'var(--space-2xl) 0', backgroundColor: 'var(--color-card-bg)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container-premium">
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', textAlign: 'center', marginBottom: '48px' }}>WHAT OUR CUSTOMERS SAY</h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px'
          }}>
            {reviews.slice(0, 4).map(rev => (
              <div
                key={rev.id}
                style={{
                  backgroundColor: '#ffffff',
                  padding: '28px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 8px 30px rgba(62,10,54,0.02)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} style={{ color: '#f59e0b', fontSize: '0.8rem', opacity: i < rev.rating ? 1 : 0.15 }}>★</span>
                    ))}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)', fontStyle: 'italic', lineHeight: '1.6', marginBottom: '20px' }}>
                    "{rev.text}"
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: '800'
                  }}>
                    {rev.name.split(' ')[0].charAt(0)}{rev.name.split(' ')[1]?.charAt(0) || ''}
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-dark)', display: 'block' }}>{rev.name}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>{rev.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ NEWSLETTER ============ */}
      <section style={{ padding: 'var(--space-3xl) 0' }}>
        <div className="container-premium" style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: '100%',
            maxWidth: '640px',
            textAlign: 'center',
            border: '1px solid var(--border-color)',
            padding: '48px 32px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: '#ffffff'
          }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '12px' }}>STAY IN THE LOOP</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', maxWidth: '420px', margin: '0 auto 28px' }}>
              Subscribe to get exclusive access to new drops, sales updates, and restock notifications.
            </p>

            {subscribed ? (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(46, 125, 50, 0.08)',
                color: 'var(--color-success)',
                fontWeight: '700',
                fontSize: '0.8rem'
              }}>
                <i className="bi bi-check-circle-fill" /> YOU'RE SUBSCRIBED. THANK YOU.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '8px', maxWidth: '480px', margin: '0 auto' }}>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input-premium"
                  required
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '14px 24px' }}>
                  SUBSCRIBE
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}