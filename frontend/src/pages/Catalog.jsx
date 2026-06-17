import { useCallback, useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import Modal from '../components/Modal';

const normalizeCategory = category => category === 'Smart Wearables' ? 'Wearables' : category;

const CATEGORY_ICONS = {
  All: "bi-grid-fill",
  Laptops: "bi-laptop",
  Smartphones: "bi-phone",
  "Audio & Sound": "bi-headphones",
  Wearables: "bi-watch",
  Gaming: "bi-controller",
  Accessories: "bi-plugin"
};

export default function Catalog({ onItemAdd, initialCategory, initialSearch, wishlist = [], onToggleWishlist }) {
  const [searchTerm, setSearchTerm] = useState(initialSearch || '');
  const [selectedCategory, setSelectedCategory] = useState(normalizeCategory(initialCategory) || 'All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedTag, setSelectedTag] = useState('All');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(25000);
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('Popularity');
  const [products, setProducts] = useState([]);
  const [activeProductDetails, setActiveProductDetails] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      if (data.success) setProducts(data.products);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (initialSearch !== undefined) {
      setSearchTerm(initialSearch || '');
    }
  }, [initialSearch]);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(normalizeCategory(initialCategory) || 'All');
    }
  }, [initialCategory]);

  const maxCatalogPrice = products.length > 0 ? Math.max(...products.map(p => Number(p.price || 0))) : 25000;

  useEffect(() => {
    if (products.length > 0) {
      setMaxPrice(maxCatalogPrice);
    }
  }, [products, maxCatalogPrice]);

  const filteredProducts = products.filter(product => {
    const query = searchTerm.toLowerCase().trim();
    let matchesSearch = true;

    if (query) {
      const textToSearch = [
        product.name,
        product.brand,
        product.category,
        product.description,
        product.tag,
        product.specs ? Object.keys(product.specs).join(' ') : '',
        product.specs ? Object.values(product.specs).join(' ') : ''
      ].join(' ').toLowerCase();

      let searchTerms = [query];
      if (query === 'ps5' || query === 'ps 5') {
        searchTerms.push('playstation');
      } else if (query.includes('playstation')) {
        searchTerms.push('ps5');
      } else if (query === 'mac' || query === 'macbook') {
        searchTerms.push('apple');
      } else if (query === 's24') {
        searchTerms.push('samsung');
      }

      const words = query.split(/\s+/).filter(Boolean);
      matchesSearch = searchTerms.some(term => textToSearch.includes(term)) || 
                      words.every(word => textToSearch.includes(word));
    }

    const matchesCategory = selectedCategory === 'All' || normalizeCategory(product.category) === selectedCategory;
    const matchesBrand = selectedBrand === 'All' || product.brand === selectedBrand;
    const matchesPrice = Number(product.price || 0) >= minPrice && Number(product.price || 0) <= maxPrice;
    const matchesStock = !showInStockOnly || product.stock > 0;
    const matchesTag = selectedTag === 'All' || product.tag === selectedTag;
    
    return matchesSearch && matchesCategory && matchesBrand && matchesPrice && matchesStock && matchesTag;
  }).sort((a, b) => {
    if (sortBy === 'Price') return a.price - b.price;
    if (sortBy === 'Rating') return b.rating - a.rating;
    return (b._id || b.id || 0) - (a._id || a.id || 0);
  });

  const categories = ['All', 'Laptops', 'Smartphones', 'Audio & Sound', 'Wearables', 'Gaming', 'Accessories'];
  const brands = ['All', ...new Set(products.map(p => p.brand).filter(Boolean))];
  const tags = ['All', 'Flash Sale', 'Best Seller', 'New Arrival', 'Featured'];

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedBrand('All');
    setSelectedTag('All');
    setMinPrice(0);
    setMaxPrice(maxCatalogPrice);
    setShowInStockOnly(false);
  };

  const FilterPanel = () => (
    <aside style={{
      backgroundColor: '#ffffff',
      border: '1px solid var(--border-color)',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(62,10,54,0.01)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: '800', letterSpacing: '0.05em', margin: 0 }}>
          REFINE BY
        </h3>
        <button 
          onClick={resetFilters} 
          style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.7rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
        >
          <i className="bi bi-trash"></i> Reset
        </button>
      </div>

      {/* Category Filter list */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-secondary)', letterSpacing: '0.08em', display: 'block', marginBottom: '10px' }}>
          Categories
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {categories.map(cat => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '10px 12px',
                  background: isActive ? 'var(--color-secondary-light)' : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-dark)',
                  fontWeight: isActive ? '700' : '500',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
                onMouseOver={e => { if(!isActive) e.currentTarget.style.backgroundColor = 'var(--color-card-bg)'; }}
                onMouseOut={e => { if(!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <i className={`bi ${CATEGORY_ICONS[cat] || 'bi-tag'}`} style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)' }}></i>
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Availability Filter toggle */}
      <div style={{ marginBottom: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
        <label 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            cursor: 'pointer', 
            fontSize: '0.82rem', 
            fontWeight: '700',
            color: 'var(--color-text-dark)' 
          }}
        >
          <span>Show In Stock Only</span>
          <input 
            type="checkbox" 
            checked={showInStockOnly}
            onChange={(e) => setShowInStockOnly(e.target.checked)}
            style={{ accentColor: 'var(--color-primary)', width: '16px', height: '16px', cursor: 'pointer' }}
          />
        </label>
      </div>

      {/* Price Range */}
      <div style={{ marginBottom: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
        <label style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-secondary)', letterSpacing: '0.08em', display: 'block', marginBottom: '10px' }}>
          Price Range (GHS)
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
          <div>
            <small style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '2px' }}>Min</small>
            <input 
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(Math.max(0, Number(e.target.value)))}
              className="form-input-premium"
              style={{ padding: '8px 10px', fontSize: '0.8rem', borderRadius: '6px' }}
            />
          </div>
          <div>
            <small style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '2px' }}>Max</small>
            <input 
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Math.max(0, Number(e.target.value)))}
              className="form-input-premium"
              style={{ padding: '8px 10px', fontSize: '0.8rem', borderRadius: '6px' }}
            />
          </div>
        </div>
        <input
          type="range"
          min="0"
          max={maxCatalogPrice}
          step="100"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
        />
      </div>

      {/* Brands Filters */}
      <div style={{ marginBottom: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
        <label style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-secondary)', letterSpacing: '0.08em', display: 'block', marginBottom: '10px' }}>
          Filter by Brand
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {brands.map(brand => {
            const isActive = selectedBrand === brand;
            return (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '20px',
                  border: `1px solid ${isActive ? 'var(--color-primary)' : 'var(--border-color)'}`,
                  backgroundColor: isActive ? 'var(--color-primary)' : '#ffffff',
                  color: isActive ? '#ffffff' : 'var(--color-text-dark)',
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {brand}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tags Filters */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
        <label style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-secondary)', letterSpacing: '0.08em', display: 'block', marginBottom: '10px' }}>
          Deals & Tags
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {tags.map(tag => {
            const isActive = selectedTag === tag;
            return (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '20px',
                  border: `1px solid ${isActive ? 'var(--color-primary)' : 'var(--border-color)'}`,
                  backgroundColor: isActive ? 'var(--color-secondary-light)' : '#ffffff',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-dark)',
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {tag === 'All' ? 'Show All' : tag}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', padding: 'clamp(16px, 4vw, 40px) 0' }}>
      <div className="container-premium">
        
        {/* Top Header Bar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '20px',
          marginBottom: '24px'
        }}>
          <div style={{ flex: '1 1 200px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.12em', color: 'var(--color-primary)', textTransform: 'uppercase' }}>DEPARTMENTS</span>
            <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', margin: '4px 0 0', textTransform: 'none', letterSpacing: '-0.03em', color: 'var(--color-primary-dark)' }}>STORE CATALOG</h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Showing {filteredProducts.length} of {products.length} products
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', flex: '1 1 auto', justifyContent: 'flex-end' }}>
            <div style={{ position: 'relative', flex: '1 1 200px', minWidth: '160px' }}>
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input-premium"
                style={{ width: '100%', padding: '10px 16px 10px 40px', borderRadius: '8px' }}
              />
              <i className="bi bi-search" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}></i>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '0 1 auto' }}>
              <label htmlFor="sort-select" style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>Sort</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="form-input-premium form-select-premium"
                style={{ width: 'auto', minWidth: '140px', borderRadius: '8px', padding: '10px 16px' }}
              >
                <option value="Popularity">Popularity</option>
                <option value="Price">Price: Low to High</option>
                <option value="Rating">Customer Rating</option>
              </select>
            </div>

            {/* Mobile filter toggle button */}
            <button 
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="btn btn-outline mobile-filter-toggle"
              style={{ padding: '10px 16px', borderRadius: '8px', display: 'none' }}
            >
              <i className="bi bi-funnel"></i> Filters
            </button>

            <button onClick={fetchProducts} className="btn btn-outline" style={{ padding: '10px 16px', borderRadius: '8px', flexShrink: 0 }}>
              <i className="bi bi-arrow-clockwise"></i>
            </button>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="catalog-layout-grid" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '32px', alignItems: 'start' }}>
          
          {/* Desktop Sidebar Filter Panel */}
          <div className="desktop-filters">
            <FilterPanel />
          </div>

          {/* Catalog Grid Area */}
          <section style={{ width: '100%' }}>
            {filteredProducts.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: 'clamp(40px, 6vw, 80px) clamp(16px, 3vw, 32px)',
                border: '1px dashed var(--border-color)',
                borderRadius: '12px',
                backgroundColor: 'var(--color-card-bg)'
              }}>
                <span style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', display: 'block', marginBottom: '12px' }}>🔍</span>
                <h4 style={{ color: 'var(--color-text-dark)', fontSize: '1rem', fontWeight: '800', marginBottom: '6px', textTransform: 'none' }}>
                  No Products Match Your Filters
                </h4>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: '20px', maxWidth: '320px', margin: '0 auto 20px' }}>
                  Try resetting the refinement fields to browse other tech items in our inventory.
                </p>
                <button
                  onClick={resetFilters}
                  className="btn btn-primary btn-sm"
                >
                  RESET FILTERS
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: 'clamp(16px, 3vw, 40px) clamp(12px, 2vw, 24px)'
              }}>
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product._id || product.id}
                    product={product}
                    onAdd={onItemAdd}
                    onClick={() => setActiveProductDetails({
                      ...product,
                      brand: product.brand || 'TechNova',
                      images: [product.img || null],
                      description: product.description || product.name,
                      availability: product.stock > 0 ? 'In Stock' : 'Out of Stock',
                      rating: product.rating || 4
                    })}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Mobile Filter Drawer */}
        {mobileFiltersOpen && (
          <>
            <div 
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.4)',
                zIndex: 998
              }}
              onClick={() => setMobileFiltersOpen(false)}
            />
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: 'min(340px, 85vw)',
              height: '100vh',
              backgroundColor: '#ffffff',
              zIndex: 999,
              padding: '20px',
              overflowY: 'auto',
              animation: 'slideInLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1) both',
              boxShadow: '4px 0 40px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '0.9rem', margin: 0 }}>FILTERS</h3>
                <button 
                  onClick={() => setMobileFiltersOpen(false)}
                  style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                >
                  &times;
                </button>
              </div>
              <FilterPanel />
              <button 
                onClick={() => setMobileFiltersOpen(false)}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '20px', padding: '14px' }}
              >
                APPLY FILTERS
              </button>
            </div>
          </>
        )}

      </div>

      {/* Reusable Premium Detail Modal Overlay */}
      {activeProductDetails && (
        <Modal onClose={() => setActiveProductDetails(null)}>
          <div style={{ padding: 'clamp(16px, 4vw, 40px)', display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 'clamp(16px, 4vw, 40px)', alignItems: 'start' }} className="modal-columns-responsive">
            
            {/* Left Image column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                width: '100%',
                aspectRatio: '0.92',
                backgroundColor: 'var(--color-card-bg)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--border-color)',
                overflow: 'hidden',
                padding: '16px'
              }}>
                {activeProductDetails.img && activeProductDetails.img.startsWith('/') ? (
                  <img src={activeProductDetails.img} alt={activeProductDetails.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : activeProductDetails.img && activeProductDetails.img.startsWith('data:image') ? (
                  <img src={activeProductDetails.img} alt={activeProductDetails.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <span style={{ fontSize: 'clamp(3rem, 8vw, 5rem)' }}>{activeProductDetails.img || '📦'}</span>
                )}
              </div>
            </div>

            {/* Right Information column */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.12em', color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                {activeProductDetails.category} / {activeProductDetails.brand}
              </span>
              <h2 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', margin: '4px 0 12px', letterSpacing: '-0.02em', color: 'var(--color-primary-dark)', textTransform: 'none', fontWeight: '800' }}>
                {activeProductDetails.name}
              </h2>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', fontWeight: '800', color: 'var(--color-primary)' }}>
                  GHS {Number(activeProductDetails.price || 0).toLocaleString()}
                </span>
                {activeProductDetails.oldPrice && (
                  <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)', textDecoration: 'line-through' }}>
                    GHS {Number(activeProductDetails.oldPrice).toLocaleString()}
                  </span>
                )}
                <span className={`badge-premium ${activeProductDetails.stock > 0 ? 'badge-success-premium' : 'badge-error-premium'}`}>
                  {activeProductDetails.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>

              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'clamp(0.82rem, 2vw, 0.85rem)', lineHeight: '1.6', marginBottom: '20px' }}>
                {activeProductDetails.description}
              </p>

              {/* Technical Specifications */}
              {activeProductDetails.specs && Object.keys(activeProductDetails.specs).length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '0.78rem', fontWeight: '800', letterSpacing: '0.05em', color: 'var(--color-text-dark)', marginBottom: '8px', textTransform: 'none' }}>
                    Specifications Sheet
                  </h4>
                  <table style={{ width: '100%', fontSize: '0.78rem', borderCollapse: 'collapse' }}>
                    <tbody>
                      {Object.entries(activeProductDetails.specs).map(([key, val]) => (
                        <tr key={key} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '6px 0', color: 'var(--color-text-secondary)', fontWeight: '600', width: '30%' }}>{key}</td>
                          <td style={{ padding: '6px 0', color: 'var(--color-text-dark)' }}>{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => { onItemAdd(activeProductDetails); setActiveProductDetails(null); }}
                  disabled={activeProductDetails.stock <= 0}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '14px' }}
                >
                  <i className="bi bi-cart-plus"></i> ADD TO BASKET
                </button>
                <button 
                  onClick={() => onToggleWishlist(activeProductDetails)}
                  className="btn btn-outline" 
                  style={{ 
                    padding: '14px', 
                    width: '52px', 
                    minWidth: 'auto', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    borderColor: wishlist.some(item => item._id === activeProductDetails._id || item.id === activeProductDetails.id) ? 'var(--color-error)' : 'var(--color-primary)',
                    color: wishlist.some(item => item._id === activeProductDetails._id || item.id === activeProductDetails.id) ? 'var(--color-error)' : 'var(--color-primary)',
                    backgroundColor: wishlist.some(item => item._id === activeProductDetails._id || item.id === activeProductDetails.id) ? 'rgba(198, 40, 40, 0.05)' : 'transparent',
                    transition: 'all 0.2s ease'
                  }}
                  aria-label="Toggle Wishlist"
                >
                  <i className={wishlist.some(item => item._id === activeProductDetails._id || item.id === activeProductDetails.id) ? "bi bi-heart-fill" : "bi bi-heart"} style={{ fontSize: '1.1rem' }} />
                </button>
              </div>
            </div>

          </div>
        </Modal>
      )}

      {/* Responsive Layout styling */}
      <style>{`
        @media (max-width: 991px) {
          .catalog-layout-grid {
            grid-template-columns: 1fr !important;
          }
          .modal-columns-responsive {
            grid-template-columns: 1fr !important;
            padding: 16px !important;
          }
          .desktop-filters {
            display: none !important;
          }
          .mobile-filter-toggle {
            display: inline-flex !important;
          }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}