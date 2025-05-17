import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RiMenu3Line, RiCloseFill } from 'react-icons/ri';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaFacebook, FaYoutube } from 'react-icons/fa';
import { ref, onValue } from 'firebase/database';
import { database } from '../../firebase';
import './About.css';
import logo from '../../assets/logo.png';


const About = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [departments, setDepartments] = useState([]);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // Real-time departments fetch
  useEffect(() => {
    const departmentsRef = ref(database, 'departments');
    const unsubscribe = onValue(departmentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const departmentsList = Object.entries(data)
          .map(([id, dept]) => ({
            id,
            ...dept
          }))
          .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
        setDepartments(departmentsList);
      } else {
        setDepartments([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="page-wrapper">
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
          <button 
            className={`app-nav-link${location.pathname === '/about' ? ' active' : ''}`} 
            onClick={() => navigate('/about')}
          >
            About
          </button>
          <button 
            className="app-nav-link" 
            onClick={() => navigate('/signin')}
          >
            Admission
          </button>
        </nav>
      </header>

      <main className="about-main">
        {/* Welcome Section */}
        <section className="about-welcome-section">
          <h1>Welcome to MPASAT</h1>
          <div className="registration-number">
            Reg. No. 697/L/MINESEC/SG/DESG/SDSEPESG/SSGEPESG of 1/12/2022
          </div>
        </section>

        {/* About Us Section */}
        <section className="about-us-section">
          <h2>About Us</h2>
          <p>
            MPASAT is a unique educational center that combines grammar, technical, and vocational 
            education to provide comprehensive learning opportunities. Our institution is committed 
            to delivering quality education that prepares students for both academic excellence and 
            practical skills development. We pride ourselves in offering a diverse range of programs 
            that cater to various career paths and personal development goals.
          </p>
        </section>

        {/* Location Section */}
        <section className="location-section">
          <h2>Our Location</h2>
          <div className="location-content">
            <FaMapMarkerAlt className="location-icon" />
            <div className="location-details">
              <p>Mile 3 Nkwen</p>
              <p>Bamenda</p>
              <p>North West Region</p>
              <p>Cameroon</p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="contact-section">
          <h2>Contact Information</h2>
          <div className="contact-details">
            <div className="contact-item">
              <FaPhone className="contact-icon" />
              <a href="tel:+237679953185">+237 679953185</a>
            </div>
            <div className="contact-item">
              <FaEnvelope className="contact-icon" />
              <a href="mailto:mbakwaphosphate@gmail.com">mbakwaphosphate@gmail.com</a>
            </div>
            <div className="contact-item">
              <FaFacebook className="contact-icon" />
              <a href="https://www.facebook.com/Mpasat" target="_blank" rel="noopener noreferrer">Mpasat</a>
            </div>
            <div className="contact-item">
              <FaYoutube className="contact-icon" />
              <a href="https://youtube.com/@mbakwaphosphateacademy3992" target="_blank" rel="noopener noreferrer">
                Mbakwaphosphate Academy
              </a>
            </div>
          </div>
        </section>

        {/* Departments Section */}
        <section className="departments-section">
          <h2>Our Vocational Departments</h2>
          <div className="vocational-section">
            {departments.map((dept) => (
              <div className="vocational-card" key={dept.id}>
                <div className="voc-title">{dept.title}</div>
                <div className="voc-desc">{dept.desc}</div>
                <div className="voc-images-grid-2x2">
                  {dept.images?.map((img, i) => (
                    <img src={img} alt={dept.title + ' ' + (i+1)} key={i} className="voc-img-2x2" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

    
    </div>
  );
};

export default About;
