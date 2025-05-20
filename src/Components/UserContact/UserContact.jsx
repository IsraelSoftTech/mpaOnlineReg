import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RiMenu3Line, RiCloseFill } from 'react-icons/ri';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './UserContact.css';
import { AdmissionContext } from '../AdmissionContext';
import { database } from '../../firebase';
import { ref, push, onValue } from 'firebase/database';
import logo from '../../assets/logo.png';

const UserContact = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useContext(AdmissionContext);

  const toggleMenu = () => setIsMenuOpen((open) => !open);

  const handleLogout = () => {
    logout();
    navigate('/about');
  };

  return (
    <div className="userad-wrapper">
      <ToastContainer 
        position="top-right" 
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
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
          <button className={`app-nav-link${location.pathname === '/about' ? ' active' : ''}`} onClick={() => navigate('/about')}>About</button>
          <button className={`app-nav-link${location.pathname === '/userAdmission' ? ' active' : ''}`} onClick={() => navigate('/userAdmission')}>Admission</button>
          <button className={`app-nav-link${location.pathname === '/usertrack' ? ' active' : ''}`} onClick={() => navigate('/usertrack')}>Check Status</button>
          <button className={`app-nav-link${location.pathname === '/contact' ? ' active' : ''}`} onClick={() => navigate('/contact')}>Contact</button>
          <button className={`app-nav-link${location.pathname === '/profile' ? ' active' : ''}`} onClick={() => navigate('/profile')}>Profile</button>
          <button className="app-nav-link logout" onClick={handleLogout}>Logout</button>
        </nav>
      </header>
      <main className="userad-main">
        {/* ... rest of the existing JSX ... */}
      </main>
    </div>
  );
};

export default UserContact; 