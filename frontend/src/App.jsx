import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Auth from './components/Auth';
import AddProductForm from './components/AddProductForm';
import ProductList from './components/ProductList';
import Groups from './components/Groups';
import Friends from './components/Friends';
import Claims from './components/Claims';
import Notifications from './components/Notifications';
import './App.css';

const API_URL = 'http://localhost:3001';

/**
 * Main App Component
 * Manages the state and API calls for the Anti Food Waste App.
 */
function App() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('fridge');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* User Menu State */
  const [showUserMenu, setShowUserMenu] = useState(false);

  /**
   * Checks if user is already logged in from localStorage.
   */
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  /**
   * Handles user login.
   * @param {Object} userData - User data from authentication.
   */
  const handleLogin = (userData) => {
    setUser(userData);
  };

  /**
   * Handles user logout.
   */
  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setProducts([]);
    setActiveTab('fridge');
  };

  /**
   * Fetches all products from the backend API.
   */
  const fetchProducts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/products?userId=${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check for expiring products and show toast
   */
  useEffect(() => {
    if (user) {
      const checkNotifications = async () => {
        try {
          const response = await fetch(`${API_URL}/notifications?userId=${user.id}`);
          if (response.ok) {
            const data = await response.json();
            const expiringCount = data.length;
            if (expiringCount > 0) {
              toast.warning(`⚠️ You have ${expiringCount} items expiring soon!`, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              });
              // Optional: Show specific first item
              // toast.info(`Eat your ${data[0].product.name} soon!`);
            }
          }
        } catch (e) {
          console.error("Failed to check notifications for toast", e);
        }
      };
      checkNotifications();
    }
  }, [user]);

  /**
   * Adds a new product to the backend.
   * @param {Object} product - The product to add.
   */
  const handleAddProduct = async (product) => {
    try {
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...product, userId: user.id }),
      });
      if (!response.ok) throw new Error('Failed to add product');
      await fetchProducts();
    } catch (err) {
      setError(err.message);
      console.error('Error adding product:', err);
    }
  };

  /**
   * Marks a product as available for sharing.
   * @param {number} id - The product ID.
   */
  /**
   * Marks a product as available for sharing.
   * @param {number} id - The product ID.
   * @param {Object} settings - Sharing settings (visibility, etc).
   */
  const handleMarkAvailable = async (id, settings = {}) => {
    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'AVAILABLE',
          visibility: settings.visibility || 'public',
          sharedWith: settings.sharedWith || null
        }),
      });
      if (!response.ok) throw new Error('Failed to update product');
      await fetchProducts();
    } catch (err) {
      setError(err.message);
      console.error('Error updating product:', err);
    }
  };

  /**
   * Deletes a product from the backend.
   * @param {number} id - The product ID.
   */
  const handleDeleteProduct = async (id) => {
    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete product');
      await fetchProducts();
    } catch (err) {
      setError(err.message);
      console.error('Error deleting product:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  // Show authentication screen if not logged in
  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  /**
   * Handles account deletion.
   */
  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure? This will verify permanent deletion of your account and data.")) return;

    try {
      const res = await fetch(`${API_URL}/api/auth/${user.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete account');
      alert('Account deleted.');
      handleLogout();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="app">
      <ToastContainer />
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <span className="logo-icon">🥗</span>
            <h1>No Waste</h1>
          </div>
          <p className="tagline">Share food, reduce waste, build community</p>

          <div className="header-actions">
            <Notifications user={user} />

            <div className="user-menu">
              <button
                className="user-menu-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                👤 {user.username} ▼
              </button>

              {showUserMenu && (
                <div className="dropdown-menu">
                  <button onClick={handleLogout} className="logout-btn">
                    🚪 Logout
                  </button>
                  <button onClick={handleDeleteAccount} className="delete-account-btn">
                    ❌ Delete Account
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <nav className="app-nav">
        <button
          className={activeTab === 'fridge' ? 'active' : ''}
          onClick={() => setActiveTab('fridge')}
        >
          🍽️ My Fridge
        </button>
        <button
          className={activeTab === 'claims' ? 'active' : ''}
          onClick={() => setActiveTab('claims')}
        >
          🤝 Claims
        </button>
        <button
          className={activeTab === 'groups' ? 'active' : ''}
          onClick={() => setActiveTab('groups')}
        >
          👥 Groups
        </button>
        <button
          className={activeTab === 'friends' ? 'active' : ''}
          onClick={() => setActiveTab('friends')}
        >
          🤗 Friends
        </button>
      </nav>

      <main className="app-main">
        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
            <button onClick={fetchProducts} className="retry-btn">Retry</button>
          </div>
        )}

        {/* My Fridge Tab */}
        {activeTab === 'fridge' && (
          <div className="content-grid">
            <aside className="sidebar">
              <AddProductForm onAdd={handleAddProduct} />
              <div className="stats-card">
                <h3>📊 Your Impact</h3>
                <div className="stat-item">
                  <span className="stat-value">{products.length}</span>
                  <span className="stat-label">Total Items</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{products.filter(p => p.status === 'AVAILABLE').length}</span>
                  <span className="stat-label">Shared Items</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">
                    {products.filter(p => {
                      const daysLeft = Math.ceil((new Date(p.expirationDate) - new Date()) / (1000 * 60 * 60 * 24));
                      return daysLeft <= 3 && daysLeft >= 0;
                    }).length}
                  </span>
                  <span className="stat-label">Expiring Soon</span>
                </div>
              </div>
            </aside>

            <section className="main-content">
              <div className="section-header">
                <h2>My Fridge</h2>
                <button onClick={fetchProducts} className="refresh-btn" disabled={loading}>
                  {loading ? '⏳ Loading...' : '🔄 Refresh'}
                </button>
              </div>

              {loading && products.length === 0 ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading your fridge...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">🍽️</span>
                  <h3>Your fridge is empty!</h3>
                  <p>Add your first product to start tracking and sharing.</p>
                </div>
              ) : (
                <ProductList
                  products={products}
                  onMarkAvailable={handleMarkAvailable}
                  onDelete={handleDeleteProduct}
                />
              )}
            </section>
          </div>
        )}

        {/* Claims Tab */}
        {activeTab === 'claims' && (
          <Claims user={user} />
        )}

        {/* Groups Tab */}
        {activeTab === 'groups' && (
          <Groups user={user} />
        )}

        {/* Friends Tab */}
        {activeTab === 'friends' && (
          <Friends user={user} />
        )}
      </main>

      <footer className="app-footer">
        <p>💚 Together we can reduce food waste</p>
      </footer>
    </div>
  );
}

export default App;
