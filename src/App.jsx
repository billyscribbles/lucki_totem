import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LuckiProvider } from './store/LuckiContext.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import BlindBoxReveal from './components/BlindBoxReveal.jsx'
import CheckoutOverlay from './components/CheckoutOverlay.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import InventoryDrawer from './components/InventoryDrawer.jsx'
import Toast from './components/Toast.jsx'
import Home from './pages/Home.jsx'
import ShopPage from './pages/ShopPage.jsx'
import BlindBoxPage from './pages/BlindBoxPage.jsx'
import ProtectorsPage from './pages/ProtectorsPage.jsx'
import CollectionPage from './pages/CollectionPage.jsx'
import WhalePage from './pages/WhalePage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

// LUCKI is a scroll-first site: Home carries every section. The router
// also serves the collection page, per-whale detail pages and a real
// 404. The cart, collection drawer, reveal and toast live at app level
// so any section can open them through the store.
export default function App() {
  return (
    <BrowserRouter>
      <LuckiProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/blind-boxes" element={<BlindBoxPage />} />
          <Route path="/protectors" element={<ProtectorsPage />} />
          <Route path="/collection" element={<CollectionPage />} />
          <Route path="/whale/:key" element={<WhalePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Footer />

        <BlindBoxReveal />
        <CheckoutOverlay />
        <CartDrawer />
        <InventoryDrawer />
        <Toast />
      </LuckiProvider>
    </BrowserRouter>
  )
}
