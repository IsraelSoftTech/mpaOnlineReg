import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RiMenu3Line, RiCloseFill, RiEdit2Line, RiDeleteBin6Line, RiAddLine, RiCloseLine } from 'react-icons/ri';
import { ref, push, onValue, remove, update, off } from 'firebase/database';
import { database } from '../../firebase';
import './Department.css';
import AdminNav from '../Admin/AdminNav';

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
  const fileInputRefs = [useRef(), useRef(), useRef(), useRef()];
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Optimized real-time departments fetch
  useEffect(() => {
    const departmentsRef = ref(database, 'departments');
    
    // Set up immediate data fetch
    const fetchDepartments = (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const departmentsList = Object.entries(data)
          .map(([id, dept]) => ({
            id,
            ...dept
          }))
          .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
        setDepartments(departmentsList);
      } else {
        setDepartments([]);
      }
    };

    // Initial fetch
    onValue(departmentsRef, fetchDepartments, {
      onlyOnce: false
    });

    return () => {
      // Clean up listener
      off(departmentsRef);
    };
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

  return (
    <div className="admin-wrapper">
      <AdminNav />
      <main className="department-main">
        <div className="admin-content">
          <h2 className="admin-title">Departments Management</h2>
          
          <div className="vocational-section">
            {departments.map((dept) => (
              <div className="vocational-card" key={dept.id}>
                <div className="department-header">
                  <h3 className="voc-title">{dept.title}</h3>
                  <div className="department-actions">
                    <button 
                      className="department-edit-btn" 
                      title="Edit"
                      onClick={() => handleEdit(dept)}
                    >
                      <RiEdit2Line size={20} />
                    </button>
                    <button 
                      className="department-delete-btn" 
                      title="Delete"
                      onClick={() => handleDelete(dept.id)}
                    >
                      <RiDeleteBin6Line size={20} />
                    </button>
                  </div>
                </div>
                <div className="voc-desc">{dept.desc}</div>
                <div className="voc-images-grid-2x2">
                  {dept.images.map((img, i) => (
                    <img src={img} alt={dept.title + ' ' + (i+1)} key={i} className="voc-img-2x2" />
                  ))}
                </div>
              </div>
            ))}
            
            <div className="vocational-card add-card" onClick={() => setShowAdd(true)}>
              <div className="add-department-placeholder">
                <RiAddLine size={40} />
                <span>Add Department</span>
              </div>
            </div>
          </div>

          {showAdd && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>{editingDepartment ? 'Edit Department' : 'Create Department'}</h3>
                  <button 
                    className="modal-close" 
                    onClick={() => {
                      setShowAdd(false);
                      resetForm();
                    }}
                    aria-label="Close modal"
                  >
                    <RiCloseLine size={24} />
                  </button>
                </div>

                {successMessage && (
                  <div className="success-message">{successMessage}</div>
                )}
                {errors.submit && (
                  <div className="error-message">{errors.submit}</div>
                )}

                <div className="modal-body">
                  <div className="form-group">
                    <label htmlFor="title">Department Title</label>
                    <input
                      id="title"
                      type="text"
                      placeholder="Enter department title"
                      className={`form-input ${errors.title ? 'error' : ''}`}
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    />
                    {errors.title && <div className="error-text">{errors.title}</div>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      placeholder="Enter department description"
                      className={`form-input ${errors.description ? 'error' : ''}`}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows="4"
                    />
                    {errors.description && <div className="error-text">{errors.description}</div>}
                  </div>

                  <div className="form-group">
                    <label>Department Images</label>
                    <div className="image-grid">
                      {[0, 1, 2, 3].map((index) => (
                        <div
                          key={index}
                          className={`image-upload-box ${errors.images ? 'error' : ''}`}
                          onClick={() => fileInputRefs[index].current.click()}
                        >
                          {formData.images[index] ? (
                            <img
                              src={formData.images[index]}
                              alt={`Selected ${index + 1}`}
                              className="preview-image"
                            />
                          ) : (
                            <div className="upload-placeholder">
                              <span>Click to Upload</span>
                              <span className="upload-number">Image {index + 1}</span>
                            </div>
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
                  </div>
                </div>

                <div className="modal-footer">
                  <button className="btn-secondary" onClick={() => {
                    setShowAdd(false);
                    resetForm();
                  }}>
                    Cancel
                  </button>
                  <button className="btn-primary" onClick={handleSubmit}>
                    {editingDepartment ? 'Update Department' : 'Create Department'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Department; 