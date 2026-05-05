import { useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import './App.css'
import ServicesPage from './pages/ServicesPage'
import BarbersPage from './pages/BarbersPage'
import BookingModal from './components/BookingModal'
import type { BookingInitialData } from './types/index'

function App() {
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingData, setBookingData] = useState<BookingInitialData | undefined>(undefined);

  const openBooking = (data: BookingInitialData) => {
    setBookingData(data);
    setIsModalOpen(true);
  };

  return (
    <div className="App">
      <nav className="navbar">
        <div className="container nav-container">
          <Link to="/" className="logo">BARBER<span>SHOP</span></Link>
          <div className="nav-links">
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Servicios</Link>
            <Link to="/barbers" className={location.pathname === '/barbers' ? 'active' : ''}>Barberos</Link>
          </div>
        </div>
      </nav>
      
      <main className="container">
        <Routes>
          <Route path="/" element={<ServicesPage onBook={openBooking} />} />
          <Route path="/barbers" element={<BarbersPage onBook={openBooking} />} />
        </Routes>
      </main>

      <BookingModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setBookingData(undefined);
        }} 
        initialData={bookingData}
      />
    </div>
  )
}

export default App



