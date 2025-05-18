import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RiMenu3Line, RiCloseFill } from 'react-icons/ri';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { ref, onValue } from 'firebase/database';
import { database } from '../../firebase';
import './CreateClass.css';
import { AdmissionContext } from '../AdmissionContext';
import logo from '../../assets/logo.png';

const CreateClass = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addSchoolClass, editSchoolClass, deleteSchoolClass, schoolClasses } = React.useContext(AdmissionContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    className: '',
    admissionFee: '0',
    tuitionFee: '0',
    vocationalFee: '0',
    sanitationHealthFee: '0',
    sportWearFee: '0',
    installments: '1',
    selectedDepartments: []
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      const departmentsRef = ref(database, 'departments');
      onValue(departmentsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const deptList = Object.entries(data).map(([id, dept]) => ({
            id,
            ...dept
          }));
          setDepartments(deptList);
        }
      });
    };
    fetchDepartments();
  }, []);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'selectedDepartments') {
      const options = e.target.options;
      const selectedValues = [];
      for (let i = 0; i < options.length; i++) {
        if (options[i].selected) {
          selectedValues.push(options[i].value);
        }
      }
      setFormData(prev => ({
        ...prev,
        selectedDepartments: selectedValues
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    setError('');
  };

  const validateForm = () => {
    if (!formData.className.trim()) {
      setError('Class name is required');
      return false;
    }
    if (isNaN(formData.admissionFee) || Number(formData.admissionFee) < 0) {
      setError('Admission fee must be 0 or greater');
      return false;
    }
    if (isNaN(formData.tuitionFee) || Number(formData.tuitionFee) < 0) {
      setError('Tuition fee must be 0 or greater');
      return false;
    }
    if (isNaN(formData.vocationalFee) || Number(formData.vocationalFee) < 0) {
      setError('Vocational fee must be 0 or greater');
      return false;
    }
    if (isNaN(formData.sanitationHealthFee) || Number(formData.sanitationHealthFee) < 0) {
      setError('Sanitation and health fee must be 0 or greater');
      return false;
    }
    if (isNaN(formData.sportWearFee) || Number(formData.sportWearFee) < 0) {
      setError('Sport wear fee must be 0 or greater');
      return false;
    }
    if (!formData.installments || isNaN(formData.installments) || Number(formData.installments) < 1) {
      setError('Number of installments must be at least 1');
      return false;
    }
    if (formData.selectedDepartments.length === 0) {
      setError('Please select at least one vocational department');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    try {
      const classData = {
        ...formData,
        admissionFee: Number(formData.admissionFee),
        tuitionFee: Number(formData.tuitionFee),
        vocationalFee: Number(formData.vocationalFee),
        sanitationHealthFee: Number(formData.sanitationHealthFee),
        sportWearFee: Number(formData.sportWearFee),
        installments: Number(formData.installments),
        totalFee: Number(formData.admissionFee) + 
                 Number(formData.tuitionFee) + 
                 Number(formData.vocationalFee) + 
                 Number(formData.sanitationHealthFee) + 
                 Number(formData.sportWearFee),
        createdAt: new Date().toISOString()
      };

      let success;
      if (editingClass) {
        success = await editSchoolClass(editingClass.id, classData);
        if (success) setSuccess('Class updated successfully!');
      } else {
        success = await addSchoolClass(classData);
        if (success) setSuccess('Class created successfully!');
      }

      if (success) {
        setFormData({
          className: '',
          admissionFee: '0',
          tuitionFee: '0',
          vocationalFee: '0',
          sanitationHealthFee: '0',
          sportWearFee: '0',
          installments: '1',
          selectedDepartments: []
        });
        setShowForm(false);
        setEditingClass(null);
      }
    } catch (err) {
      setError(editingClass ? 'Failed to update class' : 'Failed to create class');
    }
  };

  const handleEdit = (classItem) => {
    setEditingClass(classItem);
    setFormData({
      className: classItem.className,
      admissionFee: classItem.admissionFee.toString(),
      tuitionFee: classItem.tuitionFee.toString(),
      vocationalFee: classItem.vocationalFee.toString(),
      sanitationHealthFee: classItem.sanitationHealthFee.toString(),
      sportWearFee: classItem.sportWearFee.toString(),
      installments: classItem.installments.toString(),
      selectedDepartments: classItem.selectedDepartments
    });
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (classId) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        const success = await deleteSchoolClass(classId);
        if (success) {
          setSuccess('Class deleted successfully!');
        }
      } catch (err) {
        setError('Failed to delete class');
      }
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="create-class-wrapper">
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

      <main className="create-class-main">
        <div className="create-class-container">
          <div className="create-class-header">
            <h2 className="create-class-title">School Classes</h2>
            {!showForm && (
              <button 
                className="create-class-btn"
                onClick={() => {
                  setShowForm(true);
                  setEditingClass(null);
                  setFormData({
                    className: '',
                    admissionFee: '0',
                    tuitionFee: '0',
                    vocationalFee: '0',
                    sanitationHealthFee: '0',
                    sportWearFee: '0',
                    installments: '1',
                    selectedDepartments: []
                  });
                }}
              >
                Create Class
              </button>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          {showForm && (
            <form className="create-class-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="className">Class Name</label>
                <input
                  type="text"
                  id="className"
                  name="className"
                  value={formData.className}
                  onChange={handleInputChange}
                  placeholder="Enter class name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="admissionFee">Admission Fee (FCFA)</label>
                <input
                  type="number"
                  id="admissionFee"
                  name="admissionFee"
                  value={formData.admissionFee}
                  onChange={handleInputChange}
                  placeholder="Enter admission fee"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="tuitionFee">Tuition Fee (FCFA)</label>
                <input
                  type="number"
                  id="tuitionFee"
                  name="tuitionFee"
                  value={formData.tuitionFee}
                  onChange={handleInputChange}
                  placeholder="Enter tuition fee"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="vocationalFee">Vocational Fee (FCFA)</label>
                <input
                  type="number"
                  id="vocationalFee"
                  name="vocationalFee"
                  value={formData.vocationalFee}
                  onChange={handleInputChange}
                  placeholder="Enter vocational fee"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="sanitationHealthFee">Sanitation + Health Fee (FCFA)</label>
                <input
                  type="number"
                  id="sanitationHealthFee"
                  name="sanitationHealthFee"
                  value={formData.sanitationHealthFee}
                  onChange={handleInputChange}
                  placeholder="Enter sanitation and health fee"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="sportWearFee">Sport Wear Fee (FCFA)</label>
                <input
                  type="number"
                  id="sportWearFee"
                  name="sportWearFee"
                  value={formData.sportWearFee}
                  onChange={handleInputChange}
                  placeholder="Enter sport wear fee"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="installments">Number of Installments</label>
                <input
                  type="number"
                  id="installments"
                  name="installments"
                  value={formData.installments}
                  onChange={handleInputChange}
                  placeholder="Enter number of installments"
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label>Vocational Departments</label>
                <div className="departments-checkbox-container">
                  {departments.map((dept) => (
                    <label key={dept.id} className="department-checkbox">
                      <input
                        type="checkbox"
                        name="selectedDepartments"
                        value={dept.title}
                        checked={formData.selectedDepartments.includes(dept.title)}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            selectedDepartments: e.target.checked
                              ? [...prev.selectedDepartments, value]
                              : prev.selectedDepartments.filter(d => d !== value)
                          }));
                        }}
                      />
                      <span>{dept.title}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-buttons">
                <button type="button" className="cancel-btn" onClick={() => {
                  setShowForm(false);
                  setEditingClass(null);
                  setFormData({
                    className: '',
                    admissionFee: '0',
                    tuitionFee: '0',
                    vocationalFee: '0',
                    sanitationHealthFee: '0',
                    sportWearFee: '0',
                    installments: '1',
                    selectedDepartments: []
                  });
                }}>
                  Cancel
                </button>
                <button type="submit" className="create-class-btn">
                  {editingClass ? 'Update Class' : 'Create Class'}
                </button>
              </div>
            </form>
          )}

          {schoolClasses.length > 0 && (
            <div className="classes-table-container">
              <table className="classes-table">
                <thead>
                  <tr>
                    <th>Class Name</th>
                    <th>Admission Fee</th>
                    <th>Tuition Fee</th>
                    <th>Vocational Fee</th>
                    <th>Sanitation + Health</th>
                    <th>Sport Wear</th>
                    <th>Total Fee</th>
                    <th>Installments</th>
                    <th>Vocational Departments</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {schoolClasses.map((classItem) => (
                    <tr key={classItem.id}>
                      <td>{classItem.className}</td>
                      <td>{(classItem.admissionFee || 0).toLocaleString()} FCFA</td>
                      <td>{(classItem.tuitionFee || 0).toLocaleString()} FCFA</td>
                      <td>{(classItem.vocationalFee || 0).toLocaleString()} FCFA</td>
                      <td>{(classItem.sanitationHealthFee || 0).toLocaleString()} FCFA</td>
                      <td>{(classItem.sportWearFee || 0).toLocaleString()} FCFA</td>
                      <td>{(classItem.totalFee || 0).toLocaleString()} FCFA</td>
                      <td>{classItem.installments || 1}</td>
                      <td>
                        <div className="createclass-departments-grid">
                          {classItem.selectedDepartments?.map((dept, index) => (
                            <div key={index} className="createclass-department-item">
                              {dept}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="createclass-action-buttons">
                        <button 
                          className="createclass-edit-btn"
                          onClick={() => handleEdit(classItem)}
                          title="Edit class"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="createclass-delete-btn"
                          onClick={() => handleDelete(classItem.id)}
                          title="Delete class"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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

export default CreateClass; 