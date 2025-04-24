import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ResetPassword.css';
import logo from '../../assets/logo.png';
import { FaEye, FaEyeSlash, FaUser, FaEnvelope } from 'react-icons/fa';
import axios from 'axios';
import emailjs from '@emailjs/browser';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Request Code, 2: Reset Password, 3: Success
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

  // EmailJS configuration
  const EMAILJS_SERVICE_ID = "service_ak50y3m";
  const EMAILJS_TEMPLATE_ID = "template_8xmspgr";
  const EMAILJS_PUBLIC_KEY = "udVeGDLa-4ZwbJE0q";

  useEffect(() => {
    // Initialize EmailJS with your public key
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }, []);

  useEffect(() => {
    // Check for code expiration
    if (codeExpiration && Date.now() > codeExpiration) {
      setGeneratedCode('');
      setCodeExpiration(null);
      if (step === 2) {
        setError('Reset code has expired. Please request a new code.');
        setStep(1);
      }
    }
  }, [codeExpiration, step]);

  const generateResetCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    // Set expiration to 1 minute from now
    setCodeExpiration(Date.now() + 60000); // 60000 ms = 1 minute
    return code;
  };

  const sendResetCodeEmail = async (email, code) => {
    const templateParams = {
      to_email: email,
      to_name: formData.username,
      reset_code: code,
      from_name: "MPASAT Online Admission"
    };

    try {
      const result = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      );
      return result.status === 200;
    } catch (error) {
      console.error("Failed to send email:", error);
      return false;
    }
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

  const validateForm = useCallback(() => {
    let isValid = true;
    const errors = {};

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
      } else if (formData.resetCode !== generatedCode) {
        errors.resetCode = 'Invalid reset code';
        isValid = false;
      } else if (Date.now() > codeExpiration) {
        errors.resetCode = 'Reset code has expired. Please request a new code.';
        isValid = false;
      }
      if (formData.newPassword.length < 8) {
        errors.password = 'Password must be at least 8 characters';
        isValid = false;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
        isValid = false;
      }
    }

    setError(Object.values(errors)[0] || '');
    setIsFormValid(isValid);
    return isValid;
  }, [formData, step, generatedCode, codeExpiration]);

  useEffect(() => {
    if (step === 2) {
      setPasswordStrength(checkPasswordStrength(formData.newPassword));
    }
    validateForm();
  }, [formData, step, validateForm]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
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
      // Generate a new reset code
      const newCode = generateResetCode();
      setGeneratedCode(newCode);

      // Send the reset code via email
      const emailSent = await sendResetCodeEmail(formData.email, newCode);
      
      if (emailSent) {
        setSuccess('Reset code has been sent to your email. Code will expire in 1 minute.');
        setTimeout(() => {
          setStep(2);
          setSuccess('');
        }, 2000);
      } else {
        throw new Error('Failed to send reset code email');
      }
    } catch (error) {
      setError(error.message || 'Failed to send reset code');
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

      // Log the data being sent
      console.log('Sending reset request with data:', {
        username: formData.username,
        email: formData.email,
        newPassword: formData.newPassword
      });

      // Update password in backend
      const response = await axios.post('http://localhost:5000/api/auth/reset-password', {
        username: formData.username,
        email: formData.email,
        newPassword: formData.newPassword
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Reset password response:', response.data);
      
      setSuccess('Password reset successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
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

  const handleLogin = () => {
    navigate('/login');
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h1 className="reset-title">Password forgotten</h1>
            <p className="reset-subtitle">Fill inputs to request for a password request code</p>
            
            <form onSubmit={handleRequestCode} className="input-group">
              <div className="input-container">
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
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
                />
                <FaEnvelope className="input-icon" />
              </div>

              <button 
                type="submit" 
                className={`reset-button ${!isFormValid || loading ? 'disabled' : ''}`}
                disabled={!isFormValid || loading}
              >
                Request Reset Code
              </button>
            </form>
          </>
        );

      case 2:
        return (
          <>
            <h1 className="reset-title">Password forgotten</h1>
            <p className="reset-subtitle">Fill in the inputs to reset your password</p>
            {codeExpiration && (
              <p className="code-expiration">
                Code expires in: {Math.max(0, Math.floor((codeExpiration - Date.now()) / 1000))} seconds
              </p>
            )}
            <form onSubmit={handleResetPassword} className="input-group">
              <div className="input-container">
                <input
                  type="text"
                  name="resetCode"
                  placeholder="Enter reset code"
                  value={formData.resetCode}
                  onChange={handleChange}
                />
              </div>

              <div className="input-container">
                <input
                  type={showPassword.new ? 'text' : 'password'}
                  name="newPassword"
                  placeholder="New password"
                  value={formData.newPassword}
                  onChange={handleChange}
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

              {formData.newPassword && (
                <div className="password-strength" style={{ color: getPasswordStrengthColor() }}>
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
                Password reset
              </button>
            </form>
          </>
        );

      case 3:
        return (
          <>
            <h1 className="reset-title">Reset Complete</h1>
            <p className="reset-subtitle">Password reset complete</p>
            
            <button 
              onClick={handleLogin}
              className="reset-button"
            >
              Login
            </button>
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
    </div>
  );
};

export default ResetPassword; 