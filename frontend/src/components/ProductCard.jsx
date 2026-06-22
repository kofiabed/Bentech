export default function ProductCard({ product, onAdd, onClick }) {
  const hasDiscount = product.oldPrice && product.oldPrice > product.price;
  const discountPct = hasDiscount ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
  const availability = product.stock > 0 ? 'In Stock' : 'Out of Stock';

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    if (availability === 'In Stock') {
      onAdd(product);
    }
  };

  return (
<div className="product-card" onClick={onClick}>
      <div className="product-card-img-wrap">
        {product.img && (product.img.startsWith('/') || product.img.startsWith('http') || product.img.startsWith('https') || product.img.startsWith('data:image')) ? (
          <img src={product.img} alt={product.name} className="product-card-img" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '12px' }} onError={(e) => { e.target.style.display = 'none'; }} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', backgroundColor: '#f3f4f6' }}>
            <span style={{ fontSize: '2.5rem' }}>{product.img || '📦'}</span>
          </div>
        )}

        {/* Tags */}
        {product.tag && product.tag !== 'None' && product.tag !== 'Flash Sale' && (
          <span className="product-card-tag">{product.tag}</span>
        )}
        {product.tag === 'Flash Sale' && (
          <span className="product-card-tag" style={{ backgroundColor: 'var(--color-primary)', color: '#ffffff' }}>SALE</span>
        )}
        {hasDiscount && (
          <span className="product-card-discount">-{discountPct}%</span>
        )}

        {/* Quick Add Overlay on Hover */}
        <div className="quick-add-overlay" style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 100%)',
          padding: '12px',
          display: 'flex',
          justifyContent: 'center',
          opacity: 0,
          transition: 'opacity 0.2s ease'
        }}>
          <button
            onClick={handleQuickAdd}
            disabled={availability === 'Out of Stock'}
            className="btn btn-primary btn-sm"
            style={{ width: '100%', padding: '10px', fontSize: '0.65rem' }}
          >
            {availability === 'Out of Stock' ? 'OUT OF STOCK' : 'QUICK ADD'}
          </button>
        </div>
      </div>

      <div className="product-card-details">
        <span className="product-card-brand">{product.brand || 'TechNova'}</span>
        <h3 className="product-card-title">{product.name}</h3>
        <div className="product-card-price-row">
          <span className="product-card-price">GHS {Number(product.price || 0).toLocaleString()}</span>
          {product.oldPrice && (
            <span className="product-card-old-price">GHS {Number(product.oldPrice).toLocaleString()}</span>
          )}
        </div>
      </div>

      {/* Hover styling rule inject */}
      <style>{`
        .product-card:hover .quick-add-overlay {
          opacity: 1 !important;
        }
        @media (max-width: 768px) {
          .quick-add-overlay {
            opacity: 1 !important;
            background: none !important;
            position: relative !important;
            padding: 8px 0 0 !important;
          }
          .quick-add-overlay button {
            background-color: var(--color-primary-light) !important;
            color: #ffffff !important;
            border-radius: var(--radius-sm) !important;
          }
        }
      `}</style>
    </div>
  );
}
