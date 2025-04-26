import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ResetPassword.css';
import logo from '../../assets/logo.png';
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaInstagram, FaFacebookF, FaTiktok, FaYoutube } from 'react-icons/fa';
import axios from 'axios';
import emailjs from '@emailjs/browser';

const API_URL = process.env.REACT_APP_API_URL || 'https://mpaonlinebackend.onrender.com';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Enter credentials, 2: Enter code and new password
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    newPassword: '',
    confirmPassword: '',
    resetCode: ''
  });
  const [showPassword, setShowPassword] = useState({
    new: false,
    confirm: false
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [codeExpiration, setCodeExpiration] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(60);

  // EmailJS configuration
  const EMAILJS_SERVICE_ID = "service_ak50y3m";
  const EMAILJS_TEMPLATE_ID = "template_8xmspgr";
  const EMAILJS_PUBLIC_KEY = "udVeGDLa-4ZwbJE0q";

  useEffect(() => {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }, []);

  useEffect(() => {
    if (codeExpiration) {
      const timer = setInterval(() => {
        const now = Date.now();
        const secondsLeft = Math.max(0, Math.ceil((codeExpiration - now) / 1000));
        setRemainingSeconds(secondsLeft);

        if (secondsLeft === 0) {
          clearInterval(timer);
          setGeneratedCode('');
          setCodeExpiration(null);
          setError('Reset code has expired. Please request a new code.');
          setStep(1);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [codeExpiration]);

  const generateResetCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const sendResetCodeEmail = async (email, code) => {
    try {
      const templateParams = {
        to_email: email,
        reset_code: code
      };

      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      );

      return response.status === 200;
    } catch (error) {
      console.error('Email sending error:', error);
      return false;
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (step === 1) {
      if (!formData.username.trim()) {
        errors.username = 'Username is required';
        isValid = false;
      }
      if (!formData.email.trim()) {
        errors.email = 'Email is required';
        isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Invalid email format';
        isValid = false;
      }
    } else if (step === 2) {
      if (!formData.resetCode.trim()) {
        errors.resetCode = 'Reset code is required';
        isValid = false;
      }
      if (!formData.newPassword) {
        errors.newPassword = 'New password is required';
        isValid = false;
      } else if (formData.newPassword.length < 8) {
        errors.newPassword = 'Password must be at least 8 characters';
        isValid = false;
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/.test(formData.newPassword)) {
        errors.newPassword = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
        isValid = false;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
        isValid = false;
      }
    }

    setIsFormValid(isValid);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'newPassword') {
      setPasswordStrength(checkPasswordStrength(value));
    }

    // Validate form after each change
    validateForm();
  };

  useEffect(() => {
    validateForm();
  }, [formData, validateForm]);

  const checkPasswordStrength = (password) => {
    if (password.length === 0) return '';
    if (password.length < 8) return 'Too Short';

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSymbols = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (hasUpperCase && hasLowerCase && hasNumbers && hasSymbols) {
      return 'Very Strong';
    } else if ((hasUpperCase && hasLowerCase && hasNumbers) || (hasUpperCase && hasLowerCase && hasSymbols)) {
      return 'Strong';
    } else if ((hasUpperCase && hasLowerCase) || (hasUpperCase && hasNumbers) || (hasLowerCase && hasNumbers)) {
      return 'Medium';
    } else {
      return 'Weak';
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleRequestCode = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    
    try {
      // Verify user exists
      const verifyResponse = await axios.post(`${API_URL}/api/auth/verify-user`, {
        username: formData.username,
        email: formData.email
      });

      if (!verifyResponse.data.user) {
        throw new Error('User not found or email does not match');
      }

      // Generate and send reset code
      const newCode = generateResetCode();
      setGeneratedCode(newCode);
      setCodeExpiration(Date.now() + 60 * 1000); // 60 seconds expiration

      const emailSent = await sendResetCodeEmail(formData.email, newCode);
      
      if (emailSent) {
        setSuccess('Reset code has been sent to your email. Code will expire in 60 seconds.');
        setTimeout(() => {
          setStep(2);
          setSuccess('');
        }, 2000);
      } else {
        throw new Error('Failed to send reset code email');
      }
    } catch (error) {
      console.error('Request code error:', error);
      setError(error.response?.data?.message || error.message || 'Failed to send reset code');
      setGeneratedCode('');
      setCodeExpiration(null);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    
    try {
      // Verify the reset code
      if (formData.resetCode !== generatedCode) {
        throw new Error('Invalid reset code');
      }

      // Update password in backend
      const response = await axios.post(`${API_URL}/api/auth/reset-password`, {
        username: formData.username,
        email: formData.email,
        newPassword: formData.newPassword
      });
      
      if (response.data.message) {
        setSuccess('Password reset successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        throw new Error('Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error.response || error);
      if (error.response?.status === 404) {
        setError('User not found or email does not match');
      } else {
        setError(error.response?.data?.message || error.message || 'Failed to reset password');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h1 className="reset-title">Reset Password</h1>
            <p className="reset-subtitle">Enter your username and email to receive a reset code</p>
            
            <form onSubmit={handleRequestCode} className="input-group">
              <div className="input-container">
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
                <FaUser className="input-icon" />
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
                <FaEnvelope className="input-icon" />
              </div>

              <button 
                type="submit" 
                className={`reset-button ${!isFormValid || loading ? 'disabled' : ''}`}
                disabled={!isFormValid || loading}
              >
                {loading ? 'Sending...' : 'Request Reset Code'}
              </button>
            </form>
          </>
        );

      case 2:
        return (
          <>
            <h1 className="reset-title">Enter Reset Code</h1>
            <p className="reset-subtitle">Enter the code sent to your email and your new password</p>
            
            <div className="countdown-timer">
              Time remaining: {remainingSeconds} seconds
            </div>
            
            <form onSubmit={handleResetPassword} className="input-group">
              <div className="input-container">
                <input
                  type="text"
                  name="resetCode"
                  placeholder="Enter reset code"
                  value={formData.resetCode}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-container">
                <input
                  type={showPassword.new ? 'text' : 'password'}
                  name="newPassword"
                  placeholder="New password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                />
                {showPassword.new ? (
                  <FaEyeSlash
                    className="input-icon clickable"
                    onClick={() => togglePasswordVisibility('new')}
                  />
                ) : (
                  <FaEye
                    className="input-icon clickable"
                    onClick={() => togglePasswordVisibility('new')}
                  />
                )}
              </div>

              {passwordStrength && (
                <div className={`password-strength ${passwordStrength.toLowerCase().replace(' ', '-')}`}>
                  Password Strength: {passwordStrength}
                </div>
              )}

              <div className="input-container">
                <input
                  type={showPassword.confirm ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                {showPassword.confirm ? (
                  <FaEyeSlash
                    className="input-icon clickable"
                    onClick={() => togglePasswordVisibility('confirm')}
                  />
                ) : (
                  <FaEye
                    className="input-icon clickable"
                    onClick={() => togglePasswordVisibility('confirm')}
                  />
                )}
              </div>

              <button 
                type="submit" 
                className={`reset-button ${!isFormValid || loading ? 'disabled' : ''}`}
                disabled={!isFormValid || loading}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="reset-container">
      <nav className="navbar">
        <Link to="/" className="logo">
          <img src={logo} alt="logo" />
        </Link>
        <div className="nav-links">
          <Link to="/about">About Us</Link>
          <Link to="/login">Sign In</Link>
          <Link to="/register">Sign Up</Link>
        </div>
      </nav>

      <main className="main-content">
        <div className="reset-card">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          {renderStep()}
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

export default ResetPassword;