import React, { useState, useRef, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RiMenu3Line, RiCloseFill } from 'react-icons/ri';
import { 
  IoInformationCircleOutline,
  IoPersonAddOutline,
  IoCheckmarkCircleOutline,
  IoMailOutline,
  IoPersonOutline,
  IoLogOutOutline
} from 'react-icons/io5';
import { AdmissionContext } from '../AdmissionContext';
import logo from '../../assets/logo.png';
import SearchBar from './SearchBar';
import UserNotif from './UserNotif';
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
    navigate('/login');
  };

  return (
    <div className="user-nav-wrapper">
      <header className="user-header">
        <div className="user-logo-section">
          <img src={logo} alt="logo" className="user-logo" />
          <span className="user-brand">MPASAT</span>
        </div>
        <div className="user-nav-actions">
          <SearchBar />
          <UserNotif />
        </div>
        <button
          ref={buttonRef}
          className="user-menu-toggle"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <RiCloseFill size={24} /> : <RiMenu3Line size={24} />}
        </button>
        <nav ref={menuRef} className={`user-nav ${isMenuOpen ? 'user-nav-open' : ''}`}>
          <div className="user-mobile-menu">
            <button className="user-nav-link user-logout" onClick={handleLogout}>
              <IoLogOutOutline className="user-nav-icon" />
              Log out
            </button>
            <button 
              className={`user-nav-link${location.pathname === '/about' ? ' user-active' : ''}`}
              onClick={() => navigate('/about')}
            >
              <IoInformationCircleOutline className="user-nav-icon" />
              About
            </button>
            <button 
              className={`user-nav-link${location.pathname === '/userAdmission' ? ' user-active' : ''}`}
              onClick={() => navigate('/userAdmission')}
            >
              <IoPersonAddOutline className="user-nav-icon" />
              Admission
            </button>
            <button 
              className={`user-nav-link${location.pathname === '/usertrack' ? ' user-active' : ''}`}
              onClick={() => navigate('/usertrack')}
            >
              <IoCheckmarkCircleOutline className="user-nav-icon" />
              Check Status
            </button>
            <button 
              className={`user-nav-link${location.pathname === '/contact' ? ' user-active' : ''}`}
              onClick={() => navigate('/contact')}
            >
              <IoMailOutline className="user-nav-icon" />
              Contact
            </button>
            <button 
              className={`user-nav-link${location.pathname === '/profile' ? ' user-active' : ''}`}
              onClick={() => navigate('/profile')}
            >
              <IoPersonOutline className="user-nav-icon" />
              Profile
            </button>
          </div>
          <div className="user-desktop-menu">
            <button 
              className={`user-nav-link${location.pathname === '/about' ? ' user-active' : ''}`}
              onClick={() => navigate('/about')}
            >
              <IoInformationCircleOutline className="user-nav-icon" />
              About
            </button>
            <button 
              className={`user-nav-link${location.pathname === '/userAdmission' ? ' user-active' : ''}`}
              onClick={() => navigate('/userAdmission')}
            >
              <IoPersonAddOutline className="user-nav-icon" />
              Admission
            </button>
            <button 
              className={`user-nav-link${location.pathname === '/usertrack' ? ' user-active' : ''}`}
              onClick={() => navigate('/usertrack')}
            >
              <IoCheckmarkCircleOutline className="user-nav-icon" />
              Check Status
            </button>
            <button 
              className={`user-nav-link${location.pathname === '/contact' ? ' user-active' : ''}`}
              onClick={() => navigate('/contact')}
            >
              <IoMailOutline className="user-nav-icon" />
              Contact
            </button>
            <button 
              className={`user-nav-link${location.pathname === '/profile' ? ' user-active' : ''}`}
              onClick={() => navigate('/profile')}
            >
              <IoPersonOutline className="user-nav-icon" />
              Profile
            </button>
            <button className="user-nav-link user-logout" onClick={handleLogout}>
              <IoLogOutOutline className="user-nav-icon" />
              Log out
            </button>
          </div>
        </nav>
      </header>
    </div>
  );
};

export default UserNav; 