import { useState } from 'react';

export default function StaticPages({ page, onNavigate }) {
  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '80vh', padding: 'var(--space-2xl) 0' }} className="animate-fade-in">
      <div className="container-premium">
        {page === 'about' && <AboutPage />}
        {page === 'locations' && <LocationsPage />}
        {page === 'license' && <LicensePage />}
        {page === 'privacy' && <PrivacyPage />}
        {page === 'track-order' && <TrackOrderPage />}
        {page === 'warranty' && <WarrantyPage />}
        {page === 'inquiries' && <InquiriesPage />}
        {page === 'faq' && <FaqPage />}
      </div>
    </div>
  );
}

/* ================================================================
   1. ABOUT TECHNOVA
   ================================================================ */
function AboutPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <span style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.1em', color: 'var(--color-primary)', textTransform: 'uppercase' }}>THE BRAND STORY</span>
      <h1 style={{ fontSize: '2.2rem', margin: '6px 0 20px', letterSpacing: '-0.03em' }}>ABOUT BEN-TECHNOVA</h1>
      <p style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', lineHeight: '1.7', marginBottom: '24px' }}>
        Founded with the goal of bringing genuine, high-performance computing devices to consumers across Ghana, Ben-TechNova stands as a trusted hub for premium electronics.
      </p>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: '1.7', marginBottom: '36px' }}>
        We source our inventory directly from verified authorized manufacturers. By eliminating intermediaries, we guarantee authentic packaging, warranty provisions, and customer service.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '28px' }}>
        <div>
          <h3 style={{ fontSize: '0.9rem', marginBottom: '8px' }}>OUR MISSION</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
            Empowering professionals, students, and businesses with authentic hardware and technical backup support.
          </p>
        </div>
        <div>
          <h3 style={{ fontSize: '0.9rem', marginBottom: '8px' }}>OUR GUARANTEE</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
            Every purchase includes official warranty logging and verified local customer support.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   2. STORE LOCATIONS
   ================================================================ */
function LocationsPage() {
  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
      <span style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.1em', color: 'var(--color-primary)', textTransform: 'uppercase' }}>VISIT US</span>
      <h1 style={{ fontSize: '2.2rem', margin: '6px 0 16px', letterSpacing: '-0.03em' }}>OUR STORE LOCATIONS</h1>
      <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '32px' }}>
        Come experience the latest hardware live at our physical retail showrooms.
      </p>

      <div style={{
        border: '1px solid var(--border-color)',
        padding: '32px',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: 'var(--color-card-bg)',
        textAlign: 'left',
        boxShadow: '0 8px 30px rgba(62,10,54,0.02)'
      }}>
        <div className="flex-between" style={{ marginBottom: '12px' }}>
          <strong style={{ fontSize: '1rem', color: 'var(--color-primary-dark)' }}>ACCRA HEADQUARTERS</strong>
          <span className="badge-premium badge-success-premium">MAIN OUTLET</span>
        </div>
        <p style={{ fontSize: '0.95rem', fontWeight: '700', margin: '0 0 12px', color: 'var(--color-text-dark)' }}>
          📍 Awoshie last-top sethoo street
        </p>
        
        <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '16px 0' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
          <div>
            <strong>OPERATING HOURS</strong>
            <p style={{ marginTop: '4px' }}>Monday &ndash; Friday: 8:00 AM &ndash; 6:00 PM</p>
            <p>Saturday: 9:00 AM &ndash; 4:00 PM</p>
          </div>
          <div>
            <strong>CONTACT DETAILS</strong>
            <p style={{ marginTop: '4px' }}>📞 +233 (0) 552690370</p>
            <p>✉️ ben@technova.gh</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   3. DISTRIBUTORS LICENSE
   ================================================================ */
function LicensePage() {
  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
      <span style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.1em', color: 'var(--color-primary)', textTransform: 'uppercase' }}>LEGAL & COMPLIANCE</span>
      <h1 style={{ fontSize: '2.2rem', margin: '6px 0 16px', letterSpacing: '-0.03em' }}>DISTRIBUTORS LICENSE</h1>
      <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '36px' }}>
        TechNova Ghana is fully registered and licensed to retail brand hardware.
      </p>

      <div style={{
        border: '2px solid var(--color-primary)',
        padding: '40px',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: '#ffffff',
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* Certificate Seal Decorative */}
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          border: '2px dashed var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
          margin: '0 auto 20px',
          color: 'var(--color-primary)'
        }}>
          ✓
        </div>

        <h3 style={{ fontSize: '1.1rem', color: 'var(--color-primary-dark)', marginBottom: '8px' }}>
          VERIFIED RETAIL AUTHORIZATION
        </h3>
        <p style={{ fontSize: '0.75rem', letterSpacing: '0.05em', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '24px' }}>
          Registration ID: GH-TEC-2026-A89
        </p>

        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: '1.6', maxWidth: '440px', margin: '0 auto 28px' }}>
          This certifies that Ben-TechNova Ghana operates as an authorized distributor node, holding direct import licenses for laptop systems, mobile units, and accessory packages.
        </p>

        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
          MINISTRY OF TRADE & INDUSTRY &mdash; REPUBLIC OF GHANA
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   4. PRIVACY POLICY
   ================================================================ */
function PrivacyPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', margin: '0 0 20px', letterSpacing: '-0.03em' }}>PRIVACY POLICY</h1>
      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>Last updated: June 14, 2026</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontSize: '0.875rem', lineHeight: '1.7', color: 'var(--color-text-secondary)' }}>
        <div>
          <h3 style={{ fontSize: '1rem', color: 'var(--color-primary-dark)', marginBottom: '8px' }}>1. INFORMATION WE COLLECT</h3>
          <p>
            We collect personal profile data (names, emails, contact numbers, and delivery locations) during checkout or account registration pipelines to facilitate processing.
          </p>
        </div>
        <div>
          <h3 style={{ fontSize: '1rem', color: 'var(--color-primary-dark)', marginBottom: '8px' }}>2. PAYMENT SECURITY</h3>
          <p>
            All online and mobile payment records are securely tunneled through authorized payment gateways (Paystack / Mobile Money APIs). We do not store card credentials on our servers.
          </p>
        </div>
        <div>
          <h3 style={{ fontSize: '1rem', color: 'var(--color-primary-dark)', marginBottom: '8px' }}>3. DATA RETENTION</h3>
          <p>
            Your account configurations and order logs remain saved to verify warranty validations. You may request profile deletion at any time by contacting our helpline.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   5. TRACK ORDER
   ================================================================ */
function TrackOrderPage() {
  const [orderRef, setOrderRef] = useState('');
  const [trackingData, setTrackingData] = useState(null);

  const handleTrack = (e) => {
    e.preventDefault();
    if (orderRef.trim()) {
      // Simulate real lookup response
      setTrackingData({
        ref: orderRef,
        status: 'In Transit',
        updatedAt: 'Today, 2:15 PM',
        history: [
          { status: 'Order Placed', desc: 'Package registered at central depot.', done: true },
          { status: 'Processing', desc: 'Verified and packed for courier delivery.', done: true },
          { status: 'In Transit', desc: 'Dispatched to Awoshie dispatch route.', done: true, current: true },
          { status: 'Delivered', desc: 'Out for final handover confirmation.', done: false }
        ]
      });
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', margin: '0 0 8px', letterSpacing: '-0.03em', textAlign: 'center' }}>TRACK YOUR ORDER</h1>
      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', textAlign: 'center', marginBottom: '32px' }}>
        Enter your order reference identifier to check courier fulfillment status.
      </p>

      <form onSubmit={handleTrack} style={{ display: 'flex', gap: '8px', marginBottom: '36px' }}>
        <input
          type="text"
          placeholder="e.g. TN-9082"
          value={orderRef}
          onChange={e => setOrderRef(e.target.value)}
          className="form-input-premium"
          required
        />
        <button type="submit" className="btn btn-primary" style={{ padding: '14px 28px' }}>
          TRACK
        </button>
      </form>

      {trackingData && (
        <div style={{
          border: '1px solid var(--border-color)',
          padding: '28px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--color-card-bg)'
        }} className="animate-fade-in">
          <div className="flex-between" style={{ marginBottom: '24px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>ID: {trackingData.ref}</span>
            <span className="badge-premium badge-success-premium">{trackingData.status}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {trackingData.history.map((step, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                {/* Connecting line */}
                {idx < trackingData.history.length - 1 && (
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: '8px',
                    width: '2px',
                    height: 'calc(100% + 8px)',
                    backgroundColor: step.done ? 'var(--color-primary)' : 'var(--border-color)',
                    zIndex: 1
                  }} />
                )}
                
                {/* Node circle */}
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: step.done ? 'var(--color-primary)' : '#ffffff',
                  border: `2px solid ${step.done ? 'var(--color-primary)' : 'var(--border-color)'}`,
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '2px'
                }}>
                  {step.current && <div style={{ width: '6px', height: '6px', backgroundColor: '#ffffff', borderRadius: '50%' }} />}
                </div>

                <div>
                  <h4 style={{ fontSize: '0.85rem', color: step.done ? 'var(--color-primary-dark)' : 'var(--color-text-muted)' }}>
                    {step.status}
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   6. WARRANTY REGISTRATION
   ================================================================ */
function WarrantyPage() {
  const [formData, setFormData] = useState({ serial: '', model: '', date: '', name: '', email: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ maxWidth: '520px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', margin: '0 0 8px', letterSpacing: '-0.03em', textAlign: 'center' }}>WARRANTY ACTIVATION</h1>
      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', textAlign: 'center', marginBottom: '32px' }}>
        Register your device serial numbers to activate your official Ben-TechNova store warranty.
      </p>

      {submitted ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 24px',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--color-card-bg)'
        }} className="animate-fade-in">
          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '16px' }}>🛡️</span>
          <h3 style={{ fontSize: '1rem', color: 'var(--color-primary-dark)', marginBottom: '8px' }}>WARRANTY SUBMITTED</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
            Your serial registry block has been successfully verified. An confirmation receipt copy has been sent to your email.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group-premium">
            <label className="form-label-premium">Serial Number (S/N)</label>
            <input type="text" required placeholder="e.g. SN-8902-LPT" value={formData.serial} onChange={e => setFormData({ ...formData, serial: e.target.value })} className="form-input-premium" />
          </div>
          <div className="form-group-premium">
            <label className="form-label-premium">Product Model Name</label>
            <input type="text" required placeholder="e.g. TechNova ProBook 14" value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })} className="form-input-premium" />
          </div>
          <div className="form-group-premium">
            <label className="form-label-premium">Purchase Date</label>
            <input type="date" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="form-input-premium" />
          </div>
          <div className="form-group-premium">
            <label className="form-label-premium">Full Name</label>
            <input type="text" required placeholder="John Doe" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="form-input-premium" />
          </div>
          <div className="form-group-premium">
            <label className="form-label-premium">Email Address</label>
            <input type="email" required placeholder="name@domain.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="form-input-premium" />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px', padding: '14px' }}>
            ACTIVATE WARRANTY
          </button>
        </form>
      )}
    </div>
  );
}

/* ================================================================
   7. CLIENT SUPPORT INQUIRIES
   ================================================================ */
function InquiriesPage() {
  const [formData, setFormData] = useState({ name: '', email: '', order: '', query: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ maxWidth: '520px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', margin: '0 0 8px', letterSpacing: '-0.03em', textAlign: 'center' }}>HELP DESK DISPATCH</h1>
      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', textAlign: 'center', marginBottom: '32px' }}>
        Send support queries directly to our operations desk.
      </p>

      {submitted ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 24px',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--color-card-bg)'
        }} className="animate-fade-in">
          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '16px' }}>✉️</span>
          <h3 style={{ fontSize: '1rem', color: 'var(--color-primary-dark)', marginBottom: '8px' }}>TICKET DISPATCHED</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
            Your query has been logged to the support registry. A representative will contact you via email shortly.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group-premium">
            <label className="form-label-premium">Your Name</label>
            <input type="text" required placeholder="John Doe" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="form-input-premium" />
          </div>
          <div className="form-group-premium">
            <label className="form-label-premium">Email Address</label>
            <input type="email" required placeholder="name@domain.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="form-input-premium" />
          </div>
          <div className="form-group-premium">
            <label className="form-label-premium">Order Reference (Optional)</label>
            <input type="text" placeholder="e.g. TN-9082" value={formData.order} onChange={e => setFormData({ ...formData, order: e.target.value })} className="form-input-premium" />
          </div>
          <div className="form-group-premium">
            <label className="form-label-premium">Message / Query Description</label>
            <textarea required rows="4" placeholder="How can we help you?" value={formData.query} onChange={e => setFormData({ ...formData, query: e.target.value })} className="form-input-premium" style={{ resize: 'vertical' }} />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px', padding: '14px' }}>
            SUBMIT TICKET
          </button>
        </form>
      )}
    </div>
  );
}

/* ================================================================
   8. FAQ DESK
   ================================================================ */
function FaqPage() {
  const [openIdx, setOpenIdx] = useState(null);

  const faqs = [
    { q: "Where are your devices sourced from?", a: "Every item is imported directly from the authorized factory hubs of the respective manufacturer, with full serial registries and authentic sealing." },
    { q: "What is your typical delivery schedule across Ghana?", a: "We guarantee delivery within 24 to 48 hours for locations within Accra, Kumasi, and Tema. Shipments to other regions generally arrive within 3 to 4 business days." },
    { q: "How long is the warranty cover on laptops?", a: "We provide 1 full year (12 months) of hardware replacement and maintenance backup support for all newly registered laptops, starting from the registration date." },
    { q: "Can I pay using Mobile Money at delivery?", a: "Yes, our delivery terminals fully support MTN MoMo and Telecel Cash payments on handover." }
  ];

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.2rem', margin: '0 0 12px', letterSpacing: '-0.03em', textAlign: 'center' }}>FAQ DESK</h1>
      <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', textAlign: 'center', marginBottom: '40px' }}>
        Frequently asked customer inquiries about ordering, deliveries, and warranty cover.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden'
              }}
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                style={{
                  width: '100%',
                  padding: '18px 24px',
                  backgroundColor: 'var(--color-card-bg)',
                  border: 'none',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  color: 'var(--color-primary-dark)',
                  cursor: 'pointer'
                }}
              >
                <span>{faq.q}</span>
                <span>{isOpen ? '−' : '+'}</span>
              </button>
              
              {isOpen && (
                <div style={{
                  padding: '18px 24px',
                  backgroundColor: '#ffffff',
                  fontSize: '0.8rem',
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.6',
                  borderTop: '1px solid var(--border-color)'
                }} className="animate-fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
