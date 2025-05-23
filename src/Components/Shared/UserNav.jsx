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
    <header className="app-header">
      <div className="logo-section">
        <img src={logo} alt="logo" className="app-logo" />
        <span className="app-brand">MPASAT</span>
      </div>
      <div className="nav-actions">
        <SearchBar />
        <UserNotif />
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
            <IoLogOutOutline className="nav-icon" />
            Log out
          </button>
          <button 
            className={`app-nav-link${location.pathname === '/about' ? ' active' : ''}`}
            onClick={() => navigate('/about')}
          >
            <IoInformationCircleOutline className="nav-icon" />
            About
          </button>
          <button 
            className={`app-nav-link${location.pathname === '/userAdmission' ? ' active' : ''}`}
            onClick={() => navigate('/userAdmission')}
          >
            <IoPersonAddOutline className="nav-icon" />
            Admission
          </button>
          <button 
            className={`app-nav-link${location.pathname === '/usertrack' ? ' active' : ''}`}
            onClick={() => navigate('/usertrack')}
          >
            <IoCheckmarkCircleOutline className="nav-icon" />
            Check Status
          </button>
          <button 
            className={`app-nav-link${location.pathname === '/contact' ? ' active' : ''}`}
            onClick={() => navigate('/contact')}
          >
            <IoMailOutline className="nav-icon" />
            Contact
          </button>
          <button 
            className={`app-nav-link${location.pathname === '/profile' ? ' active' : ''}`}
            onClick={() => navigate('/profile')}
          >
            <IoPersonOutline className="nav-icon" />
            Profile
          </button>
        </div>
        <div className="desktop-menu">
          <button 
            className={`app-nav-link${location.pathname === '/about' ? ' active' : ''}`}
            onClick={() => navigate('/about')}
          >
            <IoInformationCircleOutline className="nav-icon" />
            About
          </button>
          <button 
            className={`app-nav-link${location.pathname === '/userAdmission' ? ' active' : ''}`}
            onClick={() => navigate('/userAdmission')}
          >
            <IoPersonAddOutline className="nav-icon" />
            Admission
          </button>
          <button 
            className={`app-nav-link${location.pathname === '/usertrack' ? ' active' : ''}`}
            onClick={() => navigate('/usertrack')}
          >
            <IoCheckmarkCircleOutline className="nav-icon" />
            Check Status
          </button>
          <button 
            className={`app-nav-link${location.pathname === '/contact' ? ' active' : ''}`}
            onClick={() => navigate('/contact')}
          >
            <IoMailOutline className="nav-icon" />
            Contact
          </button>
          <button 
            className={`app-nav-link${location.pathname === '/profile' ? ' active' : ''}`}
            onClick={() => navigate('/profile')}
          >
            <IoPersonOutline className="nav-icon" />
            Profile
          </button>
          <button className="app-nav-link logout" onClick={handleLogout}>
            <IoLogOutOutline className="nav-icon" />
            Log out
          </button>
        </div>
      </nav>
    </header>
  );
};

export default UserNav; 