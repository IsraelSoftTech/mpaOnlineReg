import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RiMenu3Line, RiCloseFill } from 'react-icons/ri';
import { AdmissionContext } from '../AdmissionContext';
import '../UserAdmission/UserAdmission.css';
import './Profile.css';
import logo from '../../assets/logo.png';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { database } from '../../firebase';
import { ref, update } from 'firebase/database';

const Profile = () => {
  const { currentUser, currentUserData, updateProfile, logout } = useContext(AdmissionContext);
  const [isEditing, setIsEditing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    address: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
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
      toast.error('Please log in to continue');
      navigate('/login');
      return;
    }

    if (currentUserData) {
      console.log('Setting form data with:', currentUserData);
      setFormData({
        fullName: currentUserData.fullName || '',
        username: currentUserData.username || currentUser || '',
        email: currentUserData.email || '',
        phone: currentUserData.phone || '',
        password: currentUserData.password || '',
        address: currentUserData.address || ''
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
        password: currentUserData.password || '',
        address: currentUserData.address || ''
      });
    }
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const userRef = ref(database, `users/${currentUser}`);
      await update(userRef, formData);
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentUser || !currentUserData) {
    console.log('Rendering null - currentUser:', currentUser, 'currentUserData:', currentUserData);
    return null;
  }

  console.log('Rendering profile with data:', formData);

  return (
    <div className="userad-wrapper">
      <ToastContainer 
        position="top-right" 
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <header className="app-header">
        <div className="logo-section">
          <img src={logo} alt="logo" className="app-logo" />
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
      <main className="userad-main">
        <div className="profile-wrapper">
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
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="address">Address</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                />
              </div>
              <div className="profile-actions">
                {!isEditing ? (
                  <button
                    type="button"
                    className="edit-btn"
                    onClick={handleEdit}
                  >
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      type="submit"
                      className="save-btn"
                      disabled={isSaving}
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={handleCancel}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </form>
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