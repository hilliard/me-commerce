import { BrowserRouter, Routes, Route } from 'react-router';
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
import AdminDashboard from './pages/AdminDashboard';
import GlobalAudioPlayer from './components/GlobalAudioPlayer';

function App() {
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
          {/* Core Admin Ecosystem Routing */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/artists" element={<AdminArtists />} />
          <Route path="/admin/artists/add" element={<AdminAddArtist />} />
          <Route path="/admin/artists/edit/:id" element={<AdminEditArtist />} />
          <Route path="/admin/add-product" element={<AdminAddProduct />} />
        </Routes>
      </main>
      <GlobalAudioPlayer />
    </BrowserRouter>
  );
}

export default App;
