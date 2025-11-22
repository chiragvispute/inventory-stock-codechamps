import React from 'react'
import { Link } from 'react-router-dom'
import './LandingPage.css'

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* Navigation Bar */}
      <nav className="landing-navbar">
        <div className="navbar-container">
          {/* Logo Section */}
          <div className="logo-section">
            <div className="logo-placeholder">
              <img 
                src="/logo.jpeg" 
                alt="StockShelf Logo" 
                className="logo-image"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'block'
                }}
              />
              <div className="logo-fallback">SS</div>
            </div>
            <h1 className="brand-name">StockShelf</h1>
          </div>

          {/* Auth Buttons */}
          <div className="auth-buttons">
            <Link to="/login" className="login-btn">Login</Link>
            <Link to="/signup" className="signup-btn">Sign Up</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">
            Streamline Your Inventory Management with StockShelf
          </h1>
          <p className="hero-description">
            Powerful, intuitive inventory management system designed for modern businesses. 
            Track stock levels, manage deliveries, and optimize your warehouse operations with ease.
          </p>
          <div className="hero-buttons">
            <Link to="/signup" className="cta-primary">Get Started Free</Link>
            <Link to="/login" className="cta-secondary">Sign In</Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose StockShelf?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 11H15M9 15H15M17 21H7C6.46957 21 5.96086 20.7893 5.58579 20.4142C5.21071 20.0391 5 19.5304 5 19V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L19.7071 9.70711C19.8946 9.89464 20 10.149 20 10.4142V19C20 19.5304 19.7893 20.0391 19.4142 20.4142C19.0391 20.7893 18.5304 21 18 21H17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Real-time Tracking</h3>
              <p>Monitor your inventory levels in real-time with instant updates and alerts for low stock items.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7M3 7C3 5.89543 3.89543 5 5 5H19C20.1046 5 21 5.89543 21 7M3 7L12 13L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Delivery Management</h3>
              <p>Streamline your delivery process with automated scheduling and tracking capabilities.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 19V6L21 12L9 18V19ZM9 19H3V5H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Smart Analytics</h3>
              <p>Get detailed insights and analytics to make informed decisions about your inventory.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2>Built for Modern Businesses</h2>
              <p>
                StockShelf is a comprehensive inventory management solution designed to help businesses 
                of all sizes optimize their operations. From small startups to large enterprises, our 
                platform scales with your needs.
              </p>
              <p>
                With advanced features like AI-powered insights, automated reordering, and seamless 
                integrations, StockShelf transforms the way you manage your inventory.
              </p>
              <Link to="/signup" className="about-cta">Start Your Free Trial</Link>
            </div>
            <div className="about-stats">
              <div className="stat-item">
                <h3>500+</h3>
                <p>Active Users</p>
              </div>
              <div className="stat-item">
                <h3>1M+</h3>
                <p>Items Tracked</p>
              </div>
              <div className="stat-item">
                <h3>99.9%</h3>
                <p>Uptime</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}