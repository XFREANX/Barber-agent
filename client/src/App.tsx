import { useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import './App.css'
import ServicesPage from './pages/ServicesPage'
import BarbersPage from './pages/BarbersPage'
import NotFoundPage from './pages/NotFoundPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import MyAppointmentsPage from './pages/MyAppointmentsPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import ProtectedRoute from './components/ProtectedRoute'
import BookingModal from './components/BookingModal'
import Footer from './components/Footer'
import { useAuth } from './context/AuthContext'
import type { BookingInitialData } from './types/index'

function App() {
  const location = useLocation();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingData, setBookingData] = useState<BookingInitialData | undefined>(undefined);
  const [showUserMenu, setShowUserMenu] = useState(false);

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
            {isAuthenticated && (
              <Link to="/my-appointments" className={location.pathname === '/my-appointments' ? 'active' : ''}>
                Mis Citas
              </Link>
            )}
            {isAuthenticated && user?.role === 'admin' && (
              <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''} style={{ color: 'var(--primary-color)' }}>
                ⚡ Admin
              </Link>
            )}
          </div>
          <div className="nav-auth">
            {isLoading ? (
              <div className="nav-auth-skeleton" />
            ) : isAuthenticated && user ? (
              <div className="user-menu-wrapper">
                <button
                  className="user-menu-btn"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  aria-label="Menú de usuario"
                >
                  <span className="user-avatar">{user.name.charAt(0).toUpperCase()}</span>
                  <span className="user-name">{user.name.split(' ')[0]}</span>
                  <span className={`chevron ${showUserMenu ? 'open' : ''}`}>▾</span>
                </button>
                {showUserMenu && (
                  <>
                    <div className="user-menu-overlay" onClick={() => setShowUserMenu(false)} />
                    <div className="user-dropdown">
                      <div className="dropdown-header">
                        <span className="dropdown-name">{user.name}</span>
                        <span className="dropdown-email">{user.email}</span>
                      </div>
                      <div className="dropdown-divider" />
                      <Link
                        to="/profile"
                        className="dropdown-item profile-item"
                        onClick={() => setShowUserMenu(false)}
                      >
                        👤 Mi Perfil
                      </Link>
                      <Link
                        to="/my-appointments"
                        className="dropdown-item profile-item"
                        onClick={() => setShowUserMenu(false)}
                      >
                        📅 Mis Citas
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="dropdown-item profile-item"
                          style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}
                          onClick={() => setShowUserMenu(false)}
                        >
                          ⚡ Panel Admin
                        </Link>
                      )}
                      <div className="dropdown-divider" />
                      <button
                        className="dropdown-item logout-item"
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link to="/login" className="nav-login-btn">
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </nav>
      
      <main className="container">
        <Routes>
          <Route path="/" element={<ServicesPage onBook={openBooking} />} />
          <Route path="/barbers" element={<BarbersPage onBook={openBooking} />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-appointments"
            element={
              <ProtectedRoute>
                <MyAppointmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />

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

