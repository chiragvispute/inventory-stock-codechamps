import { useNavigate } from 'react-router-dom'
import '../styles/Landing.css'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="landing-navbar">
        <div className="navbar-content">
          {/* Logo Section */}
          <div className="navbar-brand">
            <div className="logo-placeholder">
              <img src="./public/assets/logo.jpg" alt="StockShelf Logo" style={{width: '32px', height: '32px'}} />
            </div>
        <h1 className="brand-title">
              <span style={{color: '#4a90ff'}}>Stock</span>Shelf
            </h1>
          </div>

          {/* Auth Buttons */}
          <div className="auth-buttons">
            <button 
              className="btn-login"
              onClick={() => navigate('/login')}
            >
              Login
            </button>
            <button 
              className="btn-signup"
              onClick={() => navigate('/signup')}
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Streamline Your Inventory Management
          </h1>
          <p className="hero-subtitle">
            Powerful, intuitive, and real-time inventory tracking for modern businesses
          </p>
          <div className="hero-buttons">
            <button 
              className="btn-primary"
              onClick={() => navigate('/signup')}
            >
              Get Started
            </button>
            <button 
              className="btn-secondary"
              onClick={() => navigate('/login')}
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="features-content">
          <h2 className="features-title">Why Choose StockShelf?</h2>
          <div className="features-grid">
            <div className="feature">
              <h3>Real-time Tracking</h3>
              <p>Monitor your inventory levels in real-time with automatic updates and live notifications.</p>
            </div>
            <div className="feature">
              <h3>Smart Analytics</h3>
              <p>Get insights into your inventory patterns with advanced analytics and reporting tools.</p>
            </div>
            <div className="feature">
              <h3>Easy Management</h3>
              <p>Streamline receipts, deliveries, and stock movements with our intuitive interface.</p>
            </div>
            <div className="feature">
              <h3>Multi-location Support</h3>
              <p>Manage multiple warehouses and locations from a single centralized platform.</p>
            </div>
            <div className="feature">
              <h3>Automated Workflows</h3>
              <p>Reduce manual work with automated stock adjustments and transfer processes.</p>
            </div>
            <div className="feature">
              <h3>Secure & Reliable</h3>
              <p>Enterprise-grade security with reliable backup and recovery systems.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>StockShelf</h3>
            <p>Modern inventory management solution for businesses of all sizes.</p>
          </div>
          <div className="footer-section">
            <h4>Features</h4>
            <ul>
              <li>Real-time Tracking</li>
              <li>Analytics Dashboard</li>
              <li>Multi-location Support</li>
              <li>Automated Workflows</li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li>Documentation</li>
              <li>Help Center</li>
              <li>Contact Us</li>
              <li>System Status</li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Company</h4>
            <ul>
              <li>About Us</li>
              <li>Careers</li>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 StockShelf. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}