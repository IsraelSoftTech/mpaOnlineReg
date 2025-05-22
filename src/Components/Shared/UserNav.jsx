import React, { useState, useRef, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RiMenu3Line, RiCloseFill } from 'react-icons/ri';
import { AdmissionContext } from '../AdmissionContext';
import logo from '../../assets/logo.png';
import './UserNav.css';

const UserNav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useContext(AdmissionContext);

  const toggleMenu = () => setIsMenuOpen((open) => !open);

  const handleLogout = () => {
    logout();
    navigate('/about');
  };

  return (
    <header className="app-header">
      <div className="logo-section">
        <img src={logo} alt="logo" className="app-logo" />
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
        <div className="mobile-menu">
          <button className="app-nav-link logout" onClick={handleLogout}>
            Log out
          </button>
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
        </div>
        <div className="desktop-menu">
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
          <button className="app-nav-link logout" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </nav>
    </header>
  );
};

export default UserNav; 