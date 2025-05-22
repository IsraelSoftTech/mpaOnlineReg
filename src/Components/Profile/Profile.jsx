import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  IoPersonOutline,
  IoMailOutline,
  IoLockClosedOutline
} from 'react-icons/io5';
import { AdmissionContext } from '../AdmissionContext';
import '../UserAdmission/UserAdmission.css';
import './Profile.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { database } from '../../firebase';
import { ref, update } from 'firebase/database';
import UserNav from '../Shared/UserNav';

const Profile = () => {
  const { currentUser, currentUserData } = useContext(AdmissionContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      toast.error('Please log in to continue');
      navigate('/login');
      return;
    }

    if (currentUserData) {
      setFormData({
        fullName: currentUserData.fullName || '',
        username: currentUserData.username || currentUser || '',
        email: currentUserData.email || '',
        password: currentUserData.password || ''
      });
    }
  }, [currentUserData, currentUser, navigate]);

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
        password: currentUserData.password || ''
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
      setSuccessMessage('Profile updated successfully');
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentUser || !currentUserData) {
    return null;
  }

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
      <UserNav />
      <main className="userad-main">
        <div className="profile-wrapper">
          <div className="profile-container">
            <h2 className="profile-title">Your Profile</h2>
            {successMessage && (
              <div className="profile-success-message">
                {successMessage}
              </div>
            )}
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label htmlFor="fullName">
                  <IoPersonOutline className="form-icon" /> Full Name
                </label>
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
                <label htmlFor="username">
                  <IoPersonOutline className="form-icon" /> Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">
                  <IoMailOutline className="form-icon" /> Email
                </label>
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
                <label htmlFor="password">
                  <IoLockClosedOutline className="form-icon" /> Password
                </label>
                <input
                  type="text"
                  id="password"
                  name="password"
                  value={formData.password}
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
                      {isSaving ? 'Saving...' : 'Update Profile'}
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
    </div>
  );
};

export default Profile; 