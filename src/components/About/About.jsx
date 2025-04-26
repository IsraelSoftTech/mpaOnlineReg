import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './About.css';
import logo from '../../assets/logo.png';
import { FaBars, FaTimes } from 'react-icons/fa';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

// Image imports for Chemical Engineering
import chemical1 from '../../assets/chemical.jpg';
import chemical2 from '../../assets/chemical2.jpg';
import chemical3 from '../../assets/chemical3.jpg';
import chemical4 from '../../assets/chemical4.jpg';

// Image imports for Agriculture
import agric1 from '../../assets/agric.jpg';
import agric2 from '../../assets/agric2.jpg';
import agric3 from '../../assets/agric3.jpg';
import agric4 from '../../assets/agric4.jpg';

// Import slider images
import slider1 from '../../assets/agric.jpg';
import slider2 from '../../assets/agric3.jpg';
import slider3 from '../../assets/agric2.jpg';
import slider4 from '../../assets/agric4.jpg';

// Department data
const departments = [
  {
    title: '1.Chemical Engineering',
    description: 'Turning chemical equations into products. More than 50 household products released to students and trainees...',
    images: [chemical1, chemical2, chemical3, chemical4],
  },
  {
    title: '2.Agriculture',
    description: 'We offer a comprehensive academic program with experienced faculty, modern teaching methods...',
    images: [agric1, agric2, agric3, agric4],
  },
];

const About = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const slides = [
    { image: slider1, alt: 'Campus View 1' },
    { image: slider2, alt: 'Campus View 2' },
    { image: slider3, alt: 'Campus View 3' },
    { image: slider4, alt: 'Campus View 4' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="about-container">
      <nav className="navbar">
        <div className="logo">
          <img src={logo} alt="MPASAT Logo" />
        </div>
        <h1 className="site-title">MPASAT</h1>
        <div className="menu-icon" onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </div>
        <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/about" className="active">About Us</Link>
          <Link to="/admission">Admission</Link>
          <Link to="/login">Sign In</Link>
          <Link to="/register">Sign Up</Link>
        </div>
      </nav>

      <div className="slider-container">
        <div className="slider" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {slides.map((slide, index) => (
            <div key={index} className="slide">
              <img src={slide.image} alt={slide.alt} />
            </div>
          ))}
        </div>
        <div className="slider-overlay">
          <h1>About MPASAT</h1>
        
        </div>
        <div className="slider-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`dot ${currentSlide === index ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>

      <div className="vision-mission-container">
        <div className="vision-card">
          <h2>Our Vision</h2>
          <p>To be a leading institution in providing innovative and practical education that transforms lives and communities.</p>
        </div>
        <div className="mission-card">
          <h2>Our Mission</h2>
          <p>To provide quality education and training that equips students with the skills and knowledge needed to excel in their chosen fields.</p>
        </div>
      </div>
<h4 style={{textAlign:"center",fontSize:"30px"}}>Vocational Training Departments:</h4>
      <div className="departments-container">
        {departments.map((department, index) => (
          <div key={index} className="department-section">
            <div className="department-content">
              <h2>{department.title}</h2>
              <p>{department.description}</p>
            </div>
            <div className="department-images">
              {department.images.map((img, i) => (
                <div key={i} className="image-holder">
                  <img src={img} alt={`${department.title} ${i + 1}`} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <img src={logo} alt="MPASAT Logo" />
            <p>MPASAT - All Rights Reserved, @ 2025</p>
            <p>Reg. No. 697/L/MINESEC/SG/DESG/SDSEPESG/SSGEPESG of 1/12/2022</p>
            <p>MILE 3 NKWEN BAMENDA</p>
            <p>Tel: +237 679953185</p>
          </div>
          <div className="social-links">
            <p>Follow us on social media</p>
            <div className="social-icons">
              <a href="https://www.facebook.com/mpasat" target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
              <a href="https://www.twitter.com/mpasat" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
              <a href="https://www.instagram.com/mpasat" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
              <a href="https://www.linkedin.com/company/mpasat" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;
