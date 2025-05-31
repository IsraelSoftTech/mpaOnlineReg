import React, { useState, useContext, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { RiMenu3Line, RiCloseFill } from 'react-icons/ri';
import './Signin.css';
import { AdmissionContext } from '../AdmissionContext';
import logo from '../../assets/logo.png';

const Signin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, setCurrentUser, setCurrentPassword, setCurrentUserData } = useContext(AdmissionContext);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const username = e.target.elements.username.value.trim();
      const password = e.target.elements.password.value;

      // Quick admin check first (no database query needed)
      if (username === 'admin_account' && password === 'admin_password') {
        setCurrentUser('admin_account');
        setCurrentPassword('admin_password');
        setCurrentUserData({ username: 'admin_account', role: 'admin' });
        setIsLoading(false);
        navigate('/admin');
        return;
      }

      // For regular users, check against accounts database
      const success = await login(username, password);
      if (success) {
        navigate('/usertrack');
      } else {
        setError('Invalid username or password');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login. Please try again.');
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
        <button
          ref={buttonRef}
          className="menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <RiCloseFill size={24} /> : <RiMenu3Line size={24} />}
        </button>
        <nav ref={menuRef} className={`app-nav ${isMenuOpen ? 'nav-open' : ''}`}>
          <Link to="/about" className={`app-nav-link${location.pathname === '/about' ? ' active' : ''}`}>About Us</Link>
          <Link to="/signup" className={`app-nav-link${location.pathname === '/signup' ? ' active' : ''}`}>Sign Up</Link>
          <Link to="/signin" className={`app-nav-link${location.pathname === '/signin' ? ' active' : ''}`}>Sign In</Link>
        </nav>
      </header>
      <main className="signin-main-wrapper">
        <div className="signin-content-container">
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
                disabled={isLoading}
                autoComplete="username"
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
                disabled={isLoading}
                autoComplete="current-password"
              />
              <span 
                className="signin-icon signin-action-icon" 
                onClick={() => !isLoading && setShowPassword(!showPassword)} 
                title={showPassword ? 'Hide password' : 'Show password'}
                style={{ cursor: isLoading ? 'default' : 'pointer' }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </span>
              <span className="signin-icon signin-action-icon" onClick={() => clearField('password')} title="Clear field">×</span>
            </div>
            <button 
              type="submit" 
              className={`signin-button${isLoading ? ' loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="signin-register-link">
            Don't have an account? <Link to="/signup"><b>Sign up</b></Link>
          </p>
        </div>
        </div>
      </main>
    </div>
  );
};

export default Signin; 