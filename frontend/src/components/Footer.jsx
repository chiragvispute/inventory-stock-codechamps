import React from 'react'
import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-brand">
            <div className="footer-logo">
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
              <span className="brand-text">StockShelf</span>
            </div>
            <p className="footer-description">
              Streamline your inventory management with our powerful, 
              intuitive platform designed for modern businesses.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3 className="footer-title">Quick Links</h3>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/signup">Sign Up</Link></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#about">About</a></li>
            </ul>
          </div>

          {/* Features */}
          <div className="footer-section">
            <h3 className="footer-title">Features</h3>
            <ul className="footer-links">
              <li><span>Real-time Tracking</span></li>
              <li><span>Delivery Management</span></li>
              <li><span>Smart Analytics</span></li>
              <li><span>Inventory Reports</span></li>
              <li><span>Multi-warehouse Support</span></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-section">
            <h3 className="footer-title">Contact Info</h3>
            <ul className="footer-contact">
              <li>
                <span className="contact-icon">✉</span>
                <span>support@stockshelf.com</span>
              </li>
              <li>
                <span className="contact-icon">☎</span>
                <span>+1 (555) 123-4567</span>
              </li>
              <li>
                <span className="contact-icon">⌘</span>
                <span>123 Business Ave, Suite 100</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">
              © {new Date().getFullYear()} StockShelf. All rights reserved.
            </p>
            <div className="footer-legal">
              <a href="/privacy">Privacy Policy</a>
              <a href="/terms">Terms of Service</a>
              <a href="/cookies">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}