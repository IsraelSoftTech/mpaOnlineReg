import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RiMenu3Line, RiCloseFill } from 'react-icons/ri';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { ref, onValue, push, update, remove } from 'firebase/database';
import { database } from '../../firebase';
import './CreateClass.css';
import { AdmissionContext } from '../AdmissionContext';
import logo from '../../assets/logo.png';
import AdminNav from './AdminNav';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
    labFee: '0',
    installments: '1',
    selectedDepartments: []
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // Add array of special class names
  const specialClasses = [
    'Form Five(5) Arts',
    'Form Five(5) Science',
    'Lower Sixth Arts',
    'Lower Sixth Science',
    'Upper Sixth Arts',
    'Upper Sixth Science',
    'Form Five(5) Commercial',
    'Upper Sixth Commercial',
    'Form 4 Technical',
    'Form 5 Technical'
  ];

  // Check if current class is a special class
  const isSpecialClass = (className) => {
    return specialClasses.includes(className);
  };

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
    } else if (name === 'className') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        // Clear departments if it's a special class
        selectedDepartments: isSpecialClass(value) ? [] : prev.selectedDepartments
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
    if (isNaN(formData.labFee) || Number(formData.labFee) < 0) {
      setError('Lab fee must be 0 or greater');
      return false;
    }
    if (!formData.installments || isNaN(formData.installments) || Number(formData.installments) < 1) {
      setError('Number of installments must be at least 1');
      return false;
    }
    if (!isSpecialClass(formData.className) && formData.selectedDepartments.length === 0) {
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
        labFee: Number(formData.labFee),
        installments: Number(formData.installments),
        totalFee: Number(formData.admissionFee) + 
                 Number(formData.tuitionFee) + 
                 Number(formData.vocationalFee) + 
                 Number(formData.sanitationHealthFee) + 
                 Number(formData.sportWearFee) + 
                 Number(formData.labFee),
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
          labFee: '0',
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
      labFee: classItem.labFee.toString(),
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
      <AdminNav />
      <ToastContainer position="top-right" autoClose={3000} />
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
                    labFee: '0',
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

              {isSpecialClass(formData.className) && (
                <div className="form-group">
                  <label htmlFor="labFee">Lab Fee (FCFA)</label>
                  <input
                    type="number"
                    id="labFee"
                    name="labFee"
                    value={formData.labFee}
                    onChange={handleInputChange}
                    placeholder="Enter lab fee"
                    min="0"
                    required
                  />
                </div>
              )}

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

              {!isSpecialClass(formData.className) && (
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
              )}

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
                    labFee: '0',
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
                    <th>Lab Fee</th>
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
                      <td>{isSpecialClass(classItem.className) ? 'None' : `${(classItem.vocationalFee || 0).toLocaleString()} FCFA`}</td>
                      <td>{(classItem.sanitationHealthFee || 0).toLocaleString()} FCFA</td>
                      <td>{(classItem.sportWearFee || 0).toLocaleString()} FCFA</td>
                      <td>{isSpecialClass(classItem.className) ? `${(classItem.labFee || 0).toLocaleString()} FCFA` : 'None'}</td>
                      <td>{(classItem.totalFee || 0).toLocaleString()} FCFA</td>
                      <td>{classItem.installments || 1}</td>
                      <td>
                        <div className="createclass-departments-grid">
                          {isSpecialClass(classItem.className) ? (
                            <div className="createclass-department-item no-department">
                              None
                            </div>
                          ) : classItem.selectedDepartments?.map((dept, index) => (
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
    </div>
  );
};

export default CreateClass; 