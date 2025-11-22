import '../styles/Footer.css'

export default function Footer() {
  return (
    <footer className="global-footer">
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
  )
}