import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RiMenu3Line, RiCloseFill } from 'react-icons/ri';
import { AdmissionContext } from '../AdmissionContext';
import './AdminPay.css';
import logo from '../../assets/logo.png';

const AdminPay = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { admissions, updateAdmissionStatus } = useContext(AdmissionContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
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

  const handleStatusUpdate = async (admissionId, newStatus) => {
    setIsLoading(true);
    try {
      await updateAdmissionStatus(admissionId, newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAdmissions = admissions.filter(admission => {
    const matchesSearch = searchTerm === '' || 
      (admission.fullName && admission.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (admission.email && admission.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || 
      (admission.paymentStatus && admission.paymentStatus.toLowerCase() === filterStatus.toLowerCase());
    
    return matchesSearch && matchesStatus;
  });

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="admin-pay-wrapper">
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

      <main className="admin-pay-main">
        <div className="admin-pay-container">
          <h2 className="admin-pay-title">Payment Management</h2>
          
          <div className="admin-controls">
            <div className="search-filter-group">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="status-filter"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="payments-table-wrapper">
            <table className="payments-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Reference</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmissions.map(admission => (
                  <tr key={admission.id}>
                    <td>{admission.fullName || 'N/A'}</td>
                    <td>{admission.email || 'N/A'}</td>
                    <td>{admission.paymentDetails?.amount || 'N/A'}</td>
                    <td>{admission.paymentDetails?.method || 'N/A'}</td>
                    <td>{admission.paymentDetails?.reference || 'N/A'}</td>
                    <td>
                      <span className={`status-badge status-${(admission.paymentStatus || 'pending').toLowerCase()}`}>
                        {admission.paymentStatus || 'Pending'}
                      </span>
                    </td>
                    <td>
                      {admission.paymentStatus === 'Pending' && (
                        <div className="action-buttons">
                          <button
                            className="verify-btn"
                            onClick={() => handleStatusUpdate(admission.id, 'Verified')}
                            disabled={isLoading}
                          >
                            Verify
                          </button>
                          <button
                            className="reject-btn"
                            onClick={() => handleStatusUpdate(admission.id, 'Rejected')}
                            disabled={isLoading}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

export default AdminPay; 