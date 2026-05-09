import { BrowserRouter, Routes, Route } from 'react-router';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Collections from './pages/Collections';
import ProductDetail from './pages/ProductDetail';
import CartPage from './pages/CartPage';
import ArtistProfile from './pages/ArtistProfile';
import AdminArtists from './pages/AdminArtists';
import AdminAddArtist from './pages/AdminAddArtist';
import AdminEditArtist from './pages/AdminEditArtist';
import AdminAddProduct from './pages/AdminAddProduct';
import AdminEditProduct from './pages/AdminEditProduct';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import GlobalAudioPlayer from './components/GlobalAudioPlayer';
import CartDrawer from './components/CartDrawer';
import { useCartStore } from './store/cartStore';

function App() {
  const { isDrawerOpen, closeDrawer } = useCartStore();

  // Globals authentication interceptor actively attaching JWTs seamlessly to Protected /api/admin native physical endpoints
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const [resource, config] = args;
    if (typeof resource === 'string' && resource.startsWith('/api/admin')) {
      const token = localStorage.getItem('__mec_auth_token');
      const newConfig: RequestInit = { ...(config || {}) };
      if (token) {
        newConfig.headers = {
          ...newConfig.headers,
          'Authorization': `Bearer ${token}`
        };
      }
      return originalFetch(resource, newConfig);
    }
    return originalFetch(...args);
  };

  return (
    <BrowserRouter>
      <Navbar />
      <main className="container" style={{ marginTop: 'var(--spacing-8)', minHeight: '80vh' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/products/:handle" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/artists/:id" element={<ArtistProfile />} />
          <Route path="/login" element={<Login />} />
          
          {/* Core Admin Ecosystem Routing strictly bound by Protected Route middleware natively */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/artists" element={<AdminArtists />} />
            <Route path="/admin/artists/add" element={<AdminAddArtist />} />
            <Route path="/admin/artists/edit/:id" element={<AdminEditArtist />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/products/edit/:id" element={<AdminEditProduct />} />
            <Route path="/admin/add-product" element={<AdminAddProduct />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
          </Route>
        </Routes>
      </main>
      <CartDrawer isOpen={isDrawerOpen} onClose={closeDrawer} />
      <GlobalAudioPlayer />
    </BrowserRouter>
  );
}

export default App;
