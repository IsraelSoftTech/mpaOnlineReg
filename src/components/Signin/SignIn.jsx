import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './SignIn.css';
import logo from '../../assets/logo.png';
import { FaFacebookF, FaInstagram, FaYoutube, FaTiktok, FaUser, FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';

const SignIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/signin', formData);
      
      // Store token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      if (rememberMe) {
        localStorage.setItem('rememberedUser', formData.username);
      } else {
        localStorage.removeItem('rememberedUser');
      }
      
      // Redirect to user dashboard
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-container">
      <nav className="navbar">
        <Link to="/" className="logo">
          <img src={logo} alt="logo" />
        </Link>
        <div className="nav-links">
          <Link to="/about">About Us</Link>
          <Link to="/login" className="active">Sign In</Link>
          <Link to="/register">Sign Up</Link>
        </div>
      </nav>

      <main className="main-content">
        <div className="login-card">
          <h1 className="login-title">Sign In</h1>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit} className="input-group">
            <div className="input-container">
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
              />
              <span className="input-icon"><FaUser/></span>
            </div>
            
            <div className="input-container">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <span 
                className="input-icon clickable" 
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <FaEyeSlash/> : <FaEye/>}
              </span>
            </div>

            <div className="form-options">
              <div className="remember-me">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember">Remember me next time</label>
              </div>
              <div className="forgot-password">
                <span>Password forgotten? </span>
                <Link to="/reset">Reset</Link>
              </div>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="signup-prompt">
            <span>Don't have an account? </span>
            <Link to="/register">Sign up</Link>
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

export default SignIn; 