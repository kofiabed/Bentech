import { useCallback, useEffect, useState } from 'react';

const MOCK_WISHLIST = [
  { id: 3, name: "Quantum Smart Watch V2", price: 750, img: "⌚" },
  { id: 5, name: "4K Curved Gaming Monitor", price: 2900, img: "🖥️" }
];

export default function Dashboard({ user, wishlist = [], onToggleWishlist, onItemAdd }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    image: user?.image || null
  });
  const [imagePreview, setImagePreview] = useState(user?.image?.startsWith?.('data:image') ? user.image : null);
  const [isSaving, setIsSaving] = useState(false);
  const [addresses] = useState([
    { id: 1, type: 'Home / Primary Terminal', street: '12 Ring Road Central', city: 'Accra', current: true },
    { id: 2, type: 'Development Workshop', street: '45 Asokwa Industrial Area', city: 'Kumasi', current: false }
  ]);
  const [orders, setOrders] = useState([]);
  const [orderMessage, setOrderMessage] = useState('');
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: '5', text: '', product: 'General Shopping Experience' });
  const [reviewMessage, setReviewMessage] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, GIF, etc.)');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setFormData(prev => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image: null }));
  };

  const fetchOrders = useCallback(async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/orders', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to load orders.');
    }
    setOrders(data.orders || []);
  }, []);

  const fetchReviews = useCallback(async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/reviews', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to load reviews.');
    }
    setReviews(data.reviews || []);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadOrders = () => {
      if (!cancelled) {
        fetchOrders().catch(error => setOrderMessage(error.message));
      }
    };
    const timeout = setTimeout(loadOrders, 0);
    const interval = setInterval(loadOrders, 15000);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [fetchOrders]);

  useEffect(() => {
    let cancelled = false;
    const loadReviews = () => {
      if (!cancelled) {
        fetchReviews().catch(error => setReviewMessage(error.message));
      }
    };
    const timeout = setTimeout(loadReviews, 0);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [fetchReviews]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const savedToken = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${savedToken}`
        },
        body: JSON.stringify(formData)
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update profile');
      }
      const data = await response.json();
      alert('Profile updated successfully');
      if (data.user && data.user.image) {
        setImagePreview(data.user.image);
      }
    } catch (err) {
      alert(err.message || 'Profile update failed');
    } finally {
      setIsSaving(false);
    }
  };

  const submitReview = async (event) => {
    event.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: Number(reviewForm.rating),
          text: reviewForm.text,
          product: reviewForm.product
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit review.');
      }
      setReviewForm({ rating: '5', text: '', product: 'General Shopping Experience' });
      setReviewMessage('Review submitted. It will appear after admin approval.');
      fetchReviews();
    } catch (error) {
      setReviewMessage(error.message);
    }
  };

  if (!user) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="spinner" style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--color-secondary)',
            borderTopColor: 'var(--color-primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: 'var(--color-text-muted)', fontWeight: '600', fontSize: '0.9rem' }}>
            Retrieving account records...
          </p>
        </div>
      </div>
    );
  }

  const getFallbackImage = () => {
    if (user.role === 'admin') return 'https://ui-avatars.com/api/?name=Admin&background=3e0a36&color=fff&size=120';
    if (user.role === 'staff') return 'https://ui-avatars.com/api/?name=Staff&background=2E7D32&color=fff&size=120';
    return 'https://ui-avatars.com/api/?name=User&background=d1e4ff&color=3e0a36&size=120';
  };

  const profileImageSrc = imagePreview || getFallbackImage();

  return (
    <div style={{ maxWidth: '1280px', margin: '48px auto 96px', padding: '0 24px' }} className="animate-fade-in">
      {/* Premium Header Banner */}
      <div style={{ 
        background: 'linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 60%, var(--color-primary-light) 100%)', 
        borderRadius: '16px', 
        padding: '40px', 
        color: '#FFFFFF', 
        marginBottom: '32px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '24px',
        boxShadow: '0 20px 40px rgba(62,10,54,0.06)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(209,228,255,0.08) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', zIndex: 1 }}>
          <div style={{ 
            width: '88px', 
            height: '88px', 
            borderRadius: '50%', 
            overflow: 'hidden', 
            border: '3px solid rgba(255, 255, 255, 0.25)', 
            flexShrink: 0, 
            backgroundColor: '#ffffff',
            boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
          }}>
            <img 
              src={profileImageSrc} 
              alt="Profile Avatar" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { e.target.src = getFallbackImage(); }}
            />
          </div>
          <div>
            <span style={{ fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-secondary)' }}>
              MEMBER ACCOUNT CONTROL
            </span>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '2rem', color: '#FFFFFF', textTransform: 'none', letterSpacing: '-0.02em', fontWeight: '900' }}>
              Hello, {formData.name || 'User'}
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
              Logged in as {formData.email}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', zIndex: 1 }}>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '8px',
            padding: '12px 20px',
            textAlign: 'center'
          }}>
            <span style={{ display: 'block', fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Orders</span>
            <strong style={{ fontSize: '1.25rem', color: '#ffffff' }}>{orders.length}</strong>
          </div>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '8px',
            padding: '12px 20px',
            textAlign: 'center'
          }}>
            <span style={{ display: 'block', fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reviews</span>
            <strong style={{ fontSize: '1.25rem', color: '#ffffff' }}>{reviews.length}</strong>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="dashboard-layout-grid" style={{ display: 'grid', gap: '32px' }}>
        
        {/* Navigation Sidebar */}
        <aside style={{ 
          backgroundColor: '#FFFFFF', 
          border: '1px solid var(--border-color)', 
          borderRadius: '12px', 
          padding: '20px', 
          height: 'fit-content',
          boxShadow: '0 4px 20px rgba(62,10,54,0.02)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              { id: 'profile', label: 'Profile Settings', icon: '👤' },
              { id: 'orders', label: 'My Orders', icon: '📦' },
              { id: 'reviews', label: 'Write Review', icon: '✍️' },
              { id: 'wishlist', label: 'My Wishlist', icon: '💖' },
              { id: 'addresses', label: 'Saved Addresses', icon: '📍' },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)} 
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '14px 18px',
                  background: activeTab === tab.id ? 'var(--color-primary)' : 'transparent',
                  color: activeTab === tab.id ? '#ffffff' : 'var(--color-text-primary)',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: activeTab === tab.id ? '0 8px 20px rgba(62,10,54,0.1)' : 'none'
                }}
                className="dashboard-tab-btn"
              >
                <span style={{ fontSize: '1rem' }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Content Area Panel */}
        <section style={{ 
          backgroundColor: '#FFFFFF', 
          border: '1px solid var(--border-color)', 
          borderRadius: '12px', 
          padding: '32px', 
          minHeight: '420px',
          boxShadow: '0 4px 20px rgba(62,10,54,0.02)'
        }}>
          {activeTab === 'profile' && (
            <div className="animate-fade-in">
              <h3 style={sectionTitleStyle}>Profile Management</h3>
              
              <div style={{ display: 'grid', gap: '32px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginTop: '24px' }}>
                {/* Column 1: Avatar Upload Control */}
                <div style={{ 
                  backgroundColor: 'var(--color-card-bg)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '12px', 
                  padding: '32px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  height: 'fit-content'
                }}>
                  <div style={{ 
                    position: 'relative', 
                    width: '120px', 
                    height: '120px', 
                    borderRadius: '50%', 
                    overflow: 'hidden', 
                    border: '4px solid var(--color-primary)', 
                    backgroundColor: '#FFFFFF', 
                    marginBottom: '20px',
                    boxShadow: '0 8px 24px rgba(62,10,54,0.08)' 
                  }}>
                    <img 
                      src={profileImageSrc} 
                      alt="Profile Avatar" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = getFallbackImage(); }}
                    />
                  </div>

                  <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: 'var(--color-primary-dark)', textTransform: 'none' }}>
                    {formData.name || 'User Profile'}
                  </h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '24px' }}>
                    {formData.email}
                  </span>

                  <div style={{ display: 'flex', gap: '8px', width: '100%', justifyContent: 'center' }}>
                    <label style={{ 
                      flex: 1,
                      display: 'inline-flex', 
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '10px 16px', 
                      backgroundColor: 'var(--color-secondary)', 
                      color: 'var(--color-primary)', 
                      borderRadius: '6px', 
                      cursor: 'pointer', 
                      fontWeight: '700', 
                      fontSize: '0.75rem',
                      transition: 'all 0.2s',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Upload Photo
                      <input 
                        type="file" 
                        accept="image/png,image/jpeg,image/gif,image/webp" 
                        onChange={handleImageChange} 
                        style={{ display: 'none' }} 
                      />
                    </label>
                    {imagePreview && (
                      <button 
                        type="button" 
                        onClick={clearImage} 
                        style={{ 
                          padding: '10px 16px', 
                          backgroundColor: '#FFF1F2', 
                          color: '#E11D48', 
                          border: '1px solid #FFE4E6', 
                          borderRadius: '6px', 
                          cursor: 'pointer', 
                          fontWeight: '700', 
                          fontSize: '0.75rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Column 2: Profile Update Form */}
                <div>
                  <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label htmlFor="profile-name" style={{
                        fontSize: '0.7rem',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: 'var(--color-text-secondary)'
                      }}>
                        Full Name
                      </label>
                      <input 
                        id="profile-name"
                        type="text" 
                        required 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})} 
                        className="form-input-premium"
                        style={{ backgroundColor: '#FFFFFF' }}
                      />
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label htmlFor="profile-email" style={{
                        fontSize: '0.7rem',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: 'var(--color-text-secondary)'
                      }}>
                        Email Address
                      </label>
                      <input 
                        id="profile-email"
                        type="email" 
                        required 
                        value={formData.email} 
                        onChange={e => setFormData({...formData, email: e.target.value})} 
                        className="form-input-premium"
                        style={{ backgroundColor: '#FFFFFF' }}
                      />
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label htmlFor="profile-phone" style={{
                        fontSize: '0.7rem',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: 'var(--color-text-secondary)'
                      }}>
                        Phone Number
                      </label>
                      <input 
                        id="profile-phone"
                        type="tel" 
                        value={formData.phone} 
                        onChange={e => setFormData({...formData, phone: e.target.value})} 
                        className="form-input-premium"
                        style={{ backgroundColor: '#FFFFFF' }}
                      />
                    </div>
                    
                    <button 
                      type="submit" 
                      disabled={isSaving} 
                      className="btn btn-primary"
                      style={{ 
                        width: 'fit-content', 
                        padding: '12px 28px',
                        cursor: isSaving ? 'not-allowed' : 'pointer', 
                        opacity: isSaving ? 0.7 : 1, 
                        marginTop: '8px'
                      }}
                    >
                      {isSaving ? 'Saving Changes...' : 'Save Profile'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div>
                <h3 style={sectionTitleStyle}>Live Tracking Shipments</h3>
                {orderMessage && <p style={{ color: 'var(--color-error)', fontWeight: '700' }}>{orderMessage}</p>}
                
                {orders.filter(order => !['Delivered', 'Refunded'].includes(order.status)).length === 0 ? (
                  <div style={emptyPortalStyle}>No active shipments in progress.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                    {orders.filter(order => !['Delivered', 'Refunded'].includes(order.status)).map(order => (
                      <div key={order._id} style={{ 
                        border: '1px solid var(--border-color)', 
                        borderRadius: '12px', 
                        padding: '24px', 
                        backgroundColor: order.status === 'Approved' ? '#f0fdf4' : 'var(--color-card-bg)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                          <div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>ORDER REFERENCE</span>
                            <strong style={{ fontSize: '0.9rem', color: 'var(--color-primary-dark)' }}>{order._id}</strong>
                          </div>
                          <span style={orderStatusStyle(order.status)}>{order.status}</span>
                        </div>
                        
                        <div style={portalGridStyle}>
                          <div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase' }}>Grand Total</span>
                            <strong style={{ color: 'var(--color-primary)' }}>GHS {Number(order.financials?.grandTotal || 0).toLocaleString()}</strong>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase' }}>Method</span>
                            <strong>{order.paymentMethod?.toUpperCase()}</strong>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase' }}>Delivery</span>
                            <strong>{order.deliveryType}</strong>
                          </div>
                        </div>
                        
                        <div style={{ 
                          marginTop: '20px', 
                          padding: '12px 16px', 
                          backgroundColor: '#ffffff', 
                          border: '1px solid var(--border-color)', 
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}>
                          <span style={{ fontSize: '1.2rem' }}>🚚</span>
                          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                            <strong>Tracking Update:</strong> {order.trackingUpdate}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 style={sectionTitleStyle}>Fulfillment History</h3>
                {orders.length === 0 ? (
                  <div style={emptyPortalStyle}>Your order invoices will display here once placed.</div>
                ) : (
                  <div style={{ marginTop: '16px', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
                    {orders.map((order, idx) => (
                      <div key={order._id} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        borderBottom: idx === orders.length - 1 ? 'none' : '1px solid var(--border-color)', 
                        padding: '20px 24px', 
                        flexWrap: 'wrap', 
                        gap: '16px',
                        backgroundColor: idx % 2 === 0 ? '#ffffff' : 'var(--color-card-bg)'
                      }}>
                        <div>
                          <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-primary-dark)' }}>
                            {order.items?.map(item => `${item.product?.name || 'Product'} (x${item.qty})`).join(', ')}
                          </strong>
                          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                            Placed on {new Date(order.createdAt).toLocaleDateString()} &bull; Total: GHS {Number(order.financials?.grandTotal || 0).toLocaleString()}
                          </span>
                        </div>
                        <span style={orderStatusStyle(order.status)}>{order.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="animate-fade-in">
              <h3 style={sectionTitleStyle}>Submit Customer Review</h3>
              {reviewMessage && (
                <div style={{ 
                  backgroundColor: reviewMessage.includes('submitted') ? 'rgba(46,125,50,0.08)' : 'rgba(198,40,40,0.08)',
                  color: reviewMessage.includes('submitted') ? 'var(--color-success)' : 'var(--color-error)',
                  padding: '12px 18px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  marginBottom: '20px'
                }}>
                  {reviewMessage}
                </div>
              )}

              <form onSubmit={submitReview} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '680px', marginBottom: '40px' }}>
                <div style={fieldStyle}>
                  <label htmlFor="review-product">Review Target</label>
                  <input 
                    id="review-product"
                    value={reviewForm.product} 
                    onChange={event => setReviewForm(prev => ({ ...prev, product: event.target.value }))} 
                    style={inputStyle} 
                  />
                </div>
                <div style={fieldStyle}>
                  <label htmlFor="review-rating">Rating Level</label>
                  <select 
                    id="review-rating"
                    value={reviewForm.rating} 
                    onChange={event => setReviewForm(prev => ({ ...prev, rating: event.target.value }))} 
                    style={inputStyle}
                  >
                    {[5, 4, 3, 2, 1].map(rating => <option key={rating} value={rating}>{rating} Star{rating === 1 ? '' : 's'}</option>)}
                  </select>
                </div>
                <div style={fieldStyle}>
                  <label htmlFor="review-text">Written Feedback</label>
                  <textarea 
                    id="review-text"
                    required 
                    value={reviewForm.text} 
                    onChange={event => setReviewForm(prev => ({ ...prev, text: event.target.value }))} 
                    rows="4" 
                    style={{ ...inputStyle, minHeight: '100px' }} 
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: 'fit-content' }}>
                  Submit Review
                </button>
              </form>

              <h3 style={sectionTitleStyle}>My Submitted Reviews</h3>
              {reviews.length === 0 ? (
                <div style={emptyPortalStyle}>You have not submitted any customer feedback.</div>
              ) : (
                <div style={{ display: 'grid', gap: '16px', marginTop: '16px' }}>
                  {reviews.map(review => (
                    <div key={review._id} style={{ 
                      border: '1px solid var(--border-color)', 
                      borderRadius: '12px', 
                      padding: '20px', 
                      backgroundColor: review.status === 'approved' ? '#f0fdf4' : review.status === 'rejected' ? '#fff1f2' : 'var(--color-card-bg)' 
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
                        <strong style={{ color: 'var(--color-primary-dark)', fontSize: '0.9rem' }}>{review.product}</strong>
                        <span style={orderStatusStyle(review.status === 'approved' ? 'Approved' : review.status === 'rejected' ? 'Refunded' : 'Processing')}>{review.status}</span>
                      </div>
                      <p style={{ margin: '8px 0', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>{review.text}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '12px', borderTop: '1px solid rgba(0,0,0,0.03)', paddingTop: '8px' }}>
                        <span>Rating: {'★'.repeat(review.rating) + '☆'.repeat(5 - review.rating)}</span>
                        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="animate-fade-in">
              <h3 style={sectionTitleStyle}>My Active Wishlist</h3>
              {wishlist.length === 0 ? (
                <div style={emptyPortalStyle}>No items currently in your wishlist.</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', marginTop: '16px' }}>
                  {wishlist.map(item => (
                    <div key={item._id || item.id} style={{ 
                      border: '1px solid var(--border-color)', 
                      borderRadius: '12px', 
                      padding: '20px', 
                      textAlign: 'center',
                      backgroundColor: '#FFFFFF',
                      transition: 'transform 0.2s',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
                    }} className="product-card">
                      <div style={{ width: '100%', height: '120px', backgroundColor: 'var(--color-card-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', overflow: 'hidden', marginBottom: '12px' }}>
                        {item.img && (item.img.startsWith('/') || item.img.startsWith('http') || item.img.startsWith('data:image')) ? (
                          <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '8px' }} />
                        ) : (
                          <span style={{ fontSize: '2.5rem' }}>{item.img || '📦'}</span>
                        )}
                      </div>
                      <h4 style={{ margin: '0 0 6px 0', fontSize: '0.85rem', color: 'var(--color-text-dark)', textTransform: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</h4>
                      <strong style={{ color: 'var(--color-primary)', display: 'block', marginBottom: '16px', fontSize: '0.9rem' }}>GHS {Number(item.price || 0).toLocaleString()}</strong>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => { onItemAdd(item); }}
                          className="btn btn-primary btn-sm" 
                          style={{ flex: 1, padding: '10px 0', fontSize: '0.72rem' }}
                        >
                          Add to Cart
                        </button>
                        <button 
                          onClick={() => onToggleWishlist(item)}
                          className="btn btn-outline btn-sm" 
                          style={{ padding: '10px 0', flex: 1, fontSize: '0.72rem', color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
                          onMouseOver={(e) => { e.target.style.backgroundColor = 'rgba(198, 40, 40, 0.05)'; }}
                          onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="animate-fade-in">
              <h3 style={sectionTitleStyle}>Logistics Shipping Terminals</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                {addresses.map(addr => (
                  <div key={addr.id} style={{ 
                    border: `1px solid ${addr.current ? 'var(--color-primary)' : 'var(--border-color)'}`, 
                    padding: '24px', 
                    borderRadius: '12px', 
                    position: 'relative',
                    backgroundColor: addr.current ? 'rgba(62,10,54,0.01)' : '#ffffff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
                  }}>
                    {addr.current && (
                      <span style={{ 
                        position: 'absolute', 
                        top: '20px', 
                        right: '24px', 
                        backgroundColor: 'var(--color-secondary)', 
                        color: 'var(--color-primary)', 
                        fontSize: '0.65rem', 
                        fontWeight: '800', 
                        padding: '4px 10px', 
                        borderRadius: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Primary Terminal
                      </span>
                    )}
                    <strong style={{ display: 'block', marginBottom: '8px', fontSize: '0.95rem', color: 'var(--color-primary-dark)' }}>{addr.type}</strong>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{addr.street}, {addr.city}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      <style>{`
        @media (min-width: 769px) {
          .dashboard-layout-grid { grid-template-columns: 280px 1fr !important; }
        }
        @media (max-width: 768px) {
          .dashboard-layout-grid { grid-template-columns: 1fr !important; }
        }
        .dashboard-tab-btn:hover {
          background-color: var(--color-secondary-light) !important;
          color: var(--color-primary) !important;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const sectionTitleStyle = {
  margin: '0 0 20px 0',
  fontSize: '1.25rem',
  color: 'var(--color-primary-dark)',
  borderBottom: '2px solid var(--color-secondary)',
  paddingBottom: '10px',
  textTransform: 'uppercase',
  letterSpacing: '0.02em'
};

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  boxSizing: 'border-box',
  fontSize: '0.9rem',
  outline: 'none',
  transition: 'all 0.2s ease-in-out'
};

const fieldStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  color: 'var(--color-text-secondary)',
  fontSize: '0.7rem',
  fontWeight: '800',
  textTransform: 'uppercase',
  letterSpacing: '0.08em'
};

const orderStatusStyle = status => ({
  fontWeight: '800',
  color: status === 'Approved' || status === 'Delivered' ? 'var(--color-success)' : status === 'Refunded' ? 'var(--color-error)' : 'var(--color-primary)',
  backgroundColor: status === 'Approved' || status === 'Delivered' ? 'rgba(46,125,50,0.08)' : status === 'Refunded' ? 'rgba(198,40,40,0.08)' : 'var(--color-secondary)',
  padding: '6px 14px',
  borderRadius: '999px',
  fontSize: '0.7rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
});

const portalGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
  gap: '16px',
  marginTop: '16px'
};

const emptyPortalStyle = {
  padding: '32px',
  textAlign: 'center',
  color: 'var(--color-text-muted)',
  border: '2px dashed var(--border-color)',
  borderRadius: '12px',
  fontSize: '0.85rem'
};
