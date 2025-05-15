import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RiMenu3Line, RiCloseFill } from 'react-icons/ri';
import { AdmissionContext } from '../AdmissionContext';
import '../UserAdmission/UserAdmission.css';
import './Profile.css';

const Profile = () => {
  const { currentUser, currentUserData, updateProfile, logout } = useContext(AdmissionContext);
  const [isEditing, setIsEditing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    password: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('Profile component mounted');
    console.log('Current user:', currentUser);
    console.log('Current user data:', currentUserData);

    if (!currentUser) {
      console.log('No user found, redirecting to signin');
      navigate('/signin');
      return;
    }

    if (currentUserData) {
      console.log('Setting form data with:', currentUserData);
      setFormData({
        fullName: currentUserData.fullName || '',
        username: currentUserData.username || currentUser || '',
        email: currentUserData.email || '',
        phone: currentUserData.phone || '',
        password: currentUserData.password || ''
      });
    } else {
      console.log('No user data available');
    }
  }, [currentUserData, currentUser, navigate]);

  const toggleMenu = () => setIsMenuOpen((open) => !open);

  const handleLogout = () => {
    logout();
    navigate('/about');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (currentUserData) {
      setFormData({
        fullName: currentUserData.fullName || '',
        username: currentUserData.username || currentUser || '',
        email: currentUserData.email || '',
        phone: currentUserData.phone || '',
        password: currentUserData.password || ''
      });
    }
    setIsEditing(false);
  };

  const handleSubmit = async () => {
    if (currentUserData?.id) {
      const success = await updateProfile(currentUserData.id, formData);
      if (success) {
        setSuccessMessage('Profile updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        setIsEditing(false);
      }
    }
  };

  if (!currentUser || !currentUserData) {
    console.log('Rendering null - currentUser:', currentUser, 'currentUserData:', currentUserData);
    return null;
  }

  console.log('Rendering profile with data:', formData);

  return (
    <div className="profile-wrapper">
      <header className="app-header">
        <div className="logo-section">
          <img src="/logo192.png" alt="logo" className="app-logo" />
          <span className="app-brand">MPASAT</span>
        </div>
        <button
          ref={buttonRef}
          className="menu-toggle"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <RiCloseFill size={24} /> : <RiMenu3Line size={24} />}
        </button>
        <nav ref={menuRef} className={`app-nav ${isMenuOpen ? 'nav-open' : ''}`}>
          <button className={`app-nav-link${location.pathname === '/about' ? ' active' : ''}`} onClick={() => navigate('/about')}>About</button>
          <button className={`app-nav-link${location.pathname === '/userAdmission' ? ' active' : ''}`} onClick={() => navigate('/userAdmission')}>Admission</button>
          <button className={`app-nav-link${location.pathname === '/usertrack' ? ' active' : ''}`} onClick={() => navigate('/usertrack')}>Check Status</button>
          <button className={`app-nav-link${location.pathname === '/contact' ? ' active' : ''}`} onClick={() => navigate('/contact')}>Contact</button>
          <button className={`app-nav-link${location.pathname === '/profile' ? ' active' : ''}`} onClick={() => navigate('/profile')}>Profile</button>
          <button className="app-nav-link logout" onClick={handleLogout}>Logout</button>
        </nav>
      </header>
      <main className="profile-main">
        <div className="profile-container">
          <h2 className="profile-title">Your Profile</h2>
          {successMessage && (
            <div className="profile-success-message" style={{
              background: 'white',
              padding: '10px 20px',
              borderRadius: '4px',
              color: '#2e7d32',
              textAlign: 'center',
              marginBottom: '20px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              {successMessage}
            </div>
          )}
          <div className="profile-form">
            <div className="profile-form-group">
              <label className="profile-label">Full Name</label>
              <div className="profile-input-group">
                <span className="profile-icon profile-user-icon"></span>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="profile-input"
                  placeholder="Enter your full name"
                />
              </div>
            </div>
            <div className="profile-form-group">
              <label className="profile-label">Username</label>
              <div className="profile-input-group">
                <span className="profile-icon profile-user-icon"></span>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="profile-input"
                  placeholder="Enter username"
                />
              </div>
            </div>
            <div className="profile-form-group">
              <label className="profile-label">Email</label>
              <div className="profile-input-group">
                <span className="profile-icon profile-email-icon"></span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="profile-input"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            <div className="profile-form-group">
              <label className="profile-label">Phone</label>
              <div className="profile-input-group profile-phone-group">
                <select className="profile-country-code" disabled={!isEditing}>
                  <option value="+237">+237</option>
                </select>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="profile-input"
                  placeholder="Enter phone number"
                />
              </div>
            </div>
            <div className="profile-form-group">
              <label className="profile-label">Password</label>
              <div className="profile-input-group">
                <span className="profile-icon profile-lock-icon"></span>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="profile-input"
                  placeholder="Enter password"
                />
              </div>
            </div>
            <div className="profile-actions">
              {!isEditing ? (
                <button className="edit-button" onClick={handleEdit}>
                  Edit Profile
                </button>
              ) : (
                <>
                  <button className="save-button" onClick={handleSubmit}>
                    Save Changes
                  </button>
                  <button className="cancel-button" onClick={handleCancel}>
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
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

export default Profile; 