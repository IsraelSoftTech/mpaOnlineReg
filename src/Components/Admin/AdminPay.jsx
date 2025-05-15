import React, { useState, useContext, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RiMenu3Line, RiCloseFill } from 'react-icons/ri';
import { AdmissionContext } from '../AdmissionContext';
import './AdminPay.css';
import logo from '../../assets/logo.png';

const AdminPay = () => {
  const { admissions, updateAdmissionStatus } = useContext(AdmissionContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen((open) => !open);

  // Filter admissions that have payment details
  const paymentTransactions = admissions
    .filter(admission => admission.paymentDetails)
    .map(admission => ({
      ...admission.paymentDetails,
      studentName: admission.name || admission.fullName,
      admissionId: admission.id,
      status: admission.status
    }))
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

  const handleValidate = async (admissionId) => {
    setIsLoading(true);
    try {
      await updateAdmissionStatus(admissionId, 'Confirmed');
    } catch (error) {
      console.error('Error validating payment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFake = async (admissionId) => {
    setIsLoading(true);
    try {
      await updateAdmissionStatus(admissionId, 'Fake');
    } catch (error) {
      console.error('Error marking payment as fake:', error);
    } finally {
      setIsLoading(false);
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
          <button className="app-nav-link logout" onClick={() => navigate('/signin')}>Log out</button>
        </nav>
      </header>
      <main className="admin-main">
        <div className="admin-pay-container">
          <h2>Payment Transactions</h2>
          <div className="admin-pay-table-container">
            <table className="admin-pay-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Student Name</th>
                  <th>Sender Name</th>
                  <th>Sender Number</th>
                  <th>Transaction ID</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paymentTransactions.map((transaction) => (
                  <tr key={transaction.admissionId}>
                    <td>{new Date(transaction.submittedAt).toLocaleDateString()}</td>
                    <td>{transaction.studentName}</td>
                    <td>{transaction.senderName}</td>
                    <td>{transaction.senderNumber}</td>
                    <td>{transaction.transactionId}</td>
                    <td>
                      <span className={`status-badge status-${transaction.status?.toLowerCase()}`}>
                        {transaction.status || 'Pending'}
                      </span>
                    </td>
                    <td className="action-buttons">
                      {transaction.status === 'Pending' && (
                        <>
                          <button
                            className="validate-btn"
                            onClick={() => handleValidate(transaction.admissionId)}
                            disabled={isLoading}
                          >
                            Validate
                          </button>
                          <button
                            className="fake-btn"
                            onClick={() => handleFake(transaction.admissionId)}
                            disabled={isLoading}
                          >
                            Fake
                          </button>
                        </>
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