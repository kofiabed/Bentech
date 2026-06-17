import { useState } from 'react';

export default function CartCheckout({ isUserLoggedIn, onRedirectToLogin, cartItems, onCartCleared, user }) {
  const [cart, setCart] = useState(cartItems || []);
  const [savedForLater, setSavedForLater] = useState([]);
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const [shipping, setShipping] = useState({ name: user?.name || '', phone: user?.phone || '', address: '', city: 'Accra', deliveryType: 'standard' });
  const [paymentMethod, setPaymentMethod] = useState('momo');
  const [orderComplete, setOrderComplete] = useState(false);

  const [momoNumber, setMomoNumber] = useState(user?.phone || '');
  const [momoProvider, setMomoProvider] = useState('mtn');
  const [cardName, setCardName] = useState(user?.name || '');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const updateQty = (id, amount) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const stockLimit = item.availableStock || item.stock || 999;
        const newQty = item.qty + amount;
        return newQty > 0 && newQty <= stockLimit ? { ...item, qty: newQty } : item;
      }
      return item;
    }));
  };

  const removeItem = (id) => setCart(prev => prev.filter(item => item.id !== id));

  const handleSaveForLater = (item) => {
    removeItem(item.id);
    setSavedForLater(prev => [...prev, item]);
  };

  const handleMoveToCart = (item) => {
    setSavedForLater(prev => prev.filter(i => i.id !== item.id));
    setCart(prev => [...prev, { ...item, qty: 1 }]);
  };

  const applyCoupon = (e) => {
    e.preventDefault();
    if (coupon.toUpperCase() === 'TECHNOVA10') {
      setDiscount(0.10);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code. Try TECHNOVA10.');
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const discountAmount = subtotal * discount;
  const deliveryFee = shipping.deliveryType === 'express' ? 50 : 20;
  const taxAmount = (subtotal - discountAmount) * 0.15;
  const totalOrderAmount = subtotal - discountAmount + taxAmount + deliveryFee;

  const buildOrderPayload = (extra = {}) => ({
    items: cart.map(item => ({ product: item._id || item.id, qty: item.qty, priceAtPurchase: item.price })),
    shippingDetails: shipping,
    deliveryType: shipping.deliveryType,
    paymentMethod,
    financials: { subtotal: cart.reduce((sum, i) => sum + i.price * i.qty, 0), discountAmount: subtotal * discount, taxAmount: (subtotal * (1 - discount)) * 0.15, deliveryFee: shipping.deliveryType === 'express' ? 50 : 20, grandTotal: totalOrderAmount },
    ...extra
  });

  const createOrder = async (extra = {}) => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(buildOrderPayload(extra))
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Order failed.');
    return data.data;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (paymentMethod === 'card') {
      try {
        const response = await fetch('/api/payment/initialize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user?.email || 'customer@technova.gh', amount: totalOrderAmount })
        });
        const data = await response.json();
        if (data?.authorization_url && data.reference) {
          localStorage.setItem('pendingOrder', JSON.stringify({ ...buildOrderPayload({ reference: data.reference, paymentReference: data.reference, paymentStatus: 'pending' }), reference: data.reference, paymentReference: data.reference, paymentStatus: 'pending' }));
          window.location.href = data.authorization_url;
        } else {
          alert('Payment initialization failed');
        }
      } catch (err) {
        alert('Payment error: ' + err.message);
      }
    } else {
      try {
        await createOrder({ paymentStatus: 'paid' });
        setCart([]);
        onCartCleared && onCartCleared();
        setOrderComplete(true);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  if (orderComplete) {
    return (
      <div style={{ maxWidth: '600px', margin: 'clamp(32px, 6vw, 60px) auto', padding: '16px' }} className="animate-fade-in">
        <div style={{ 
          backgroundColor: '#FFFFFF', 
          border: '1px solid var(--border-color)', 
          borderRadius: '16px', 
          padding: 'clamp(24px, 4vw, 48px) clamp(16px, 3vw, 32px)', 
          textAlign: 'center',
          boxShadow: '0 10px 40px rgba(62, 10, 54, 0.05)'
        }}>
          <div style={{ 
            width: '72px', 
            height: '72px', 
            borderRadius: '50%', 
            backgroundColor: 'rgba(46, 125, 50, 0.08)', 
            color: 'var(--color-success)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '2.2rem',
            margin: '0 auto 20px'
          }}>
            <i className="bi bi-check-lg"></i>
          </div>
          <h2 style={{ fontSize: 'clamp(1.4rem, 4vw, 1.8rem)', fontWeight: '800', color: 'var(--color-primary-dark)', margin: '0 0 12px', textTransform: 'none' }}>
            Order Placed Successfully!
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', margin: '0 0 28px' }}>
            Thank you for shopping with Ben-TechNova-Ghana. Your transaction is complete, and we have dispatched logistics synchronization routines.
          </p>
          <button 
            onClick={() => { setIsCheckingOut(false); setOrderComplete(false); }} 
            className="btn btn-primary"
            style={{ width: '100%', maxWidth: '320px', padding: '14px' }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: 'clamp(16px, 4vw, 40px) var(--space-lg)' }} className="animate-fade-in">
      
      {/* Title block */}
      <div style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
        <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: '900', color: 'var(--color-primary-dark)', margin: 0, textTransform: 'none', letterSpacing: '-0.03em' }}>
          {isCheckingOut ? 'Checkout Details' : 'Shopping Cart'}
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
          {isCheckingOut ? 'Complete your delivery and payment coordinates below.' : 'Review premium selections cached inside your active session.'}
        </p>
      </div>

      {cart.length === 0 && !isCheckingOut ? (
        <div style={{ 
          textAlign: 'center', 
          padding: 'clamp(32px, 6vw, 64px) clamp(16px, 3vw, 32px)', 
          backgroundColor: 'var(--color-card-bg)', 
          border: '1px dashed var(--border-color)', 
          borderRadius: '12px'
        }}>
          <div style={{ 
            width: '56px', 
            height: '56px', 
            borderRadius: '50%', 
            backgroundColor: '#ffffff', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '1.6rem',
            color: 'var(--color-text-muted)',
            margin: '0 auto 14px',
            border: '1px solid var(--border-color)'
          }}>
            <i className="bi bi-cart-x"></i>
          </div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: '0 0 16px' }}>Your shopping cart is currently empty.</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary btn-sm">Browse Products</button>
        </div>
      ) : (
        <div className="cart-layout" style={{ display: 'grid', gap: '24px' }}>
          
          {/* Left Side: Items or Checkout Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {!isCheckingOut ? (
              <div style={{ 
                backgroundColor: '#FFFFFF', 
                border: '1px solid var(--border-color)', 
                borderRadius: '12px', 
                padding: 'clamp(16px, 3vw, 24px)'
              }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--color-primary-dark)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px', textTransform: 'none' }}>
                  Items in Cart ({cart.length})
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {cart.map(item => (
                    <div key={item.id} style={{ 
                      display: 'flex', 
                      gap: '12px', 
                      paddingBottom: '16px', 
                      borderBottom: '1px solid var(--border-color)',
                      flexWrap: 'wrap',
                      alignItems: 'flex-start'
                    }}>
                      
                      {/* Product Image */}
                      <div style={{ 
                        width: '72px', 
                        height: '72px', 
                        borderRadius: '8px', 
                        backgroundColor: 'var(--color-card-bg)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        flexShrink: 0, 
                        overflow: 'hidden',
                        border: '1px solid var(--border-color)'
                      }}>
                        {item.img && item.img.startsWith('data:image') ? (
                          <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                        ) : (
                          <span style={{ fontSize: '1.8rem' }}>{item.img || '📦'}</span>
                        )}
                      </div>

                      {/* Details */}
                      <div style={{ flex: '1 1 140px', minWidth: 0 }}>
                        <span style={{ fontSize: '0.6rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.05em', display: 'block', marginBottom: '2px' }}>
                          {item.brand || 'TechNova'}
                        </span>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-text-dark)', textTransform: 'none' }}>
                          {item.name}
                        </h4>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '0.7rem', marginTop: '8px', flexWrap: 'wrap' }}>
                          <button 
                            onClick={() => handleSaveForLater(item)} 
                            style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: '700', padding: 0 }}
                          >
                            <i className="bi bi-bookmark-star-fill"></i> Save for later
                          </button>
                          <button 
                            onClick={() => removeItem(item.id)} 
                            style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', fontWeight: '700', padding: 0 }}
                          >
                            <i className="bi bi-trash3-fill"></i> Remove
                          </button>
                        </div>
                      </div>

                      {/* Quantity Control */}
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--color-card-bg)' }}>
                        <button 
                          onClick={() => updateQty(item.id, -1)} 
                          style={{ background: 'none', border: 'none', width: '32px', height: '32px', cursor: 'pointer', fontWeight: '600', color: 'var(--color-text-primary)', transition: 'background-color 0.2s' }}
                          onMouseOver={e => e.currentTarget.style.backgroundColor = '#E2E8F0'}
                          onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          &minus;
                        </button>
                        <span style={{ fontWeight: '700', minWidth: '28px', textAlign: 'center', fontSize: '0.85rem' }}>{item.qty}</span>
                        <button 
                          onClick={() => updateQty(item.id, 1)} 
                          style={{ background: 'none', border: 'none', width: '32px', height: '32px', cursor: 'pointer', fontWeight: '600', color: 'var(--color-text-primary)', transition: 'background-color 0.2s' }}
                          onMouseOver={e => e.currentTarget.style.backgroundColor = '#E2E8F0'}
                          onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          +
                        </button>
                      </div>

                      {/* Pricing */}
                      <div style={{ minWidth: '100px', textAlign: 'right' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--color-primary-dark)', display: 'block' }}>
                          GHS {(item.price * item.qty).toLocaleString()}
                        </span>
                        <small style={{ color: 'var(--color-text-muted)', fontSize: '0.65rem' }}>
                          GHS {item.price.toLocaleString()} each
                        </small>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* 1. Shipping Details */}
                <div style={{ 
                  backgroundColor: '#FFFFFF', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '12px', 
                  padding: 'clamp(16px, 3vw, 24px)'
                }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--color-primary-dark)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px', textTransform: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: '#FFFFFF', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0 }}>1</span>
                    Shipping Information
                  </h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label htmlFor="shipping-name" style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-secondary)', letterSpacing: '0.04em' }}>Full Name</label>
                      <input 
                        id="shipping-name" 
                        type="text" 
                        required 
                        value={shipping.name} 
                        onChange={e => setShipping({...shipping, name: e.target.value})} 
                        className="form-input-premium"
                        style={{ borderRadius: '8px', backgroundColor: '#FFFFFF' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label htmlFor="shipping-phone" style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-secondary)', letterSpacing: '0.04em' }}>Phone Number</label>
                      <input 
                        id="shipping-phone" 
                        type="tel" 
                        required 
                        placeholder="024XXXXXXX" 
                        value={shipping.phone} 
                        onChange={e => setShipping({...shipping, phone: e.target.value})} 
                        className="form-input-premium"
                        style={{ borderRadius: '8px', backgroundColor: '#FFFFFF' }}
                      />
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                    <label htmlFor="shipping-address" style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-secondary)', letterSpacing: '0.04em' }}>Logistics Address</label>
                    <input 
                      id="shipping-address" 
                      type="text" 
                      required 
                      placeholder="Digital Address (e.g. GA-123-4567) or Street Location" 
                      value={shipping.address} 
                      onChange={e => setShipping({...shipping, address: e.target.value})} 
                      className="form-input-premium"
                      style={{ borderRadius: '8px', backgroundColor: '#FFFFFF' }}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label htmlFor="shipping-city" style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-secondary)', letterSpacing: '0.04em' }}>City / Region</label>
                    <select 
                      id="shipping-city" 
                      value={shipping.city} 
                      onChange={e => setShipping({...shipping, city: e.target.value})} 
                      className="form-input-premium form-select-premium"
                      style={{ borderRadius: '8px', backgroundColor: '#FFFFFF' }}
                    >
                      <option value="Accra">Accra (Greater Accra)</option>
                      <option value="Kumasi">Kumasi (Ashanti)</option>
                      <option value="Takoradi">Takoradi (Western)</option>
                      <option value="Tamale">Tamale (Northern)</option>
                    </select>
                  </div>
                </div>

                {/* 2. Delivery Options */}
                <div style={{ 
                  backgroundColor: '#FFFFFF', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '12px', 
                  padding: 'clamp(16px, 3vw, 24px)'
                }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--color-primary-dark)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px', textTransform: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: '#FFFFFF', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0 }}>2</span>
                    Delivery Service
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      { key: 'standard', title: 'Standard Courier Shipping', cost: 20, desc: 'Delivered in 2-3 business days' },
                      { key: 'express', title: 'Express Rush Dispatch', cost: 50, desc: 'Delivered within 24 hours (Accra/Tema only)' },
                    ].map(opt => {
                      const isActive = shipping.deliveryType === opt.key;
                      return (
                        <label 
                          key={opt.key} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '12px', 
                            padding: '14px', 
                            border: `1px solid ${isActive ? 'var(--color-primary)' : 'var(--border-color)'}`, 
                            backgroundColor: isActive ? 'var(--color-secondary-light)' : '#ffffff', 
                            borderRadius: '8px', 
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          <input 
                            type="radio" 
                            name="delivery" 
                            checked={isActive} 
                            onChange={() => setShipping({...shipping, deliveryType: opt.key})} 
                            style={{ accentColor: 'var(--color-primary)', width: '16px', height: '16px', flexShrink: 0 }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <strong style={{ fontSize: '0.85rem', color: 'var(--color-text-dark)' }}>{opt.title}</strong>
                            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>{opt.desc}</div>
                          </div>
                          <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--color-primary)', whiteSpace: 'nowrap' }}>
                            GHS {opt.cost}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Payment Method */}
                <div style={{ 
                  backgroundColor: '#FFFFFF', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '12px', 
                  padding: 'clamp(16px, 3vw, 24px)'
                }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--color-primary-dark)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px', textTransform: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: '#FFFFFF', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0 }}>3</span>
                    Payment Method
                  </h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
                    {[
                      { key: 'momo', icon: 'bi-phone', label: 'Mobile Money' },
                      { key: 'card', icon: 'bi-credit-card', label: 'Credit/Debit Card' },
                      { key: 'cod', icon: 'bi-cash-coin', label: 'Cash On Delivery' },
                    ].map(pm => {
                      const isActive = paymentMethod === pm.key;
                      return (
                        <div 
                          key={pm.key} 
                          onClick={() => setPaymentMethod(pm.key)} 
                          style={{ 
                            border: `1px solid ${isActive ? 'var(--color-primary)' : 'var(--border-color)'}`, 
                            backgroundColor: isActive ? 'var(--color-secondary-light)' : '#ffffff', 
                            borderRadius: '8px', 
                            padding: '16px 12px', 
                            textAlign: 'center', 
                            cursor: 'pointer', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '8px', 
                            alignItems: 'center',
                            transition: 'all 0.2s',
                            boxShadow: isActive ? '0 4px 12px rgba(62, 10, 54, 0.05)' : 'none'
                          }}
                          onMouseOver={e => { if(!isActive) e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
                          onMouseOut={e => { if(!isActive) e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                        >
                          <div style={{ fontSize: '1.5rem', color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
                            <i className={`bi ${pm.icon}`}></i>
                          </div>
                          <strong style={{ fontSize: '0.75rem', color: 'var(--color-text-dark)', fontWeight: '700' }}>{pm.label}</strong>
                        </div>
                      );
                    })}
                  </div>

                  {/* Dynamic Payment Inputs */}
                  <div style={{ marginTop: '20px', borderTop: '1px dashed var(--border-color)', paddingTop: '16px' }}>
                    {paymentMethod === 'momo' && (
                      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h4 style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--color-primary-dark)', margin: 0, textTransform: 'none' }}>
                          Mobile Money Billing Details
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label htmlFor="momo-provider" style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-secondary)', letterSpacing: '0.04em' }}>Network Provider</label>
                            <select 
                              id="momo-provider" 
                              value={momoProvider} 
                              onChange={e => setMomoProvider(e.target.value)} 
                              className="form-input-premium form-select-premium"
                              style={{ borderRadius: '8px', backgroundColor: '#FFFFFF' }}
                            >
                              <option value="mtn">MTN Mobile Money</option>
                              <option value="telecel">Telecel Cash (Vodafone)</option>
                              <option value="airteltigo">AT Money (AirtelTigo)</option>
                            </select>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label htmlFor="momo-number" style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-secondary)', letterSpacing: '0.04em' }}>MoMo Phone Number</label>
                            <input 
                              id="momo-number" 
                              type="tel" 
                              required 
                              placeholder="024XXXXXXX" 
                              value={momoNumber} 
                              onChange={e => setMomoNumber(e.target.value)} 
                              className="form-input-premium"
                              style={{ borderRadius: '8px', backgroundColor: '#FFFFFF' }}
                            />
                          </div>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                          A prompt will be pushed to this mobile number for authorization.
                        </span>
                      </div>
                    )}

                    {paymentMethod === 'card' && (
                      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h4 style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--color-primary-dark)', margin: 0, textTransform: 'none' }}>
                          Debit/Credit Card Details
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label htmlFor="card-name" style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-secondary)', letterSpacing: '0.04em' }}>Cardholder Name</label>
                          <input 
                            id="card-name" 
                            type="text" 
                            required 
                            placeholder="Richard Kwaku Opoku" 
                            value={cardName} 
                            onChange={e => setCardName(e.target.value)} 
                            className="form-input-premium"
                            style={{ borderRadius: '8px', backgroundColor: '#FFFFFF' }}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label htmlFor="card-number" style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-secondary)', letterSpacing: '0.04em' }}>Card Number</label>
                          <input 
                            id="card-number" 
                            type="text" 
                            required 
                            maxLength="19"
                            placeholder="1234 5678 1234 5678" 
                            value={cardNumber} 
                            onChange={e => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())} 
                            className="form-input-premium"
                            style={{ borderRadius: '8px', backgroundColor: '#FFFFFF' }}
                          />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label htmlFor="card-expiry" style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-secondary)', letterSpacing: '0.04em' }}>Expiry Date</label>
                            <input 
                              id="card-expiry" 
                              type="text" 
                              required 
                              maxLength="5"
                              placeholder="MM/YY" 
                              value={cardExpiry} 
                              onChange={e => setCardExpiry(e.target.value)} 
                              className="form-input-premium"
                              style={{ borderRadius: '8px', backgroundColor: '#FFFFFF' }}
                            />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label htmlFor="card-cvv" style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-secondary)', letterSpacing: '0.04em' }}>CVV</label>
                            <input 
                              id="card-cvv" 
                              type="password" 
                              required 
                              maxLength="4"
                              placeholder="123" 
                              value={cardCvv} 
                              onChange={e => setCardCvv(e.target.value)} 
                              className="form-input-premium"
                              style={{ borderRadius: '8px', backgroundColor: '#FFFFFF' }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'cod' && (
                      <div className="animate-fade-in" style={{ padding: '12px 16px', backgroundColor: 'var(--color-secondary-light)', borderRadius: '8px', border: '1px solid var(--color-secondary)' }}>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-primary-dark)', fontWeight: '600' }}>
                          <i className="bi bi-info-circle-fill"></i> Cash on Delivery Selected
                        </p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                          Please verify your shipping details. You will pay the courier when your package arrives.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Actions */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button 
                    type="button" 
                    onClick={() => setIsCheckingOut(false)} 
                    className="btn btn-outline" 
                    style={{ flex: 1, padding: '14px' }}
                  >
                    Back to Cart
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ flex: 2, padding: '14px', boxShadow: '0 4px 15px rgba(62, 10, 54, 0.15)' }}
                  >
                    Authorize GHS {totalOrderAmount.toLocaleString()}
                  </button>
                </div>

              </form>
            )}

            {/* Saved items */}
            {!isCheckingOut && savedForLater.length > 0 && (
              <div style={{ 
                backgroundColor: 'var(--color-card-bg)', 
                border: '1px solid var(--border-color)', 
                borderRadius: '12px', 
                padding: 'clamp(16px, 3vw, 24px)'
              }}>
                <h4 style={{ margin: '0 0 14px 0', fontSize: '0.95rem', fontWeight: '800', color: 'var(--color-primary-dark)', textTransform: 'none' }}>
                  Saved Items ({savedForLater.length})
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {savedForLater.map(item => (
                    <div key={item.id} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '12px 14px', 
                      background: '#ffffff', 
                      borderRadius: '8px', 
                      border: '1px solid var(--border-color)',
                      flexWrap: 'wrap',
                      gap: '10px'
                    }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: '1 1 auto', minWidth: 0 }}>
                        <span style={{ 
                          width: '36px', 
                          height: '36px', 
                          borderRadius: '6px', 
                          backgroundColor: 'var(--color-card-bg)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          overflow: 'hidden',
                          border: '1px solid var(--border-color)',
                          flexShrink: 0
                        }}>
                          {item.img && item.img.startsWith('data:image') ? (
                            <img src={item.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                          ) : (
                            <span style={{ fontSize: '1.1rem' }}>{item.img || '📦'}</span>
                          )}
                        </span>
                        <div style={{ minWidth: 0 }}>
                          <strong style={{ fontSize: '0.82rem', color: 'var(--color-text-dark)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</strong>
                          <span style={{ fontSize: '0.72rem', color: 'var(--color-primary)', fontWeight: '700' }}>GHS {item.price.toLocaleString()}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleMoveToCart(item)} 
                        className="btn btn-outline btn-sm"
                        style={{ padding: '8px 14px', flexShrink: 0 }}
                      >
                        Move to cart
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Side: Order Summary Card */}
          <aside style={{ height: 'fit-content', position: 'sticky', top: '24px' }}>
            <div style={{ 
              backgroundColor: '#FFFFFF', 
              border: '1px solid var(--border-color)', 
              borderRadius: '12px', 
              padding: 'clamp(16px, 3vw, 24px)',
              boxShadow: '0 4px 20px rgba(62, 10, 54, 0.02)'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--color-primary-dark)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px', textTransform: 'none' }}>
                Order Summary
              </h3>
              
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '12px', 
                fontSize: '0.82rem', 
                paddingBottom: '16px', 
                borderBottom: '1px solid var(--border-color)' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
                  <span>Subtotal</span>
                  <span style={{ fontWeight: '700', color: 'var(--color-text-dark)' }}>GHS {subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)', fontWeight: '700' }}>
                    <span>Discount (10%)</span>
                    <span>- GHS {discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
                  <span>VAT (15%)</span>
                  <span style={{ fontWeight: '700', color: 'var(--color-text-dark)' }}>GHS {taxAmount.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
                  <span>Delivery Fee</span>
                  <span style={{ fontWeight: '700', color: 'var(--color-text-dark)' }}>GHS {deliveryFee}</span>
                </div>
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '16px 0', 
                fontSize: 'clamp(1.1rem, 3vw, 1.35rem)', 
                fontWeight: '900', 
                color: 'var(--color-primary-dark)' 
              }}>
                <span>Total GHS</span>
                <span>GHS {totalOrderAmount.toLocaleString()}</span>
              </div>

              {/* Coupon Form */}
              {!isCheckingOut && (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginBottom: '16px' }}>
                  <form onSubmit={applyCoupon} style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      placeholder="Coupon Code" 
                      value={coupon} 
                      onChange={e => setCoupon(e.target.value)} 
                      className="form-input-premium"
                      style={{ borderRadius: '8px', padding: '8px 12px', fontSize: '0.78rem', backgroundColor: 'var(--color-card-bg)', flex: 1 }}
                    />
                    <button type="submit" className="btn btn-primary btn-sm" style={{ borderRadius: '8px', padding: '8px 14px' }}>Apply</button>
                  </form>
                  {couponError && <p style={{ color: 'var(--color-error)', fontSize: '0.72rem', margin: '6px 0 0 0', fontWeight: '700' }}>{couponError}</p>}
                  {discount > 0 && <p style={{ color: 'var(--color-success)', fontSize: '0.72rem', margin: '6px 0 0 0', fontWeight: '700' }}><i className="bi bi-patch-check-fill"></i> Coupon code applied successfully!</p>}
                </div>
              )}

              {/* Action Buttons */}
              {!isCheckingOut && (
                isUserLoggedIn ? (
                  <button 
                    onClick={() => setIsCheckingOut(true)} 
                    className="btn btn-primary btn-lg" 
                    style={{ width: '100%', borderRadius: '8px', padding: '14px', boxShadow: '0 4px 15px rgba(62, 10, 54, 0.12)' }}
                  >
                    Proceed to Checkout
                  </button>
                ) : (
                  <button 
                    onClick={onRedirectToLogin} 
                    className="btn btn-primary btn-lg" 
                    style={{ width: '100%', borderRadius: '8px', padding: '14px', backgroundColor: 'var(--color-error)', boxShadow: '0 4px 15px rgba(198, 40, 40, 0.15)' }}
                  >
                    Sign in to Checkout
                  </button>
                )
              )}
            </div>
          </aside>

        </div>
      )}

      <style>{`
        @media (min-width: 769px) { .cart-layout { grid-template-columns: 1fr 340px !important; } }
        @media (max-width: 768px) { .cart-layout { grid-template-columns: 1fr !important; } }
        @media (max-width: 480px) {
          .cart-layout [style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}