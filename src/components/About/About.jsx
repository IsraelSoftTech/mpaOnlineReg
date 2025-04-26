import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

// Create different image animations with varying durations
const imageAnimations = [
  {
    hidden: { opacity: 0, scale: 0.8, rotate: -5 },
    visible: { 
      opacity: 1, 
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  },
  {
    hidden: { opacity: 0, scale: 0.8, rotate: 5 },
    visible: { 
      opacity: 1, 
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  },
  {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  },
  {
    hidden: { opacity: 0, scale: 0.8, y: -20 },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut"
      }
    }
  }
];

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
          <Link to="/admission">Admission</Link>
          <Link to="/login">Sign In</Link>
          <Link to="/register">Sign Up</Link>
        </div>
      </nav>

      <motion.div 
        className="about-header"
        initial="hidden"
        whileInView="visible"
        viewport={{ amount: 0.2 }}
        variants={staggerContainer}
      >
        <motion.div className="content-wrapper" variants={fadeInUp}>
          <h1>MPASAT</h1>
          <p>Reg. No. 697/L/MINESEC/SG/DESG/SDSEPESG/SSGEPESG of 1/12/2022, MILE 3 NKWEN BAMENDA, Tel: +237 679953185</p>
          <p>A Unique Secondary and High School bridging the gap between grammar, technical, commercial and vocational education in Cameroon and the world at large.</p>

          <h1>OUR UNIQUENESS</h1>
          <p>We blend Theory and Practicals. We give students good theory and take them for practise.</p>

          <h1>OUR VISION</h1>
          <p>We envisage to change the educational system of Cameroon to a productive one in the next 5 years to come.</p>

          <h1>OUR VOCATIONAL TRAINING PROGRAMS</h1>
        </motion.div>
      </motion.div>

      <main className="main-content">
        <motion.div 
          className="departments-container"
          initial="hidden"
          whileInView="visible"
          viewport={{ amount: 0.2 }}
          variants={staggerContainer}
        >
          {departments.map((department, index) => (
            <motion.div 
              key={index} 
              className="department-section"
              variants={fadeInUp}
            >
              <motion.div className="department-content" variants={fadeInUp}>
                <h2>{department.title}</h2>
                <p>{department.description}</p>
              </motion.div>
              <motion.div 
                className="department-images"
                variants={staggerContainer}
              >
                {department.images.map((img, i) => (
                  <motion.div 
                    key={i} 
                    className="image-holder"
                    variants={imageAnimations[i % imageAnimations.length]}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <img src={img} alt={`${department.title} ${i + 1}`} />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </main>

      <motion.footer 
        className="footer"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ amount: 0.2 }}
        transition={{ duration: 0.5 }}
      >
        <div className="footer-content">
          <motion.div 
            className="footer-logo"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            M P A S A T
          </motion.div>
          <div className="footer-text">All Rights Reserved - 2025</div>
          <div className="social-links">
            <span>Follow us on:</span>
            <motion.div 
              className="social-icons"
              variants={staggerContainer}
            >
              <motion.a 
                href="#instagram"
                whileHover={{ scale: 1.2, color: "#E1306C" }}
                transition={{ duration: 0.2 }}
              >
                <FaInstagram />
              </motion.a>
              <motion.a 
                href="#facebook"
                whileHover={{ scale: 1.2, color: "#4267B2" }}
                transition={{ duration: 0.2 }}
              >
                <FaFacebookF />
              </motion.a>
              <motion.a 
                href="#tiktok"
                whileHover={{ scale: 1.2, color: "#000000" }}
                transition={{ duration: 0.2 }}
              >
                <FaTiktok />
              </motion.a>
              <motion.a 
                href="#youtube"
                whileHover={{ scale: 1.2, color: "#FF0000" }}
                transition={{ duration: 0.2 }}
              >
                <FaYoutube />
              </motion.a>
            </motion.div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default About;
