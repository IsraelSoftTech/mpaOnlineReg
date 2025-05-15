import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RiMenu3Line, RiCloseFill } from 'react-icons/ri';
import './Contact.css';
import logo from '../../assets/logo.png';

const Contact = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen((open) => !open);

  return (
    <div className="userad-wrapper">
      <header className="app-header">
        <div className="logo-section">
          <img src={logo} alt="" className="app-logo" />
          <span className="app-brand">MPASAT</span>
        </div>
        <button
          ref={buttonRef}
          className="menu-toggle"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <RiCloseFill size={24} /> : <RiMenu3Line size={24} />}
        </button>
        <nav ref={menuRef} className={`app-nav ${isMenuOpen ? 'nav-open' : ''}`}>
          <button 
            className={`app-nav-link${location.pathname === '/about' ? ' active' : ''}`}
            onClick={() => navigate('/about')}
          >
            About
          </button>
          <button 
            className={`app-nav-link${location.pathname === '/userAdmission' ? ' active' : ''}`}
            onClick={() => navigate('/userAdmission')}
          >
            Admission
          </button>
          <button 
            className={`app-nav-link${location.pathname === '/usertrack' ? ' active' : ''}`}
            onClick={() => navigate('/usertrack')}
          >
            Check Status
          </button>
          <button 
            className={`app-nav-link${location.pathname === '/contact' ? ' active' : ''}`}
            onClick={() => navigate('/contact')}
          >
            Contact
          </button>
          <button 
            className={`app-nav-link${location.pathname === '/profile' ? ' active' : ''}`}
            onClick={() => navigate('/profile')}
          >
            Profile
          </button>
          <button className="app-nav-link logout" onClick={() => navigate('/signin')}>Log out</button>
        </nav>
      </header>
      <main className="userad-main">
        <div className="contact-container">
          <h2>Contact Us</h2>
          <p>This is the Contact page. Content coming soon.</p>
        </div>
      </main>
      <footer className="app-footer">
        <div className="footer-logo">MPASAT ADMISSION PORTAL</div>
        <div className="footer-center">MPASAT, All Rights Reserved - 2025</div>
        <div className="footer-socials">
          <span>Follow us on:</span>
          <span className="social-icon instagram"></span>
          <span className="social-icon facebook"></span>
          <span className="social-icon tiktok"></span>
          <span className="social-icon twitter"></span>
        </div>
      </footer>
    </div>
  );
};

export default Contact; 