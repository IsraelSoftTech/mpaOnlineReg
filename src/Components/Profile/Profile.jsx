import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  IoPersonOutline,
  IoMailOutline,
  IoLockClosedOutline,
  IoPencilOutline,
  IoCheckmarkOutline,
  IoCloseOutline
} from 'react-icons/io5';
import { AdmissionContext } from '../AdmissionContext';
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
  const [originalData, setOriginalData] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      toast.error('Please log in to continue');
      navigate('/login');
      return;
    }

    if (currentUserData) {
      const initialData = {
        fullName: currentUserData.fullName || '',
        username: currentUserData.username || currentUser || '',
        email: currentUserData.email || '',
        password: currentUserData.password || ''
      };
      setFormData(initialData);
      setOriginalData(initialData);
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
    setFormData(originalData);
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const userRef = ref(database, `users/${currentUser}`);
      await update(userRef, formData);
      setOriginalData(formData);
      setSuccessMessage('Profile updated successfully');
      setIsEditing(false);
      
      toast.success('Profile updated successfully', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
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
    <div className="profile-page">
      <ToastContainer />
      <UserNav />
      <main className="profile-main">
        <div className="profile-container">
          <div className="profile-header">
            <h2 className="profile-title">Profile Information</h2>
           
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="fullName">
                <IoPersonOutline className="form-icon" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={isEditing ? 'editing' : ''}
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="username">
                <IoPersonOutline className="form-icon" />
                <span>Username</span>
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={isEditing ? 'editing' : ''}
                placeholder="Enter your username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">
                <IoMailOutline className="form-icon" />
                <span>Email</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={isEditing ? 'editing' : ''}
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <IoLockClosedOutline className="form-icon" />
                <span>Password</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={isEditing ? 'editing' : ''}
                placeholder="Enter your password"
              />
            </div>

            <div className="profile-actions">
              {!isEditing ? (
                <button
                  type="button"
                  className="edit-btn"
                  onClick={handleEdit}
                >
                  <IoPencilOutline />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="edit-actions">
                  <button
                    type="submit"
                    className="save-btn"
                    disabled={isSaving}
                  >
                    <IoCheckmarkOutline />
                    <span>{isSaving ? 'Saving...' : 'Update Profile'}</span>
                  </button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={handleCancel}
                  >
                    <IoCloseOutline />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Profile; 