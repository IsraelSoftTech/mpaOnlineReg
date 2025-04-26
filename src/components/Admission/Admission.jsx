import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Admission.css';
import logo from '../../assets/logo.png';
import { FaFacebookF, FaInstagram, FaYoutube, FaTiktok } from 'react-icons/fa';

// Use production backend URL
const API_URL = 'https://mpaonlinebackend.onrender.com';

// Animation variants
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const Admission = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    sex: '',
    dateOfBirth: '',
    placeOfBirth: '',
    fathersName: '',
    mothersName: '',
    guidanceContact: '',
    admissionClass: '',
    picture: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create form data
      const studentData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        sex: formData.sex,
        dateOfBirth: formData.dateOfBirth,
        placeOfBirth: formData.placeOfBirth,
        fathersName: formData.fathersName,
        mothersName: formData.mothersName,
        guidanceContact: formData.guidanceContact,
        admissionClass: formData.admissionClass
      };

      // Create FormData for file upload
      const formDataToSend = new FormData();
      Object.keys(studentData).forEach(key => {
        formDataToSend.append(key, studentData[key]);
      });
      formDataToSend.append('picture', formData.picture);

      console.log('Sending registration request with data:', studentData);

      const response = await axios.post(`${API_URL}/api/auth/register-student`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        navigate('/payment', { state: { studentId: response.data.studentId } });
      } else {
        setError(response.data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('An error occurred during registration. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admission-container">
      <nav className="navbar">
        <Link to="/" className="logo">
          <img src={logo} alt="logo" />
        </Link>
        <div className="nav-links">
          <Link to="/about">About Us</Link>
          <Link to="/admission" className="active">Admission</Link>
          <Link to="/login">Sign In</Link>
          <Link to="/register">Sign Up</Link>
        </div>
      </nav>

      <div className="admission-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="admission-form-container"
        >
          <h1 className="admission-title">Student Registration</h1>
          
          <form onSubmit={handleSubmit} className="admission-form">
            <div className="form-group">
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name"
                required
              />
            </div>

            <div className="form-group">
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                required
              />
            </div>

            <div className="form-group">
              <select
                name="sex"
                value={formData.sex}
                onChange={handleChange}
                required
              >
                <option value="">Select Sex</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </div>

            <div className="form-group">
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <input
                type="text"
                name="placeOfBirth"
                value={formData.placeOfBirth}
                onChange={handleChange}
                placeholder="Place of Birth"
                required
              />
            </div>

            <div className="form-group">
              <input
                type="text"
                name="fathersName"
                value={formData.fathersName}
                onChange={handleChange}
                placeholder="Father's Name"
                required
              />
            </div>

            <div className="form-group">
              <input
                type="text"
                name="mothersName"
                value={formData.mothersName}
                onChange={handleChange}
                placeholder="Mother's Name"
                required
              />
            </div>

            <div className="form-group">
              <input
                type="tel"
                name="guidanceContact"
                value={formData.guidanceContact}
                onChange={handleChange}
                placeholder="Guidance Contact"
                required
              />
            </div>

            <div className="form-group">
              <select
                name="admissionClass"
                value={formData.admissionClass}
                onChange={handleChange}
                required
              >
                <option value="">Select Class</option>
                <option value="Form 1">Form 1</option>
                <option value="Form 2">Form 2</option>
                <option value="Form 3">Form 3</option>
                <option value="Form 4 Science">Form 4 Science</option>
                <option value="Form 4 Arts">Form 4 Arts</option>
                <option value="Form 5 Science">Form 5 Science</option>
                <option value="Form 5 Arts">Form 5 Arts</option>
                <option value="Lower Sixth Arts">Lower Sixth Arts</option>
                <option value="Lower Sixth Science">Lower Sixth Science</option>
                <option value="Upper Sixth Arts">Upper Sixth Arts</option>
                <option value="Upper Sixth Science">Upper Sixth Science</option>
                <option value="Form 1 Commercial">Form 1 Commercial</option>
                <option value="Form 2 Commercial">Form 2 Commercial</option>
                <option value="Form 3 Commercial">Form 3 Commercial</option>
                <option value="Form 4 Commercial">Form 4 Commercial</option>
                <option value="Form 5 Commercial">Form 5 Commercial</option>
                <option value="Lower Sixth Commercial">Lower Sixth Commercial</option>
                <option value="Upper Sixth Commercial">Upper Sixth Commercial</option>
              </select>
            </div>

            <div className="form-group">
              <input
                type="file"
                name="picture"
                onChange={handleChange}
                accept="image/*"
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="register-button" disabled={loading}>
              {loading ? 'Processing...' : 'Register'}
            </button>
          </form>
        </motion.div>
      </div>

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

export default Admission; 