import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RiMenu3Line, RiCloseFill } from 'react-icons/ri';
import './CreateClass.css';
import { AdmissionContext } from '../AdmissionContext';
import logo from '../../assets/logo.png';

const CreateClass = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addSchoolClass } = React.useContext(AdmissionContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    className: '',
    description: '',
    capacity: '',
    teacher: '',
    schedule: '',
    requirements: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate form
    if (!formData.className.trim()) {
      setError('Class name is required');
      return;
    }

    try {
      const classData = {
        ...formData,
        createdAt: new Date().toISOString()
      };

      const success = await addSchoolClass(classData);
      if (success) {
        setSuccess('Class created successfully!');
        setFormData({
          className: '',
          description: '',
          capacity: '',
          teacher: '',
          schedule: '',
          requirements: ''
        });
      }
    } catch (err) {
      setError('Failed to create class. Please try again.');
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
          <h2 className="create-class-title">Create New Class</h2>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
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
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter class description"
                rows="4"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="capacity">Capacity</label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  placeholder="Maximum students"
                  min="1"
                />
              </div>

              <div className="form-group">
                <label htmlFor="teacher">Teacher</label>
                <input
                  type="text"
                  id="teacher"
                  name="teacher"
                  value={formData.teacher}
                  onChange={handleInputChange}
                  placeholder="Assigned teacher"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="schedule">Schedule</label>
              <input
                type="text"
                id="schedule"
                name="schedule"
                value={formData.schedule}
                onChange={handleInputChange}
                placeholder="Class schedule"
              />
            </div>

            <div className="form-group">
              <label htmlFor="requirements">Requirements</label>
              <textarea
                id="requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                placeholder="Class requirements"
                rows="4"
              />
            </div>

            <button type="submit" className="create-class-btn">
              Create Class
            </button>
          </form>
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