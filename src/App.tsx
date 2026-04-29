import './App.css'
import ServicesPage from './pages/ServicesPage'

function App() {

  return (
    <div className="App">
      <nav className="navbar">
        <div className="container">
          <div className="logo">BARBER<span>SHOP</span></div>
        </div>
      </nav>
      <main className="container">
        <ServicesPage />
      </main>
    </div>
  )
}

export default App

