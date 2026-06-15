import { useCallback, useEffect, useState } from 'react';

const API = 'http://localhost:5000/api';

export default function SuccessPage({ onNavigate, onClearCart }) {
  const getReferenceFromUrl = () => new URLSearchParams(window.location.search).get('reference') || '';
  const [reference] = useState(getReferenceFromUrl);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [order, setOrder] = useState(null);

  const createOrderFromPendingPayment = useCallback(async () => {
    const pendingOrderText = localStorage.getItem('pendingOrder');
    if (!pendingOrderText) {
      throw new Error('Payment was verified, but no pending order payload was found.');
    }

    const pendingOrder = JSON.parse(pendingOrderText);
    const response = await fetch(`${API}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        ...pendingOrder,
        paymentStatus: 'paid',
        paymentReference: reference
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Order could not be created after payment.');
    }

    localStorage.removeItem('pendingOrder');
    setOrder(data.data);
    onClearCart && onClearCart();
  }, [onClearCart, reference]);

  const verifyPayment = useCallback(async (ref) => {
    try {
      const response = await fetch(`${API}/payment/verify/${ref}`);
      const data = await response.json();
      if (data.status !== 'success') {
        setStatus('failed');
        setMessage(data.message || 'Payment verification failed.');
        return;
      }

      setStatus('creating');
      setMessage('Payment verified. Creating your order in the portal...');
      await createOrderFromPendingPayment();
      setStatus('success');
      setMessage('Payment successful. Your order has been placed and will appear in your portal.');
    } catch (err) {
      setStatus('failed');
      setMessage(err.message);
    }
  }, [createOrderFromPendingPayment]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (reference) {
        verifyPayment(reference);
      } else {
        setStatus('placeholder');
        setMessage('No payment reference was found. This page is ready for Paystack callback references.');
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, [reference, verifyPayment]);

  return (
    <div style={pageStyle} className="animate-fade-in">
      <div style={cardStyle}>
        <div style={statusIconStyle(status)}>
          {status === 'success' ? '✓' : status === 'failed' ? '!' : status === 'creating' ? '...' : '?'}
        </div>

        <span style={eyebrowStyle}>{status === 'success' ? 'Payment Approved' : status === 'failed' ? 'Payment Needs Attention' : 'Paystack Payment Portal'}</span>

        <h1 style={titleStyle}>
          {status === 'success' ? 'Payment Successful' : status === 'failed' ? 'Payment Could Not Be Completed' : status === 'creating' ? 'Creating Your Order' : 'Payment Verification Placeholder'}
        </h1>

        <p style={messageStyle}>{message}</p>

        {reference && (
          <div style={referenceBoxStyle}>
            <span>Transaction Reference</span>
            <strong>{reference}</strong>
          </div>
        )}

        {order && (
          <div style={orderBoxStyle}>
            <div>
              <span>Order Reference</span>
              <strong>{order._id}</strong>
            </div>
            <div>
              <span>Current Status</span>
              <strong>{order.status}</strong>
            </div>
            <div>
              <span>Total Paid</span>
              <strong>GHS {Number(order.financials?.grandTotal || 0).toLocaleString()}</strong>
            </div>
          </div>
        )}

        {status === 'placeholder' && (
          <div style={placeholderStyle}>
            <strong>Developer Placeholder</strong>
            <p>This page is connected to Paystack through the backend verification route. After Paystack redirects back with a <code>reference</code> query parameter, the order is verified and created automatically.</p>
          </div>
        )}

        <div style={actionsStyle}>
          <button onClick={() => onNavigate('home')} style={primaryButtonStyle}>Return To Shop</button>
          <button onClick={() => onNavigate('dashboard')} style={secondaryButtonStyle}>View Portal</button>
        </div>
      </div>
    </div>
  );
}

const pageStyle = { maxWidth: '760px', margin: '48px auto', padding: '16px' };
const cardStyle = { background: '#FFFFFF', border: '1px solid var(--color-secondary)', borderRadius: '24px', padding: '32px', boxShadow: '0 18px 50px rgba(62, 10, 54, 0.12)', textAlign: 'center' };
const statusIconStyle = status => ({ width: '76px', height: '76px', margin: '0 auto 20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: '900', background: status === 'success' ? '#E8F5E9' : status === 'failed' ? '#FFEBEE' : 'var(--color-secondary-light)', color: status === 'success' ? 'var(--color-success)' : status === 'failed' ? '#C62828' : 'var(--color-primary)' });
const eyebrowStyle = { color: 'var(--color-primary)', fontWeight: '900', letterSpacing: '0.12em', fontSize: '0.78rem', textTransform: 'uppercase' };
const titleStyle = { margin: '10px 0 12px', color: 'var(--color-primary)', fontSize: 'clamp(1.8rem, 5vw, 2.7rem)', letterSpacing: '-0.04em' };
const messageStyle = { color: 'var(--color-text-secondary)', lineHeight: 1.7, margin: 0 };
const referenceBoxStyle = { marginTop: '24px', padding: '16px', borderRadius: '16px', background: '#F8FAFC', border: '1px dashed var(--color-primary)' };
const orderBoxStyle = { marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '10px', textAlign: 'left' };
const placeholderStyle = { marginTop: '24px', padding: '18px', borderRadius: '16px', background: '#EAF3FF', color: 'var(--color-text-dark)', textAlign: 'left', lineHeight: 1.6 };
const actionsStyle = { display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '28px', flexWrap: 'wrap' };
const primaryButtonStyle = { background: 'var(--color-primary)', color: '#FFFFFF', border: 'none', borderRadius: '12px', padding: '13px 22px', fontWeight: '900', cursor: 'pointer' };
const secondaryButtonStyle = { background: 'var(--color-secondary)', color: 'var(--color-primary)', border: 'none', borderRadius: '12px', padding: '13px 22px', fontWeight: '900', cursor: 'pointer' };
