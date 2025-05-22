import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RiMenu3Line, RiCloseFill } from 'react-icons/ri';
import { 
  IoHomeOutline,
  IoWalletOutline,
  IoBusinessOutline,
  IoBookOutline,
  IoCardOutline,
  IoPersonAddOutline,
  IoCalendarOutline,
  IoPersonOutline,
  IoMailOutline
} from 'react-icons/io5';
import logo from '../../assets/logo.png';
import './AdminNav.css';

const AdminNav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen((open) => !open);

  const handleLogout = () => {
    navigate('/signin');
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
        <button className="app-nav-link logout mobile-only" onClick={handleLogout}>
          Log out
        </button>
        <button 
          className={`app-nav-link${location.pathname === '/admin' ? ' active' : ''}`}
          onClick={() => navigate('/admin')}
        >
          <IoHomeOutline className="nav-icon" />
          Overview
        </button>
        <button 
          className={`app-nav-link${location.pathname === '/adminpay' ? ' active' : ''}`}
          onClick={() => navigate('/adminpay')}
        >
          <IoWalletOutline className="nav-icon" />
          Payments
        </button>
        <button 
          className={`app-nav-link${location.pathname === '/departments' ? ' active' : ''}`}
          onClick={() => navigate('/departments')}
        >
          <IoBusinessOutline className="nav-icon" />
          Create Departments
        </button>
        <button 
          className={`app-nav-link${location.pathname === '/classes' ? ' active' : ''}`}
          onClick={() => navigate('/classes')}
        >
          <IoBookOutline className="nav-icon" />
          Classes
        </button>
        <button 
          className={`app-nav-link${location.pathname === '/idcards' ? ' active' : ''}`}
          onClick={() => navigate('/idcards')}
        >
          <IoCardOutline className="nav-icon" />
          ID Cards
        </button>
        <button 
          className={`app-nav-link${location.pathname === '/adminAdmission' ? ' active' : ''}`}
          onClick={() => navigate('/adminAdmission')}
        >
          <IoPersonAddOutline className="nav-icon" />
          Admission
        </button>
        <button 
          className={`app-nav-link${location.pathname === '/interviews' ? ' active' : ''}`}
          onClick={() => navigate('/interviews')}
        >
          <IoCalendarOutline className="nav-icon" />
          Interviews
        </button>
        <button 
          className={`app-nav-link${location.pathname === '/adminreg' || location.pathname === '/admintrack' ? ' active' : ''}`}
          onClick={() => navigate('/adminreg')}
        >
          <IoPersonOutline className="nav-icon" />
          Register
        </button>
        <button 
          className={`app-nav-link${location.pathname === '/admincontact' ? ' active' : ''}`}
          onClick={() => navigate('/admincontact')}
        >
          <IoMailOutline className="nav-icon" />
          Contact
        </button>
        <button className="app-nav-link logout desktop-only" onClick={handleLogout}>
          Log out
        </button>
      </nav>
    </header>
  );
};

export default AdminNav; 