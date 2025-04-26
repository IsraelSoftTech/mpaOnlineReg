import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './SignUp.css';
import logo from '../../assets/logo.png';
import { FaFacebookF, FaInstagram, FaYoutube, FaTiktok, FaUser, FaEnvelope, FaEye, FaEyeSlash, FaBars, FaTimes } from 'react-icons/fa';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://mpaonlinebackend.onrender.com';

const SignUp = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const [countryCode, setCountryCode] = useState('+237');
  const [validationErrors, setValidationErrors] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  // Phone number length requirements by country code
  const phoneRequirements = {
    '+237': 9, // Cameroon
    '+234': 10, // Nigeria
    '+233': 9, // Ghana
    '+232': 8  // Sierra Leone
  };

  const checkPasswordStrength = (password) => {
    if (password.length === 0) return '';
    if (password.length < 8) return 'Too Short';

    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSymbols = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (hasLetters && hasNumbers && hasSymbols) {
      return 'Very Strong';
    } else if ((hasLetters && hasNumbers) || (hasLetters && hasSymbols) || (hasNumbers && hasSymbols)) {
      return 'Strong';
    } else {
      return 'Weak';
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'Very Strong':
        return '#2e7d32';
      case 'Strong':
        return '#1976d2';
      case 'Weak':
        return '#d32f2f';
      case 'Too Short':
        return '#ed6c02';
      default:
        return '#666';
    }
  };

  const validateForm = () => {
    const errors = {
      username: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    };

    // Username validation (single word)
    if (formData.username.includes(' ')) {
      errors.username = 'Username must be a single word';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Phone validation
    const requiredLength = phoneRequirements[countryCode];
    if (formData.phone.length !== requiredLength) {
      errors.phone = `Phone number must be ${requiredLength} digits for ${countryCode}`;
    }

    // Password validation
    if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);

    // Check if all fields are filled and there are no errors
    const isValid = Object.values(formData).every(val => val !== '') &&
                   Object.values(errors).every(error => error === '');
    
    setIsFormValid(isValid);
    return isValid;
  };

  useEffect(() => {
    setPasswordStrength(checkPasswordStrength(formData.password));
    validateForm();
  }, [formData, countryCode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Phone number validation - only allow numbers
    if (name === 'phone' && !/^\d*$/.test(value)) {
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Update password strength
    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/auth/signup`, {
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        phone: countryCode + formData.phone,
        password: formData.password
      });

      setSuccess('Account Created Successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="signup-container">
      <nav className="navbar">
        <div className="logo">
          <img src={logo} alt="MPASAT Logo" />
        </div>
        <h1 className="site-title">MPASAT</h1>
        <div className="menu-icon" onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </div>
        <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/about">About Us</Link>
          <Link to="/login">Sign In</Link>
          <Link to="/register" className="active">Sign Up</Link>
        </div>
      </nav>

      <main className="main-content">
        <div className="signup-card">
          <h1 className="signup-title">Sign up</h1>
          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <form onSubmit={handleSubmit} className="input-group">
            <div className="input-container">
              <input
                type="text"
                name="fullName"
                placeholder="Full names"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
              <span className="input-icon"><FaUser/></span>
            </div>

            <div className="input-container">
              <input
                type="text"
                name="username"
                placeholder="Username (single word)"
                value={formData.username}
                onChange={handleChange}
                required
              />
              <span className="input-icon"><FaUser/></span>
              {validationErrors.username && (
                <div className="field-error">{validationErrors.username}</div>
              )}
            </div>

            <div className="input-container">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <span className="input-icon"><FaEnvelope/></span>
              {validationErrors.email && (
                <div className="field-error">{validationErrors.email}</div>
              )}
            </div>

            <div className="phone-input">
              <div className="country-code">
                <select 
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                >
                  <option value="+237">+237</option>
                  <option value="+234">+234</option>
                  <option value="+233">+233</option>
                  <option value="+232">+232</option>
                </select>
              </div>
              <div className="phone-number">
                <input
                  type="tel"
                  name="phone"
                  placeholder={`${phoneRequirements[countryCode]} digits required`}
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength={phoneRequirements[countryCode]}
                  required
                />
              </div>
              {validationErrors.phone && (
                <div className="field-error">{validationErrors.phone}</div>
              )}
            </div>

            <div className="input-container">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password (min 8 characters)"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <span 
                className="input-icon clickable" 
                onClick={() => togglePasswordVisibility('password')}
              >
                {showPassword ? <FaEyeSlash/> : <FaEye/>}
              </span>
              {formData.password && (
                <div 
                  className="password-strength"
                  style={{ color: getPasswordStrengthColor() }}
                >
                  Password Strength: {passwordStrength}
                </div>
              )}
              {validationErrors.password && (
                <div className="field-error">{validationErrors.password}</div>
              )}
            </div>

            <div className="input-container">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <span 
                className="input-icon clickable" 
                onClick={() => togglePasswordVisibility('confirm')}
              >
                {showConfirmPassword ? <FaEyeSlash/> : <FaEye/>}
              </span>
              {validationErrors.confirmPassword && (
                <div className="field-error">{validationErrors.confirmPassword}</div>
              )}
            </div>

            <button 
              type="submit" 
              className={`signup-button ${!isFormValid ? 'disabled' : ''}`}
              disabled={!isFormValid || loading}
            >
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>

          <div className="login-prompt">
            <span>Already have an account? </span>
            <Link to="/login">Login</Link>
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">M P A S A T</div>
          <div className="footer-text">All Rights Reserved - 2025</div>
          <div className="social-links">
            <span>Follow us on:</span>
            <div className="social-icons">
              <a href="#instagram"><FaInstagram/></a>
              <a href="#facebook"><FaFacebookF/></a>
              <a href="#tiktok"><FaTiktok/></a>
              <a href="#youtube"><FaYoutube/></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SignUp; 