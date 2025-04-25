import React from 'react';
import { Link } from 'react-router-dom';
import './About.css';
import logo from '../../assets/logo.png';
import { FaFacebookF, FaInstagram, FaYoutube, FaTiktok } from 'react-icons/fa';

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
  return (
    <div className="about-container">
      <nav className="navbar">
        <Link to="/" className="logo">
          <img src={logo} alt="logo" />
        </Link>
        <div className="nav-links">
          <Link to="/about" className="active">About Us</Link>
          <Link to="/login">Sign In</Link>
          <Link to="/register">Sign Up</Link>
        </div>
      </nav>

      <div className="about-header">
        <h1>MPASAT</h1>
        <p>Reg. No. 697/L/MINESEC/SG/DESG/SDSEPESG/SSGEPESG of 1/12/2022,MILE 3 NKWEN BAMENDA, Tel: +237 679953185
</p>
  <p>A Unique Secondary and High School bridging the gap between grammar,technical,commercial and vocational education in Cameroon and the world at large.</p>
<h1>OUR UNIQUENESS</h1>
       <p>We blend Theory and Practicals. We give students good theory and take them for practise.</p>
         <h1>OUR VISION</h1>
       
    
        <p>We envisage to change the change the eduactional system of Cameroon to a productive one in the next 5 years to come.</p>
        <h1>OUR VOCATIONAL TRAINING PROGRAMS</h1>
      </div>

      <main className="main-content">
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
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">M P A S A T</div>
          <div className="footer-text">All Rights Reserved - 2025</div>
          <div className="social-links">
            <span>Follow us on:</span>
            <div className="social-icons">
              <a href="#instagram"><FaInstagram /></a>
              <a href="#facebook"><FaFacebookF /></a>
              <a href="#tiktok"><FaTiktok /></a>
              <a href="#youtube"><FaYoutube /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;
