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
import CollectionPage from './pages/CollectionPage.jsx'
import WhalePage from './pages/WhalePage.jsx'
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
          <Route path="/collection" element={<CollectionPage />} />
          <Route path="/whale/:key" element={<WhalePage />} />
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
