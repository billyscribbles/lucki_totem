import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LuckiProvider } from './store/LuckiContext.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import BlindBoxReveal from './components/BlindBoxReveal.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import InventoryDrawer from './components/InventoryDrawer.jsx'
import Toast from './components/Toast.jsx'
import Home from './pages/Home.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

// LUCKI is a single-scroll site. The router exists only to give a real
// 404. The cart, collection, reveal and toast live at app level so any
// section can open them through the store.
export default function App() {
  return (
    <BrowserRouter>
      <LuckiProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Footer />

        <BlindBoxReveal />
        <CartDrawer />
        <InventoryDrawer />
        <Toast />
      </LuckiProvider>
    </BrowserRouter>
  )
}
