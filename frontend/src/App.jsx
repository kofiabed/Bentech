import { useMemo, useState, useEffect } from 'react';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import CartCheckout from './pages/CartCheckout';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import Auth from './pages/Auth';
import SuccessPage from './pages/SuccessPage';
import Layout from './components/Layout';
import StaticPages from './pages/StaticPages';


export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [cartItems, setCartItems] = useState([]);
  const [initialCategory, setInitialCategory] = useState(null);
  const [initialSearch, setInitialSearch] = useState('');
  const [user, setUser] = useState(null);
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const handleToggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.some(item => item._id === product._id || item.id === product.id);
      if (exists) {
        return prev.filter(item => item._id !== product._id && item.id !== product.id);
      }
      return [...prev, { ...product, id: product._id || product.id }];
    });
  };

  useEffect(() => {
    const checkLoggedUser = async () => {
      const savedToken = localStorage.getItem('token');
      if (!savedToken) return;
      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${savedToken}` }
        });
        const data = await response.json();
        if (response.ok) {
          setUser(data.user);
        } else {
          localStorage.removeItem('token');
        }
      } catch (err) {
        console.error("Session recovery error:", err);
      }
    };
    checkLoggedUser();
  }, []);

  const paymentReference = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return new URLSearchParams(window.location.search).get('reference');
  }, []);

  const renderedPage = paymentReference ? 'success' : currentPage;

  const handleAddToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item._id === product._id || item.id === product.id);
      if (existing) {
        return prev.map(item =>
          (item._id === product._id || item.id === product.id)
            ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1, id: product._id || product.id }];
    });
  };

  const handleClearCart = () => setCartItems([]);

  const navigateTo = (page, category = null, search = '') => {
    if (category) setInitialCategory(category);
    setInitialSearch(search);
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    navigateTo('home');
  };

  const handleLogout = () => {
    setUser(null);
    setCartItems([]);
    localStorage.removeItem('token');
    navigateTo('home');
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  return (
    <Layout
      user={user}
      cartCount={cartCount}
      currentPage={currentPage}
      navigateTo={navigateTo}
      onLogout={handleLogout}
    >
      {renderedPage === 'home' && <Home onItemAdd={handleAddToCart} onNavigate={navigateTo} user={user} />}
      {renderedPage === 'catalog' && <Catalog onItemAdd={handleAddToCart} initialCategory={initialCategory} initialSearch={initialSearch} wishlist={wishlist} onToggleWishlist={handleToggleWishlist} />}
      {renderedPage === 'auth' && <Auth onAuthSuccess={handleAuthSuccess} />}
      {renderedPage === 'cart' && <CartCheckout isUserLoggedIn={!!user} onRedirectToLogin={() => navigateTo('auth')} cartItems={cartItems} onCartCleared={handleClearCart} user={user} />}
      {renderedPage === 'success' && <SuccessPage onNavigate={navigateTo} onClearCart={handleClearCart} />}
      {renderedPage === 'dashboard' && (
        !user ? <Auth onAuthSuccess={handleAuthSuccess} /> : user.role === 'admin' ? <AdminDashboard /> : user.role === 'staff' ? <StaffDashboard /> : <Dashboard user={user} wishlist={wishlist} onToggleWishlist={handleToggleWishlist} onItemAdd={handleAddToCart} />
      )}
      {['about', 'locations', 'license', 'privacy', 'track-order', 'warranty', 'inquiries', 'faq'].includes(renderedPage) && (
        <StaticPages page={renderedPage} onNavigate={navigateTo} />
      )}
    </Layout>
  );
}

