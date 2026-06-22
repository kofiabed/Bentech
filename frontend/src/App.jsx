import { useMemo, useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
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
import ResetPassword from './pages/ResetPassword';


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

  const isSameProduct = (a, b) => {
    if (a._id && b._id && a._id === b._id) return true;
    if (a.id && b.id && a.id === b.id) return true;
    return false;
  };

  const handleToggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.some(item => isSameProduct(item, product));
      if (exists) {
        return prev.filter(item => !isSameProduct(item, product));
      }
      return [...prev, { ...product, id: product._id || product.id }];
    });
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setCurrentPage('reset-password');
        return;
      }
      
      if (session) {
        localStorage.setItem('token', session.access_token);
        try {
          const response = await fetch('/api/auth/me', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${session.access_token}` }
          });
          const data = await response.json();
          if (response.ok) {
            setUser(data.user);
          } else {
            localStorage.removeItem('token');
            setUser(null);
          }
        } catch (err) {
          console.error("Session recovery error:", err);
        }
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sync React cartItems state with Supabase cart_items table in database
  useEffect(() => {
    const syncCart = async () => {
      if (!user) return;
      try {
        const { data: dbCart, error } = await supabase
          .from('cart_items')
          .select('*')
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        // Upsert all React cartItems to Supabase
        for (const item of cartItems) {
          const prodId = item._id || item.id;
          await supabase
            .from('cart_items')
            .upsert({
              user_id: user.id,
              product_id: prodId,
              qty: item.qty
            }, { onConflict: 'user_id,product_id' });
        }
        
        // Delete items from database that are no longer in React cart
        const reactIds = cartItems.map(i => i._id || i.id);
        const dbItemsToDelete = dbCart.filter(i => !reactIds.includes(i.product_id));
        
        for (const i of dbItemsToDelete) {
          await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', user.id)
            .eq('product_id', i.product_id);
        }
      } catch (err) {
        console.error("Cart synchronization error:", err);
      }
    };
    syncCart();
  }, [cartItems, user]);

  // Load user cart items on session start / login
  useEffect(() => {
    const loadCart = async () => {
      if (!user) return;
      try {
        const { data: dbCart, error } = await supabase
          .from('cart_items')
          .select(`
            qty,
            product:products (*)
          `)
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        if (dbCart && dbCart.length > 0) {
          const loadedItems = dbCart
            .filter(item => item.product !== null)
            .map(item => ({
              ...item.product,
              qty: item.qty,
              id: item.product.id
            }));
          setCartItems(loadedItems);
        }
      } catch (err) {
        console.error("Error loading cart from database:", err);
      }
    };
    loadCart();
  }, [user]);

  const paymentReference = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return new URLSearchParams(window.location.search).get('reference');
  }, []);

  const renderedPage = paymentReference ? 'success' : currentPage;


  const handleAddToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(item => isSameProduct(item, product));
      if (existing) {
        return prev.map(item =>
          isSameProduct(item, product)
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
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
      {renderedPage === 'cart' && <CartCheckout isUserLoggedIn={!!user} onRedirectToLogin={() => navigateTo('auth')} cartItems={cartItems} onCartCleared={handleClearCart} user={user} onCartChange={setCartItems} />}
      {renderedPage === 'success' && <SuccessPage onNavigate={navigateTo} onClearCart={handleClearCart} />}
      {renderedPage === 'reset-password' && <ResetPassword onRedirectToLogin={() => navigateTo('auth')} />}
      {renderedPage === 'dashboard' && (
        !user ? <Auth onAuthSuccess={handleAuthSuccess} /> : user.role === 'admin' ? <AdminDashboard /> : user.role === 'staff' ? <StaffDashboard /> : <Dashboard user={user} wishlist={wishlist} onToggleWishlist={handleToggleWishlist} onItemAdd={handleAddToCart} />
      )}
      {['about', 'locations', 'license', 'privacy', 'track-order', 'warranty', 'inquiries', 'faq'].includes(renderedPage) && (
        <StaticPages page={renderedPage} onNavigate={navigateTo} />
      )}
    </Layout>
  );
}

