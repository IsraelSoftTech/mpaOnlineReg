import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Signin.css';
import { AdmissionContext } from '../AdmissionContext';
import logo from '../../assets/logo.png';

const Signin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AdmissionContext);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const username = e.target.elements.username.value.trim();
      const password = e.target.elements.password.value;

      // Check for admin login first
      if (username === 'admin_account' && password === 'admin_password') {
        navigate('/admin');
        return;
      }

      // For regular users, check against accounts database
      const success = await login(username, password);
      if (success) {
        navigate('/userAdmission');
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearField = (fieldName) => {
    const input = document.querySelector(`input[name="${fieldName}"]`);
    if (input) {
      input.value = '';
      setError(''); // Clear error when user starts typing again
    }
  };

  return (
    <div className="signin-page-wrapper">
      <header className="app-header">
        <div className="logo-section">
          <img src={logo} alt="" className="app-logo" />
          <span className="app-brand">MPASAT</span>
        </div>
        <nav className="app-nav">
          <Link to="/about" className={`app-nav-link${location.pathname === '/about' ? ' active' : ''}`}>About Us</Link>
          <Link to="/signup" className={`app-nav-link${location.pathname === '/signup' ? ' active' : ''}`}>Sign Up</Link>
          <Link to="/signin" className={`app-nav-link${location.pathname === '/signin' ? ' active' : ''}`}>Sign In</Link>
        </nav>
      </header>
      <main className="signin-main-content">
        <div className="signin-box">
          <h2 className="signin-title">Sign In <span className="underline"></span></h2>
          {error && <div className="error-message">{error}</div>}
          <form className="signin-form" onSubmit={handleSubmit}>
            <div className="signin-form-group">
              <span className="signin-icon signin-user-icon" aria-hidden="true"></span>
              <input 
                type="text" 
                name="username" 
                placeholder="Username" 
                required 
                minLength="3"
                maxLength="20"
                pattern="[a-zA-Z0-9_]+"
                title="Username can only contain letters, numbers, and underscores"
                onChange={() => error && setError('')}
                className="signin-input"
              />
              <span className="signin-icon signin-action-icon" onClick={() => clearField('username')} title="Clear field">×</span>
            </div>
            <div className="signin-form-group">
              <span className="signin-icon signin-lock-icon" aria-hidden="true"></span>
              <input 
                type={showPassword ? 'text' : 'password'} 
                name="password" 
                placeholder="Password" 
                required 
                minLength="6"
                onChange={() => error && setError('')}
                className="signin-input"
              />
              <span 
                className="signin-icon signin-action-icon" 
                onClick={() => setShowPassword(!showPassword)} 
                title={showPassword ? 'Hide password' : 'Show password'}
                style={{ cursor: 'pointer' }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </span>
              <span className="signin-icon signin-action-icon" onClick={() => clearField('password')} title="Clear field">×</span>
            </div>
            <div className="signin-links-row">
              <span className="signin-forgot-link">Forgot password?<b>Reset</b></span>
            </div>
            <div className="signin-remember-row">
              <input type="checkbox" id="remember" className="signin-checkbox" />
              <label htmlFor="remember" className="signin-checkbox-label">Remember me next time</label>
            </div>
            <button 
              type="submit" 
              className="signin-button"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="signin-register-link">
            Don't have an account? <Link to="/signup"><b>Sign up</b></Link>
          </p>
        </div>
      </main>
      <footer className="app-footer">
        <div className="footer-logo">MPASAT ADMISSION PORTAL</div>
        <div className="footer-center">MPASAT, All Rights Reserved - 2025</div>
        <div className="footer-socials">
          <span>Follow us on:</span>
          <span className="social-icon instagram"></span>
          <span className="social-icon facebook"></span>
          <span className="social-icon tiktok"></span>
          <span className="social-icon twitter"></span>
        </div>
      </footer>
    </div>
  );
};

export default Signin; 