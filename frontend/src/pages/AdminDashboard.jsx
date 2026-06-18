import { useCallback, useEffect, useState } from 'react';

const API = '/api';

const emptyProductForm = {
  name: '',
  price: '',
  stock: '',
  oldPrice: '',
  category: 'Laptops',
  brand: 'TechNova',
  tag: 'Featured',
  img: '📦',
  description: '',
  specs: '{}'
};

const emptyUserForm = {
  name: '',
  email: '',
  password: '',
  role: 'staff',
  phone: ''
};

const productCategories = ['Laptops', 'Smartphones', 'Audio & Sound', 'Wearables', 'Smart Wearables', 'Gaming Gears', 'Accessories'];
const productTags = ['Featured', 'Flash Sale', 'Best Seller', 'New Arrival', 'None'];
const userRoles = ['staff', 'customer'];
const orderStatuses = ['Processing', 'In Transit', 'Approved', 'Delivered', 'Refunded'];

function compressImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      resolve('📦');
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Unable to read image file.'));
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const maxSize = 1100;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0, width, height);
        canvas.toBlob(blob => {
          if (!blob) {
            resolve(file.type === 'image/svg+xml' ? reader.result : '📦');
            return;
          }
          const compressedReader = new FileReader();
          compressedReader.onerror = () => reject(new Error('Unable to compress image file.'));
          compressedReader.onloadend = () => resolve(compressedReader.result);
          compressedReader.readAsDataURL(blob);
        }, file.type, 0.75);
      };
      image.onerror = () => resolve(file.type === 'image/svg+xml' ? reader.result : '📦');
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [flashProductId, setFlashProductId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [showProductDrawer, setShowProductDrawer] = useState(false);
  const [showUserDrawer, setShowUserDrawer] = useState(false);

  const fetchJson = useCallback(async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        ...(options.headers || {})
      }
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Request failed.');
    }
    return data;
  }, []);

  const fetchProducts = useCallback(async () => {
    const data = await fetchJson(`${API}/products`);
    setProducts(data.products || []);
  }, [fetchJson]);

  const fetchOrders = useCallback(async () => {
    const data = await fetchJson(`${API}/orders`);
    setOrders(data.orders || []);
  }, [fetchJson]);

  const fetchUsers = useCallback(async () => {
    const data = await fetchJson(`${API}/users`);
    setUsers(data.users || []);
  }, [fetchJson]);

  const fetchReviews = useCallback(async () => {
    const data = await fetchJson(`${API}/reviews`);
    setReviews(data.reviews || []);
  }, [fetchJson]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([fetchProducts(), fetchOrders(), fetchUsers(), fetchReviews()]);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }, [fetchProducts, fetchOrders, fetchReviews, fetchUsers]);

  useEffect(() => {
    const timeout = setTimeout(() => fetchAll(), 0);
    return () => clearTimeout(timeout);
  }, [fetchAll]);

  const staff = users.filter(user => user.role === 'staff');
  const customers = users.filter(user => user.role === 'customer');
  const flashProducts = products.filter(product => product.tag === 'Flash Sale');
  const lowStockProducts = products.filter(product => product.stock <= 5);
  const totalRevenue = orders
    .filter(order => order.paymentStatus === 'paid' || order.paymentMethod === 'cod')
    .reduce((sum, order) => sum + Number(order.financials?.grandTotal || 0), 0);
  const pendingRevenue = orders
    .filter(order => (order.paymentMethod === 'card' || order.paymentMethod === 'momo') && order.paymentStatus === 'pending')
    .reduce((sum, order) => sum + Number(order.financials?.grandTotal || 0), 0);
  const totalItemsSold = orders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + Number(item.qty || 0), 0), 0);

  const resetProductForm = () => {
    setProductForm(emptyProductForm);
    setEditingProduct(null);
    setShowProductDrawer(false);
  };

  const resetUserForm = () => {
    setUserForm(emptyUserForm);
    setEditingUser(null);
    setShowUserDrawer(false);
  };

  const handleProductChange = (event) => {
    const { name, value } = event.target;
    setProductForm(prev => ({ ...prev, [name]: value }));
  };

  const handleUserChange = (event) => {
    const { name, value } = event.target;
    setUserForm(prev => ({ ...prev, [name]: value }));
  };

  const handleProductImage = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const compressedImage = await compressImageFile(file);
      setProductForm(prev => ({ ...prev, img: compressedImage }));
    } catch {
      setMessage('Image upload failed. Use an emoji placeholder instead.');
    }
  };

  const parseProductSpecs = () => {
    if (!productForm.specs.trim()) return {};
    const parsed = JSON.parse(productForm.specs);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Product specs must be a valid JSON object.');
    }
    return parsed;
  };

  const submitProduct = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const specs = parseProductSpecs();
      const payload = {
        ...productForm,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        oldPrice: productForm.oldPrice ? Number(productForm.oldPrice) : null,
        tag: productForm.tag === 'None' ? null : productForm.tag,
        specs
      };
      const url = editingProduct ? `${API}/products/${editingProduct}` : `${API}/products`;
      const method = editingProduct ? 'PUT' : 'POST';
      await fetchJson(url, { method, body: JSON.stringify(payload) });
      resetProductForm();
      await fetchAll();
      setMessage(editingProduct ? 'Product updated successfully.' : 'Product added successfully.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product from the catalog?')) return;
    setLoading(true);
    try {
      await fetchJson(`${API}/products/${id}`, { method: 'DELETE' });
      await fetchAll();
      setMessage('Product deleted successfully.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateFlashSale = async () => {
    if (!flashProductId) return;
    setLoading(true);
    try {
      await fetchJson(`${API}/products/${flashProductId}`, {
        method: 'PUT',
        body: JSON.stringify({ tag: 'Flash Sale' })
      });
      await fetchAll();
      setMessage('Flash sale product updated.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const clearFlashSale = async (id) => {
    setLoading(true);
    try {
      await fetchJson(`${API}/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ tag: null })
      });
      await fetchAll();
      setMessage('Flash sale label removed.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const submitUser = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      if (!editingUser && !userForm.password) {
        throw new Error('Password is required when creating a user.');
      }
      const payload = {
        name: userForm.name,
        email: userForm.email.toLowerCase(),
        role: userForm.role,
        phone: userForm.phone
      };
      if (userForm.password) payload.password = userForm.password;
      const url = editingUser ? `${API}/users/${editingUser}` : `${API}/users`;
      const method = editingUser ? 'PUT' : 'POST';
      await fetchJson(url, { method, body: JSON.stringify(payload) });
      resetUserForm();
      await fetchAll();
      setMessage(editingUser ? 'User updated successfully.' : 'User created successfully.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user account?')) return;
    setLoading(true);
    try {
      await fetchJson(`${API}/users/${id}`, { method: 'DELETE' });
      await fetchAll();
      setMessage('User deleted successfully.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateReviewStatus = async (id, status) => {
    setLoading(true);
    try {
      await fetchJson(`${API}/reviews/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      await fetchAll();
      setMessage(`Review marked as ${status}.`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    setLoading(true);
    try {
      await fetchJson(`${API}/reviews/${id}`, { method: 'DELETE' });
      await fetchAll();
      setMessage('Review deleted successfully.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id, status) => {
    setLoading(true);
    try {
      await fetchJson(`${API}/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, trackingUpdate: `Status updated to ${status}.` })
      });
      await fetchAll();
      setMessage('Order status updated.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--color-card-bg)', minHeight: '100vh', padding: 'clamp(24px, 4vw, 48px) 0 clamp(48px, 8vw, 96px)' }} className="animate-fade-in">
      <div className="container-premium">
        
        {/* Modern Title Console */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: 'clamp(20px, 3vw, 32px)',
          boxShadow: '0 4px 20px rgba(62, 10, 54, 0.02)',
          border: '1px solid var(--border-color)',
          marginBottom: '24px'
        }}>
          <div style={{ minWidth: 0, flex: '1 1 auto' }}>
            <span style={{ fontSize: '0.6rem', fontWeight: '900', letterSpacing: '0.12em', color: 'var(--color-primary)', textTransform: 'uppercase' }}>
              ADMIN OPERATION MATRIX
            </span>
            <h2 style={{ fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', margin: '4px 0 0', letterSpacing: '-0.02em', textTransform: 'none', fontWeight: '900', color: 'var(--color-primary-dark)' }}>
              Operational Dashboard
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Configure product catalogs, deploy flash sales, moderate customer reviews, and coordinate delivery logistics.
            </p>
          </div>
          <button 
            onClick={fetchAll} 
            disabled={loading} 
            className="btn btn-primary" 
            style={{ padding: '12px 24px', borderRadius: '8px', flexShrink: 0 }}
          >
            {loading ? 'SYNCING DATA...' : 'REFRESH PANEL'}
          </button>
        </div>

        {/* Dynamic Alerts Banner */}
        {message && (
          <div style={{
            backgroundColor: 'rgba(62, 10, 54, 0.03)',
            color: 'var(--color-primary-dark)',
            borderLeft: '4px solid var(--color-primary)',
            padding: '14px 20px',
            borderRadius: '8px',
            fontWeight: '700',
            fontSize: '0.78rem',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ flex: 1 }}>{message}</span>
            <button 
              onClick={() => setMessage('')} 
              style={{ background: 'none', border: 'none', fontWeight: '900', cursor: 'pointer', color: 'var(--color-primary-dark)', flexShrink: 0 }}
            >
              &times;
            </button>
          </div>
        )}

        {/* Dashboard Grid Container */}
        <div className="admin-layout-grid" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 'clamp(16px, 3vw, 32px)', alignItems: 'start' }}>
          
          {/* Side Navigation Sidebar */}
          <aside style={{
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 4px 20px rgba(62, 10, 54, 0.02)'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 14px',
                    backgroundColor: activeTab === tab.id ? 'var(--color-primary)' : 'transparent',
                    color: activeTab === tab.id ? '#ffffff' : 'var(--color-text-primary)',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>{tab.icon}</span>
                  <span className="admin-nav-label">{tab.label}</span>
                </button>
              ))}
            </div>
          </aside>

          {/* Core Panel Content */}
          <section style={{
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: 'clamp(16px, 3vw, 32px)',
            minHeight: '500px',
            boxShadow: '0 4px 20px rgba(62, 10, 54, 0.02)',
            position: 'relative'
          }}>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'products' && renderProducts()}
            {activeTab === 'flash' && renderFlashSale()}
            {activeTab === 'orders' && renderOrders()}
            {activeTab === 'staff' && renderUsers('staff')}
            {activeTab === 'customers' && renderUsers('customer')}
            {activeTab === 'reviews' && renderReviews()}
          </section>
        </div>

      </div>

      {/* FORM OVERLAY DRAWER - PRODUCTS */}
      {showProductDrawer && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(62, 10, 54, 0.4)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'flex-end',
          animation: 'fadeInOverlay 0.2s ease'
        }} onClick={resetProductForm}>
          <form 
            onSubmit={submitProduct} 
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '460px',
              backgroundColor: '#ffffff',
              height: '100%',
              boxShadow: '-10px 0 40px rgba(0,0,0,0.1)',
              padding: 'clamp(24px, 4vw, 40px) clamp(16px, 3vw, 32px)',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              animation: 'slideInDrawer 0.3s cubic-bezier(0.16, 1, 0.3, 1) both'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
              <h3 style={{ fontSize: '1rem', margin: 0 }}>
                {editingProduct ? 'Edit Product File' : 'Register New Product'}
              </h3>
              <button 
                type="button" 
                onClick={resetProductForm}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--color-text-muted)' }}
              >
                &times;
              </button>
            </div>

            <div className="form-group-premium">
              <label className="form-label-premium">Product Name</label>
              <input name="name" value={productForm.name} onChange={handleProductChange} required className="form-input-premium" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group-premium">
                <label className="form-label-premium">Price (GHS)</label>
                <input name="price" type="number" min="0" value={productForm.price} onChange={handleProductChange} required className="form-input-premium" />
              </div>
              <div className="form-group-premium">
                <label className="form-label-premium">Stock Level</label>
                <input name="stock" type="number" min="0" value={productForm.stock} onChange={handleProductChange} required className="form-input-premium" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group-premium">
                <label className="form-label-premium">Compare Price (Old)</label>
                <input name="oldPrice" type="number" min="0" value={productForm.oldPrice} onChange={handleProductChange} className="form-input-premium" />
              </div>
              <div className="form-group-premium">
                <label className="form-label-premium">Category</label>
                <select name="category" value={productForm.category} onChange={handleProductChange} className="form-input-premium form-select-premium">
                  {productCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group-premium">
                <label className="form-label-premium">Brand</label>
                <input name="brand" value={productForm.brand} onChange={handleProductChange} className="form-input-premium" />
              </div>
              <div className="form-group-premium">
                <label className="form-label-premium">Catalog Tag</label>
                <select name="tag" value={productForm.tag} onChange={handleProductChange} className="form-input-premium form-select-premium">
                  {productTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group-premium">
              <label className="form-label-premium">Image URL / Emoji Character</label>
              <input name="img" value={productForm.img} onChange={handleProductChange} className="form-input-premium" />
            </div>

            <div className="form-group-premium">
              <label className="form-label-premium">File Image Upload</label>
              <input type="file" accept="image/*" onChange={handleProductImage} style={{ fontSize: '0.78rem' }} />
            </div>

            <div className="form-group-premium">
              <label className="form-label-premium">Short Product Description</label>
              <textarea name="description" value={productForm.description} onChange={handleProductChange} rows="3" className="form-input-premium" style={{ resize: 'vertical' }} />
            </div>

            <div className="form-group-premium">
              <label className="form-label-premium">Technical Specifications JSON</label>
              <textarea name="specs" value={productForm.specs} onChange={handleProductChange} rows="3" className="form-input-premium" style={{ fontFamily: 'monospace', fontSize: '0.75rem', resize: 'vertical' }} />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
              <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1, padding: '12px 0' }}>
                {editingProduct ? 'SAVE CHANGES' : 'DEPLOY PRODUCT'}
              </button>
              <button type="button" onClick={resetProductForm} className="btn btn-outline" style={{ flex: 1, padding: '12px 0' }}>
                CANCEL
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FORM OVERLAY DRAWER - USERS */}
      {showUserDrawer && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(62, 10, 54, 0.4)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'flex-end',
          animation: 'fadeInOverlay 0.2s ease'
        }} onClick={resetUserForm}>
          <form 
            onSubmit={submitUser} 
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '440px',
              backgroundColor: '#ffffff',
              height: '100%',
              boxShadow: '-10px 0 40px rgba(0,0,0,0.1)',
              padding: 'clamp(24px, 4vw, 40px) clamp(16px, 3vw, 32px)',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              animation: 'slideInDrawer 0.3s cubic-bezier(0.16, 1, 0.3, 1) both'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
              <h3 style={{ fontSize: '1rem', margin: 0 }}>
                {editingUser ? 'Modify User Node' : 'Register Operator Node'}
              </h3>
              <button 
                type="button" 
                onClick={resetUserForm}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--color-text-muted)' }}
              >
                &times;
              </button>
            </div>

            <div className="form-group-premium">
              <label className="form-label-premium">Full Name</label>
              <input name="name" value={userForm.name} onChange={handleUserChange} required className="form-input-premium" />
            </div>

            <div className="form-group-premium">
              <label className="form-label-premium">Email Address</label>
              <input name="email" type="email" value={userForm.email} onChange={handleUserChange} required className="form-input-premium" />
            </div>

            <div className="form-group-premium">
              <label className="form-label-premium">Password</label>
              <input name="password" type="password" value={userForm.password} onChange={handleUserChange} placeholder={editingUser ? 'Leave blank to keep current' : 'Required'} className="form-input-premium" />
            </div>

            <div className="form-group-premium">
              <label className="form-label-premium">Phone Contact</label>
              <input name="phone" value={userForm.phone} onChange={handleUserChange} className="form-input-premium" />
            </div>

            <div className="form-group-premium">
              <label className="form-label-premium">Authority clearance</label>
              <select name="role" value={userForm.role} onChange={handleUserChange} className="form-input-premium form-select-premium">
                {userRoles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '12px 0' }}>
                {editingUser ? 'SAVE CHANGES' : 'CREATE USER'}
              </button>
              <button type="button" onClick={resetUserForm} className="btn btn-outline" style={{ flex: 1, padding: '12px 0' }}>
                CANCEL
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Global CSS Inject */}
      <style>{`
        @media (max-width: 991px) {
          .admin-layout-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 768px) {
          .admin-nav-label {
            font-size: 0.72rem !important;
          }
        }
        @private-media (max-width: 480px) {
          .admin-layout-grid aside {
            padding: 12px !important;
          }
        }
        @keyframes fadeInOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInDrawer {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );

  function renderOverview() {
    return (
      <div className="animate-fade-in">
        <h3 style={panelTitleStyle}>System Health & Telemetry</h3>

        {/* Critical Stock Warning Alert Block */}
        {lowStockProducts.length > 0 && (
          <div style={{
            backgroundColor: 'rgba(198, 40, 40, 0.04)',
            border: '1px solid rgba(198, 40, 40, 0.15)',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c62828' }}>
              <span style={{ fontSize: '1.2rem' }}>⚠️</span>
              <strong style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CRITICAL STOCK WARNING</strong>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', margin: '0 0 8px 0' }}>
              The following products are running below the safe stock threshold (5 items):
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {lowStockProducts.map(p => (
                <div key={getProductId(p)} style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid rgba(198, 40, 40, 0.2)',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '0.72rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: '700',
                  color: '#c62828'
                }}>
                  <span>{p.img || '📦'}</span>
                  <span>{p.name}</span>
                  <span style={{ backgroundColor: '#fff1f2', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem' }}>{p.stock} left</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Metric Cards Grid */}
        <div className="admin-metric-cards" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <MetricCard label="Settled Revenue" value={`GHS ${totalRevenue.toLocaleString()}`} detail={`${orders.filter(order => order.paymentStatus === 'paid' || order.paymentMethod === 'cod').length} paid/COD orders`} color="#3e0a36" />
          <MetricCard label="Pending Revenue" value={`GHS ${pendingRevenue.toLocaleString()}`} detail={`${orders.filter(order => (order.paymentMethod === 'card' || order.paymentMethod === 'momo') && order.paymentStatus === 'pending').length} verification pending`} color="#ff9800" />
          <MetricCard label="Catalog Products" value={products.length} detail={`${flashProducts.length} live flash sales`} color="#2d0727" />
          <MetricCard label="Items Sold" value={totalItemsSold} detail={`${lowStockProducts.length} low stock alerts`} color="#2e7d32" />
          <MetricCard label="Operators Registered" value={users.length} detail={`${staff.length} staff, ${customers.length} users`} color="#c62828" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          <OverviewBlock title="Top Performing Catalog Item" body={products[0]?.name ? `${products[0].name} has the highest visibility rating.` : 'No products in database.'} />
          <OverviewBlock title="Low Stock Level warning" body={lowStockProducts.length > 0 ? `${lowStockProducts.length} items are running below safe stock threshhold (5 items).` : 'All catalog products are securely stocked.'} />
          <OverviewBlock title="Fulfillments Pending Courier" body={`${orders.filter(order => order.status !== 'Delivered').length} orders require shipping updates.`} />
          <OverviewBlock title="Support Queue status" body={`${reviews.filter(r => r.status === 'pending').length} client reviews are pending moderation.`} />
        </div>
      </div>
    );
  }

  function renderProducts() {
    return (
      <div className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ fontSize: '1rem', margin: 0, color: 'var(--color-primary-dark)' }}>Product Inventory ({products.length})</h3>
          <button 
            onClick={() => { resetProductForm(); setShowProductDrawer(true); }}
            className="btn btn-primary btn-sm"
            style={{ padding: '10px 18px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <span>+</span> Deploy Product
          </button>
        </div>

        <div className="table-premium-wrap" style={{ maxHeight: 'clamp(400px, 60vh, 560px)', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
          <table className="table-premium" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 5, backgroundColor: '#ffffff' }}>
              <tr>
                <th style={{ textAlign: 'left', padding: '12px 14px' }}>Product</th>
                <th style={{ textAlign: 'left', padding: '12px 14px' }}>Category</th>
                <th style={{ textAlign: 'left', padding: '12px 14px' }}>Price</th>
                <th style={{ textAlign: 'left', padding: '12px 14px' }}>Stock</th>
                <th style={{ textAlign: 'left', padding: '12px 14px' }}>Tag</th>
                <th style={{ textAlign: 'center', padding: '12px 14px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={getProductId(product)} style={{ borderBottom: '1px solid var(--border-color-light)' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--color-card-bg)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                        {product.img && (product.img.startsWith('/') || product.img.startsWith('http') || product.img.startsWith('data:')) ? (
                          <img src={product.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '2px' }} />
                        ) : (
                          <span style={{ fontSize: '1.1rem' }}>{product.img || '📦'}</span>
                        )}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <strong style={{ display: 'block', fontSize: '0.82rem', color: 'var(--color-text-dark)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>{product.name}</strong>
                        <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{product.brand || 'Generic'}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '0.78rem' }}>{product.category}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.78rem', fontWeight: '700' }}>GHS {Number(product.price || 0).toLocaleString()}</td>
                  <td style={{ 
                    padding: '12px 14px', 
                    fontSize: '0.78rem', 
                    fontWeight: product.stock <= 5 ? '800' : '500',
                    color: product.stock <= 5 ? 'var(--color-error)' : 'inherit'
                  }}>
                    {product.stock}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    {product.tag && (
                      <span className="badge-premium" style={{ 
                        backgroundColor: product.tag === 'Flash Sale' ? 'rgba(198,40,40,0.08)' : 'rgba(62,10,54,0.05)', 
                        color: product.tag === 'Flash Sale' ? 'var(--color-error)' : 'var(--color-primary)' 
                      }}>
                        {product.tag}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <button
                      onClick={() => {
                        setEditingProduct(getProductId(product));
                        setProductForm({
                          ...product,
                          tag: product.tag || 'None',
                          oldPrice: product.oldPrice || '',
                          specs: JSON.stringify(product.specs || {}, null, 2)
                        });
                        setShowProductDrawer(true);
                      }}
                      className="btn btn-outline btn-sm"
                      style={{ padding: '6px 12px', marginRight: '6px', borderRadius: '6px', fontSize: '0.65rem' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteProduct(getProductId(product))}
                      className="btn btn-sm"
                      style={{ backgroundColor: '#fff1f2', color: 'var(--color-error)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.65rem' }}
                    >
                      Del
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function renderFlashSale() {
    return (
      <div className="animate-fade-in">
        <h3 style={panelTitleStyle}>Configure Flash Sales & Discounts</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '16px' }}>
          <div style={{
            backgroundColor: 'var(--color-card-bg)',
            border: '1px solid var(--border-color)',
            padding: '20px',
            borderRadius: '12px',
            height: 'fit-content'
          }}>
            <h4 style={{ fontSize: '0.82rem', marginBottom: '14px', color: 'var(--color-primary-dark)' }}>Activate Flash Promo tag</h4>
            
            <div className="form-group-premium" style={{ marginBottom: '16px' }}>
              <label className="form-label-premium">Choose Target Catalog Product</label>
              <select
                value={flashProductId}
                onChange={e => setFlashProductId(e.target.value)}
                className="form-input-premium form-select-premium"
                style={{ backgroundColor: '#ffffff' }}
              >
                <option value="">Choose product...</option>
                {products.map(product => <option key={getProductId(product)} value={getProductId(product)}>{product.name}</option>)}
              </select>
            </div>

            <button
              onClick={updateFlashSale}
              disabled={!flashProductId || loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', borderRadius: '6px' }}
            >
              DEPLOY FLASH SALE STICKER
            </button>
          </div>

          <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px' }}>
            <h4 style={{ fontSize: '0.82rem', marginBottom: '14px', color: 'var(--color-primary-dark)' }}>Live Promo Campaigns ({flashProducts.length})</h4>
            
            {flashProducts.length === 0 ? (
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>No products listed under active flash promotions.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {flashProducts.map(p => (
                  <div key={getProductId(p)} className="flex-between" style={{ padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: '#ffffff', gap: '8px', flexWrap: 'wrap' }}>
                    <div style={{ minWidth: 0 }}>
                      <strong style={{ fontSize: '0.8rem', display: 'block', color: 'var(--color-text-dark)' }}>{p.name}</strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-primary)', fontWeight: '700' }}>GHS {Number(p.price).toLocaleString()}</span>
                    </div>
                    <button
                      onClick={() => clearFlashSale(getProductId(p))}
                      className="btn btn-sm"
                      style={{ padding: '6px 10px', backgroundColor: '#fff1f2', color: 'var(--color-error)', border: 'none', borderRadius: '4px', fontSize: '0.65rem', flexShrink: 0 }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  function renderOrders() {
    return (
      <div className="animate-fade-in">
        <h3 style={panelTitleStyle}>Client Order Fulfilment Logistics</h3>
        
        <div className="table-premium-wrap" style={{ maxHeight: 'clamp(400px, 60vh, 560px)', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
          <table className="table-premium" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 5, backgroundColor: '#ffffff' }}>
              <tr>
                <th style={{ textAlign: 'left', padding: '12px 14px' }}>Order Ref</th>
                <th style={{ textAlign: 'left', padding: '12px 14px' }}>Customer Details</th>
                <th style={{ textAlign: 'left', padding: '12px 14px' }}>Basket Content</th>
                <th style={{ textAlign: 'left', padding: '12px 14px' }}>Total</th>
                <th style={{ textAlign: 'left', padding: '12px 14px' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '12px 14px' }}>Tracking</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id} style={{ borderBottom: '1px solid var(--border-color-light)' }}>
                  <td style={{ padding: '12px 14px', fontSize: '0.75rem' }}>
                    <strong>#{order._id.substring(18)}</strong>
                    <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '0.78rem' }}>
                    <strong style={{ color: 'var(--color-text-dark)' }}>{order.user?.name || 'Guest'}</strong>
                    <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--color-text-muted)', wordBreak: 'break-all' }}>{order.user?.email || ''}</span>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                    {order.items?.slice(0, 2).map(item => `${item.product?.name || 'Product'} (x${item.qty})`).join(', ')}
                    {order.items?.length > 2 && ' ...'}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-primary)' }}>
                    GHS {Number(order.financials?.grandTotal || 0).toLocaleString()}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <select
                      value={order.status}
                      onChange={e => updateOrderStatus(order._id, e.target.value)}
                      className="form-input-premium form-select-premium"
                      style={{ padding: '6px 24px 6px 10px', fontSize: '0.7rem', width: 'auto', minWidth: '100px', backgroundColor: '#ffffff' }}
                    >
                      {orderStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '0.72rem', color: 'var(--color-text-muted)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.trackingUpdate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function renderUsers(role) {
    const visibleUsers = users.filter(user => user.role === role);
    const isStaff = role === 'staff';

    return (
      <div className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ fontSize: '1rem', margin: 0, color: 'var(--color-primary-dark)' }}>
            Registered {isStaff ? 'Staff' : 'Clients'} ({visibleUsers.length})
          </h3>
          <button 
            onClick={() => { resetUserForm(); setUserForm(prev => ({ ...prev, role })); setShowUserDrawer(true); }}
            className="btn btn-primary btn-sm"
            style={{ padding: '10px 18px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <span>+</span> Register {isStaff ? 'Staff' : 'User'}
          </button>
        </div>

        <div className="table-premium-wrap" style={{ maxHeight: 'clamp(400px, 60vh, 560px)', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
          <table className="table-premium" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 5, backgroundColor: '#ffffff' }}>
              <tr>
                <th style={{ textAlign: 'left', padding: '12px 14px' }}>User</th>
                <th style={{ textAlign: 'left', padding: '12px 14px' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '12px 14px' }}>Phone</th>
                <th style={{ textAlign: 'center', padding: '12px 14px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map(user => (
                <tr key={getUserId(user)} style={{ borderBottom: '1px solid var(--border-color-light)' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--color-secondary)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.78rem', flexShrink: 0 }}>
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <strong style={{ fontSize: '0.78rem', color: 'var(--color-text-dark)' }}>{user.name}</strong>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '0.75rem', wordBreak: 'break-all' }}>{user.email}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{user.phone || '—'}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <button
                      onClick={() => {
                        setEditingUser(getUserId(user));
                        setUserForm({ name: user.name || '', email: user.email || '', password: '', role: user.role || 'staff', phone: user.phone || '' });
                        setShowUserDrawer(true);
                      }}
                      className="btn btn-outline btn-sm"
                      style={{ padding: '6px 12px', marginRight: '6px', borderRadius: '6px', fontSize: '0.65rem' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteUser(getUserId(user))}
                      className="btn btn-sm"
                      style={{ backgroundColor: '#fff1f2', color: 'var(--color-error)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.65rem' }}
                    >
                      Del
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function renderReviews() {
    const pendingReviews = reviews.filter(review => review.status === 'pending');
    const visibleReviews = reviews.filter(review => review.status !== 'pending');

    return (
      <div className="animate-fade-in">
        <h3 style={panelTitleStyle}>Moderation Hub & Feedback Logs</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '16px' }}>
          
          <div style={{
            backgroundColor: 'var(--color-card-bg)',
            border: '1px solid var(--border-color)',
            padding: '20px',
            borderRadius: '12px',
            height: 'fit-content'
          }}>
            <h4 style={{ fontSize: '0.82rem', marginBottom: '14px', color: 'var(--color-primary-dark)' }}>Moderation Queue ({pendingReviews.length})</h4>
            
            {pendingReviews.length === 0 ? (
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>No feedback entries require review moderation.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pendingReviews.map(review => (
                  <div key={review._id} style={{ border: '1px solid var(--border-color)', padding: '14px', borderRadius: '8px', backgroundColor: '#ffffff' }}>
                    <strong style={{ fontSize: '0.82rem' }}>{review.name}</strong>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-primary)', margin: '4px 0 10px', fontStyle: 'italic', lineHeight: '1.4' }}>"{review.text}"</p>
                    <small style={{ color: 'var(--color-text-muted)', display: 'block', marginBottom: '10px', fontSize: '0.72rem' }}>Rating: {review.rating}/5 &bull; {review.product}</small>
                    
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => updateReviewStatus(review._id, 'approved')} className="btn btn-primary btn-sm" style={{ padding: '6px 10px', borderRadius: '4px', fontSize: '0.65rem' }}>Approve</button>
                      <button onClick={() => updateReviewStatus(review._id, 'rejected')} className="btn btn-outline btn-sm" style={{ padding: '6px 10px', borderRadius: '4px', fontSize: '0.65rem' }}>Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h4 style={{ fontSize: '0.82rem', marginBottom: '14px', color: 'var(--color-primary-dark)' }}>Moderated Feedback Logs</h4>
            
            <div className="table-premium-wrap" style={{ maxHeight: 'clamp(300px, 50vh, 420px)', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
              <table className="table-premium" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '10px 12px' }}>User</th>
                    <th style={{ textAlign: 'left', padding: '10px 12px' }}>Feedback</th>
                    <th style={{ textAlign: 'left', padding: '10px 12px' }}>Rating</th>
                    <th style={{ textAlign: 'left', padding: '10px 12px' }}>Status</th>
                    <th style={{ textAlign: 'center', padding: '10px 12px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleReviews.map(review => (
                    <tr key={review._id} style={{ borderBottom: '1px solid var(--border-color-light)' }}>
                      <td style={{ padding: '10px 12px', fontSize: '0.75rem' }}>
                        <strong>{review.name}</strong>
                        <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>{review.email}</span>
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: '0.75rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <span style={{ display: 'block', lineHeight: '1.4' }}>{review.text}</span>
                        <small style={{ color: 'var(--color-text-muted)' }}>Product: {review.product}</small>
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: '0.75rem' }}>{review.rating}/5</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span className="badge-premium" style={{ 
                          backgroundColor: review.status === 'approved' ? 'rgba(46,125,50,0.08)' : 'rgba(198,40,40,0.08)', 
                          color: review.status === 'approved' ? 'var(--color-success)' : 'var(--color-error)' 
                        }}>
                          {review.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {review.status !== 'approved' && (
                          <button onClick={() => updateReviewStatus(review._id, 'approved')} className="btn btn-outline btn-sm" style={{ padding: '4px 8px', marginRight: '4px', fontSize: '0.6rem' }}>Approve</button>
                        )}
                        {review.status !== 'rejected' && (
                          <button onClick={() => updateReviewStatus(review._id, 'rejected')} className="btn btn-outline btn-sm" style={{ padding: '4px 8px', marginRight: '4px', fontSize: '0.6rem' }}>Reject</button>
                        )}
                        <button onClick={() => deleteReview(review._id)} className="btn btn-sm" style={{ backgroundColor: '#fff1f2', color: 'var(--color-error)', padding: '4px 8px', fontSize: '0.6rem' }}>Del</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    );
  }
}

function MetricCard({ label, value, detail, color }) {
  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid var(--border-color)',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 20px rgba(62, 10, 54, 0.01)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        height: '4px',
        width: '100%',
        backgroundColor: color
      }} />
      <span style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.6rem', fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        {label}
      </span>
      <strong style={{ display: 'block', color: 'var(--color-primary-dark)', fontSize: 'clamp(1.3rem, 3vw, 1.6rem)', margin: '10px 0 4px', letterSpacing: '-0.02em', fontWeight: '900' }}>
        {value}
      </strong>
      <small style={{ color: 'var(--color-text-secondary)', fontSize: '0.72rem', fontWeight: '600' }}>{detail}</small>
    </div>
  );
}

function OverviewBlock({ title, body }) {
  return (
    <div style={{
      backgroundColor: 'var(--color-card-bg)',
      border: '1px solid var(--border-color)',
      borderRadius: '10px',
      padding: '16px',
      lineHeight: '1.5',
      boxShadow: '0 2px 10px rgba(0,0,0,0.01)'
    }}>
      <strong style={{ fontSize: '0.78rem', color: 'var(--color-primary-dark)', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</strong>
      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', margin: 0 }}>{body}</p>
    </div>
  );
}

const tabs = [
  { id: 'overview', label: 'Overview Dashboard', icon: '📊' },
  { id: 'products', label: 'Product Inventory', icon: '🛍️' },
  { id: 'flash', label: 'Promo Campaigns', icon: '⚡' },
  { id: 'orders', label: 'Logistics Orders', icon: '🚚' },
  { id: 'staff', label: 'Staff Associates', icon: '👮' },
  { id: 'customers', label: 'Client Accounts', icon: '👥' },
  { id: 'reviews', label: 'Feedback Review', icon: '💬' }
];

const panelTitleStyle = {
  margin: '0 0 20px 0',
  fontSize: 'clamp(1rem, 2.5vw, 1.15rem)',
  color: 'var(--color-primary-dark)',
  borderBottom: '2px solid var(--color-secondary)',
  paddingBottom: '10px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em'
};

const getProductId = product => product._id || product.id;
const getUserId = user => user._id || user.id;