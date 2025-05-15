import React, { useState, useContext, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RiMenu3Line, RiCloseFill } from 'react-icons/ri';
import { AdmissionContext } from '../AdmissionContext';
import './CreateClass.css';
import logo from '../../assets/logo.png';

const CreateClass = () => {
  const { addSchoolClass, schoolClasses } = useContext(AdmissionContext);
  const [showModal, setShowModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    className: '',
    admissionFee: '',
    tuitionFee: '',
    installments: ''
  });

  const toggleMenu = () => setIsMenuOpen((open) => !open);

  const handleLogout = () => {
    navigate('/signin');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Validate inputs
      if (!formData.className.trim()) {
        throw new Error('Class name is required');
      }
      if (isNaN(formData.admissionFee) || formData.admissionFee <= 0) {
        throw new Error('Please enter a valid admission fee');
      }
      if (isNaN(formData.tuitionFee) || formData.tuitionFee <= 0) {
        throw new Error('Please enter a valid tuition fee');
      }
      if (isNaN(formData.installments) || formData.installments < 1) {
        throw new Error('Please enter a valid number of installments');
      }

      const classData = {
        ...formData,
        admissionFee: Number(formData.admissionFee),
        tuitionFee: Number(formData.tuitionFee),
        installments: Number(formData.installments),
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };

      await addSchoolClass(classData);
      setSuccessMessage('Class created successfully!');
      setFormData({
        className: '',
        admissionFee: '',
        tuitionFee: '',
        installments: ''
      });
      setShowModal(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to create class. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <button className="app-nav-link logout" onClick={handleLogout}>Log out</button>
        </nav>
      </header>
      <main className="admin-main">
        <div className="create-class-container">
          <div className="create-class-header">
            <h2>School Classes</h2>
            <button 
              className="create-class-btn"
              onClick={() => setShowModal(true)}
            >
              Create Class
            </button>
          </div>

          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}

          {/* Classes Table */}
          <div className="classes-table-wrapper">
            <table className="classes-table">
              <thead>
                <tr>
                  <th>Class Name</th>
                  <th>Admission Fee</th>
                  <th>Tuition Fee</th>
                  <th>Installments</th>
                  <th>Created Date</th>
                </tr>
              </thead>
              <tbody>
                {schoolClasses?.map(classItem => (
                  <tr key={classItem.id}>
                    <td>{classItem.className}</td>
                    <td>{classItem.admissionFee.toLocaleString()} FCFA</td>
                    <td>{classItem.tuitionFee.toLocaleString()} FCFA</td>
                    <td>{classItem.installments}</td>
                    <td>{new Date(classItem.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Create Class Modal */}
          {showModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Create New Class</h3>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Class Name:</label>
                    <input
                      type="text"
                      name="className"
                      value={formData.className}
                      onChange={handleInputChange}
                      placeholder="e.g., Form 1A"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Admission Fee (FCFA):</label>
                    <input
                      type="number"
                      name="admissionFee"
                      value={formData.admissionFee}
                      onChange={handleInputChange}
                      placeholder="e.g., 25000"
                      required
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Tuition Fee (FCFA):</label>
                    <input
                      type="number"
                      name="tuitionFee"
                      value={formData.tuitionFee}
                      onChange={handleInputChange}
                      placeholder="e.g., 150000"
                      required
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Number of Installments:</label>
                    <input
                      type="number"
                      name="installments"
                      value={formData.installments}
                      onChange={handleInputChange}
                      placeholder="e.g., 3"
                      required
                      min="1"
                    />
                  </div>
                  <div className="modal-actions">
                    <button 
                      type="button" 
                      onClick={() => setShowModal(false)}
                      className="cancel-btn"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="create-btn"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Creating...' : 'Create Class'}
                    </button>
                  </div>
                </form>
              </div>
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