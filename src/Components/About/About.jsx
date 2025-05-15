import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { RiMenu3Line, RiCloseFill } from 'react-icons/ri';
import { ref, onValue } from 'firebase/database';
import { database } from '../../firebase';
import './About.css';
import logo from '../../assets/logo.png'
const About = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // Fetch departments from Firebase
  useEffect(() => {
    const departmentsRef = ref(database, 'departments');
    const unsubscribe = onValue(departmentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const departmentsList = Object.entries(data).map(([id, dept]) => ({
          id,
          ...dept
        }));
        setDepartments(departmentsList);
      } else {
        setDepartments([]);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && 
          menuRef.current && 
          !menuRef.current.contains(event.target) &&
          buttonRef.current &&
          !buttonRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div className="page-wrapper">
      {/* Header */}
      <header className="header-about">
        <div className="logo"><img src={logo} alt=""/></div>
        <button 
          ref={buttonRef}
          className="menu-toggle" 
          onClick={toggleMenu} 
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <RiCloseFill size={24} /> : <RiMenu3Line size={24} />}
        </button>
        <nav ref={menuRef} className={`app-nav ${isMenuOpen ? 'nav-open' : ''}`}>
          <Link to="/about" className="app-nav-link active">About</Link>
          <Link to="/admission" className="app-nav-link">Admission</Link>
          <Link to="/checkstatus" className="app-nav-link">Check Status</Link>
          <Link to="/contact" className={`app-nav-link${location.pathname === '/contact' ? ' active' : ''}`}>Contact</Link>
          <Link to="/profile" className="app-nav-link">Profile</Link>
          <button className="app-nav-link logout" onClick={() => navigate('/signin')}>Log out</button>
        </nav>
      </header>
      <main className="main-content about-main">
        <div className="about-intro">
          <h1 className="about-welcome">Welcome to our unique institution.</h1>
          <div className="about-sub">Know more about us.</div>
        </div>
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading departments...</p>
          </div>
        ) : (
          <div className="vocational-section">
            {departments.map((dept) => (
              <div className="vocational-card" key={dept.id}>
                <div className="voc-title">{dept.title}</div>
                <div className="voc-desc">{dept.desc}</div>
                <div className="voc-images-grid-2x2">
                  {dept.images.map((img, i) => (
                    <img src={img} alt={dept.title + ' ' + (i+1)} key={i} className="voc-img-2x2" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      {/* Footer */}
      <footer className="footer-about">
        <div className="footer-logo">MPASAT ADMISSION PORTAL</div>
        <div className="footer-center">MPASAT, All Rights Reserved - 2025</div>
        <div className="footer-socials">
          <span>Follow us on:</span>
          <span className="icon social-icon instagram"></span>
          <span className="icon social-icon facebook"></span>
          <span className="icon social-icon tiktok"></span>
          <span className="icon social-icon twitter"></span>
        </div>
      </footer>
    </div>
  );
};

export default About;
