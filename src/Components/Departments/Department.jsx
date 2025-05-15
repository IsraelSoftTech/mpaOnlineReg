import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RiMenu3Line, RiCloseFill, RiEdit2Line, RiDeleteBin6Line, RiAddLine } from 'react-icons/ri';
import { ref, push, onValue, remove, update } from 'firebase/database';
import { database } from '../../firebase';
import './Department.css';
import logo from '../../assets/logo.png';

const Department = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    images: []
  });
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRefs = [useRef(), useRef(), useRef(), useRef()];
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch departments from database
  useEffect(() => {
    const departmentsRef = ref(database, 'departments');
    const unsubscribe = onValue(departmentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const departmentsList = Object.entries(data).map(([id, dept]) => ({
          id,
          ...dept
        }));
        setDepartments(departmentsList);
      } else {
        setDepartments([]);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleMenu = () => setIsMenuOpen((open) => !open);

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

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImages = [...formData.images];
        newImages[index] = reader.result;
        setFormData(prev => ({
          ...prev,
          images: newImages
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (formData.images.length !== 4) {
      newErrors.images = 'All 4 images are required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (editingDepartment) {
        // Update existing department
        const departmentRef = ref(database, `departments/${editingDepartment.id}`);
        await update(departmentRef, {
          title: formData.title.trim(),
          desc: formData.description.trim(),
          images: formData.images,
          lastUpdated: new Date().toISOString()
        });
        setSuccessMessage('Department updated successfully!');
      } else {
        // Create new department
        const departmentsRef = ref(database, 'departments');
        await push(departmentsRef, {
          title: formData.title.trim(),
          desc: formData.description.trim(),
          images: formData.images,
          timestamp: new Date().toISOString()
        });
        setSuccessMessage('Department created successfully!');
      }
      
      // Reset form
      resetForm();
      
      // Close modal after delay
      setTimeout(() => {
        setShowAdd(false);
        setSuccessMessage('');
        setEditingDepartment(null);
      }, 2000);
    } catch (error) {
      console.error('Error saving department:', error);
      setErrors({ submit: 'Error saving department. Please try again.' });
    }
  };

  const handleDelete = async (departmentId) => {
    if (window.confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      try {
        const departmentRef = ref(database, `departments/${departmentId}`);
        await remove(departmentRef);
        setSuccessMessage('Department deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 2000);
      } catch (error) {
        console.error('Error deleting department:', error);
        alert('Error deleting department. Please try again.');
      }
    }
  };

  const handleEdit = (department) => {
    setEditingDepartment(department);
    setFormData({
      title: department.title,
      description: department.desc,
      images: department.images
    });
    setShowAdd(true);
    setErrors({});
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      images: []
    });
    setErrors({});
    setSuccessMessage('');
    setEditingDepartment(null);
  };

  if (isLoading) {
    return (
      <div className="admin-wrapper">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading departments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-wrapper">
      <header className="app-header">
        <div className="logo-section">
          <img src={logo} alt="" className="app-logo" />
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
          <button 
            className={`app-nav-link${location.pathname === '/admin' ? ' active' : ''}`}
            onClick={() => navigate('/admin')}
          >
            Overview
          </button>
          <button 
            className={`app-nav-link${location.pathname === '/adminpay' ? ' active' : ''}`}
            onClick={() => navigate('/adminpay')}
          >
            Payments
          </button>
          <button 
            className={`app-nav-link${location.pathname === '/departments' ? ' active' : ''}`}
            onClick={() => navigate('/departments')}
          >
            Create Departments
          </button>
          <button 
            className={`app-nav-link${location.pathname === '/classes' ? ' active' : ''}`}
            onClick={() => navigate('/classes')}
          >
            Classes
          </button>
          <button 
            className={`app-nav-link${location.pathname === '/idcards' ? ' active' : ''}`}
            onClick={() => navigate('/idcards')}
          >
            ID Cards
          </button>
          <button 
            className={`app-nav-link${location.pathname === '/adminAdmission' ? ' active' : ''}`}
            onClick={() => navigate('/adminAdmission')}
          >
            Admission
          </button>
          <button 
            className={`app-nav-link${location.pathname === '/admincontact' ? ' active' : ''}`}
            onClick={() => navigate('/admincontact')}
          >
            Contact
          </button>
          <button className="app-nav-link logout" onClick={() => navigate('/signin')}>Log out</button>
        </nav>
      </header>
      <main className="admin-main">
        <h2 className="admin-overview-title">Departments</h2>
        {successMessage && (
          <div className="success-message floating">{successMessage}</div>
        )}
        <div className="departments-list">
          {departments.map((dept) => (
            <div className="department-card" key={dept.id}>
              <div className="department-header">
                <span className="department-title">{dept.title}</span>
                <span className="department-actions">
                  <RiEdit2Line 
                    className="department-action-icon edit" 
                    title="Edit"
                    onClick={() => handleEdit(dept)}
                  />
                  <RiDeleteBin6Line 
                    className="department-action-icon delete" 
                    title="Delete"
                    onClick={() => handleDelete(dept.id)}
                  />
                </span>
              </div>
              <div className="department-desc">{dept.desc}</div>
              <div className="department-images">
                {dept.images.map((img, i) => (
                  <img src={img} alt={dept.title + ' ' + (i+1)} key={i} className="department-img" />
                ))}
              </div>
            </div>
          ))}
          <div className="department-card add-card" onClick={() => setShowAdd(true)}>
            <div className="add-icon"><RiAddLine size={32} /></div>
            <div className="add-label">Add Department</div>
          </div>
        </div>
        {showAdd && (
          <div className="add-department-form-wrapper">
            <div className="add-department-form">
              <h3>{editingDepartment ? 'Edit Department' : 'Create Department'}</h3>
              {successMessage && (
                <div className="success-message">{successMessage}</div>
              )}
              {errors.submit && (
                <div className="error-message">{errors.submit}</div>
              )}
              <input
                type="text"
                placeholder="Title"
                className={`add-input ${errors.title ? 'error' : ''}`}
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
              {errors.title && <div className="error-text">{errors.title}</div>}
              
              <textarea
                placeholder="Description"
                className={`add-input ${errors.description ? 'error' : ''}`}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
              {errors.description && <div className="error-text">{errors.description}</div>}
              
              <div className="add-images-row">
                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className={`add-image-slot ${errors.images ? 'error' : ''}`}
                    onClick={() => fileInputRefs[index].current.click()}
                  >
                    {formData.images[index] ? (
                      <img
                        src={formData.images[index]}
                        alt={`Selected ${index + 1}`}
                        className="preview-image"
                      />
                    ) : (
                      <span>Image {index + 1}</span>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRefs[index]}
                      onChange={(e) => handleImageChange(e, index)}
                      style={{ display: 'none' }}
                    />
                  </div>
                ))}
              </div>
              {errors.images && <div className="error-text">{errors.images}</div>}
              
              <button className="create-btn" onClick={handleSubmit}>
                {editingDepartment ? 'Update' : 'Create'}
              </button>
              <button className="cancel-btn" onClick={resetForm}>Cancel</button>
            </div>
          </div>
        )}
      </main>
      <footer className="footer">
        <div className="footer-logo">ONLINE ADMISSION</div>
        <div className="footer-center">MPASAT, All Rights Reserved - 2025</div>
        <div className="footer-socials">
          <span>Follow us on:</span>
          <span className="icon social-icon instagram"></span>
          <span className="icon social-icon facebook"></span>
          <span className="icon social-icon tiktok"></span>
          <span className="icon social-icon twitter"></span>
        </div>
      </footer>
    </div>
  );
};

export default Department; 