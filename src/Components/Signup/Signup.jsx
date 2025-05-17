import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Signup.css';
import { AdmissionContext } from '../AdmissionContext';
import logo from '../../assets/logo.png';

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addAccount } = useContext(AdmissionContext);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const fullName = e.target.elements.fullName.value.trim();
      const username = e.target.elements.username.value.trim();
      const email = e.target.elements.email.value.trim();
      const phone = e.target.elements.phone.value.trim();
      const password = e.target.elements.password.value;
      const confirmPassword = e.target.elements.confirmPassword.value;

      // Validation
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }

      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        setError('Username can only contain letters, numbers, and underscores');
        return;
      }

      const account = {
        fullName,
        username,
        email,
        phone,
        password,
        timestamp: new Date().toISOString(),
        role: 'user'  // Default role for new accounts
      };

      const success = await addAccount(account);
      if (success) {
        setSuccessMessage('Account created successfully!');
        // Clear form
        e.target.reset();
        setTimeout(() => {
          setSuccessMessage('');
          navigate('/signin');
        }, 3000);
      }
    } catch (err) {
      console.error('Error during signup:', err);
      setError('Error creating account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearField = (fieldName) => {
    const input = document.querySelector(`input[name="${fieldName}"]`);
    if (input) input.value = '';
  };

  return (
    <div className="page-wrapper">
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
      <main className="signup-main">
        <div className="signup-box">
          <h2 className="signup-title">Sign up <span className="underline"></span></h2>
          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}
          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="signup-form-group">
              <span className="signup-icon signup-user-icon" aria-hidden="true"></span>
              <input 
                type="text" 
                name="fullName" 
                placeholder="Full names" 
                required 
                minLength="2"
                maxLength="50"
                className="signup-input"
              />
              <span className="signup-icon signup-action-icon" onClick={() => clearField('fullName')} title="Clear field">×</span>
            </div>
            <div className="signup-form-group">
              <span className="signup-icon signup-user-icon" aria-hidden="true"></span>
              <input 
                type="text" 
                name="username" 
                placeholder="Username" 
                required 
                minLength="3"
                maxLength="20"
                pattern="[a-zA-Z0-9_]+"
                title="Username can only contain letters, numbers, and underscores"
                className="signup-input"
              />
              <span className="signup-icon signup-action-icon" onClick={() => clearField('username')} title="Clear field">×</span>
            </div>
            <div className="signup-form-group">
              <span className="signup-icon signup-email-icon" aria-hidden="true"></span>
              <input 
                type="email" 
                name="email" 
                placeholder="Email" 
                required 
                pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                className="signup-input"
              />
              <span className="signup-icon signup-action-icon" onClick={() => clearField('email')} title="Clear field">×</span>
            </div>
            <div className="signup-form-group signup-phone-group">
              <select className="signup-country-code" defaultValue="+237">
                <option value="+237">+237</option>
              </select>
              <input 
                type="text" 
                name="phone" 
                placeholder="123 456 789" 
                required 
                pattern="[0-9]{9}"
                title="Please enter a valid 9-digit phone number"
                className="signup-input"
              />
              <span className="signup-icon signup-action-icon" onClick={() => clearField('phone')} title="Clear field">×</span>
            </div>
            <div className="signup-form-group">
              <span className="signup-icon signup-lock-icon" aria-hidden="true"></span>
              <input 
                type={showPassword ? 'text' : 'password'} 
                name="password" 
                placeholder="Password" 
                required 
                minLength="6"
                className="signup-input"
              />
              <span className="signup-icon signup-action-icon" onClick={() => setShowPassword(!showPassword)} title={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </span>
              <span className="signup-icon signup-action-icon" onClick={() => clearField('password')} title="Clear field">×</span>
            </div>
            <div className="signup-form-group">
              <span className="signup-icon signup-lock-icon" aria-hidden="true"></span>
              <input 
                type={showConfirmPassword ? 'text' : 'password'} 
                name="confirmPassword" 
                placeholder="Confirm Password" 
                required 
                minLength="6"
                className="signup-input"
              />
              <span className="signup-icon signup-action-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)} title={showConfirmPassword ? 'Hide password' : 'Show password'}>
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </span>
              <span className="signup-icon signup-action-icon" onClick={() => clearField('confirmPassword')} title="Clear field">×</span>
            </div>
            <button 
              type="submit" 
              className="signup-button" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
          <p className="signin-link">
            Already have an account? <Link to="/signin"><b>Sign In</b></Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Signup; 