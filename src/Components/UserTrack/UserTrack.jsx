import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RiMenu3Line, RiCloseFill } from 'react-icons/ri';
import '../UserAdmission/UserAdmission.css';
import './UserTrack.css';
import { AdmissionContext } from '../AdmissionContext';
import logo from '../../assets/logo.png';

const UserTrack = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser, admissions, updatePaymentStatus } = useContext(AdmissionContext);
  const menuRef = React.useRef(null);
  const buttonRef = React.useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check authentication
    if (!currentUser) {
      sessionStorage.setItem('redirectAfterLogin', '/usertrack');
      navigate('/signin');
      return;
    }
    
    // Wait for user data to load
    if (admissions) {
      setIsLoading(false);
    }
  }, [currentUser, admissions, navigate]);

  useEffect(() => {
    // Check for Flutterwave payment success in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const tx_ref = urlParams.get('tx_ref');
    
    if (status === 'successful' && tx_ref) {
      // Update payment status to Paid which will automatically set admission status to Admitted
      updatePaymentStatus('Paid');
      
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [updatePaymentStatus]);

  const toggleMenu = () => setIsMenuOpen((open) => !open);

  const handleLogout = () => {
    // Implement logout functionality
  };

  // Get current user's admission data
  const currentUserData = admissions.find(admission => 
    admission.username === currentUser
  );

  // Get payment and admission status
  const status = currentUserData?.status || 'Pending';
  const paymentStatus = currentUserData?.paymentStatus || 'Not Paid';

  // Calculate the application progress percentage
  const getProgressPercentage = () => {
    switch(status.toLowerCase()) {
      case 'admitted':
        return 100;
      case 'processing':
        return 66;
      case 'pending':
        return 33;
      case 'rejected':
        return 100;
      default:
        return 0;
    }
  };

  if (isLoading) {
    return (
      <div className="userad-wrapper">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your application details...</p>
        </div>
      </div>
    );
  }

  if (!currentUserData) {
    return (
      <div className="userad-wrapper">
        <div className="no-application-container">
          <h2>No Application Found</h2>
          <p>You haven't submitted an application yet.</p>
          <button 
            className="submit-application-btn"
            onClick={() => navigate('/userAdmission')}
          >
            Submit Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="userad-wrapper">
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
            className={`app-nav-link${location.pathname === '/about' ? ' active' : ''}`}
            onClick={() => navigate('/about')}
          >
            About
          </button>
          <button 
            className={`app-nav-link${location.pathname === '/userAdmission' ? ' active' : ''}`}
            onClick={() => navigate('/userAdmission')}
          >
            Admission
          </button>
          <button 
            className={`app-nav-link${location.pathname === '/usertrack' ? ' active' : ''}`}
            onClick={() => navigate('/usertrack')}
          >
            Check Status
          </button>
          <button className="app-nav-link">Contact</button>
          <button 
            className={`app-nav-link${location.pathname === '/profile' ? ' active' : ''}`}
            onClick={() => navigate('/profile')}
          >
            Profile
          </button>
          <button className="app-nav-link logout" onClick={handleLogout}>Logout</button>
        </nav>
      </header>
      <main className="userad-main">
        <h2 className="userad-title-main">Track Your Admission</h2>
        <div className="track-container">
          <div className="track-status-header">
            <div className="status-box">
              <h3>Application Status</h3>
              <span className={`status-badge status-${status.toLowerCase()}`}>{status}</span>
            </div>
            <div className="status-box">
              <h3>Payment Status</h3>
              <span className={`status-badge status-${paymentStatus.toLowerCase().replace(' ', '-')}`}>{paymentStatus}</span>
            </div>
          </div>
          <div className="track-details">
            <h3>Application Details</h3>
            <div className="details-grid">
              <div className="detail-item">
                <label>Full Name</label>
                <span>{currentUserData.name || currentUserData.fullName || 'Not provided'}</span>
              </div>
              <div className="detail-item">
                <label>Sex</label>
                <span>{currentUserData.sex || 'Not provided'}</span>
              </div>
              <div className="detail-item">
                <label>Date of Birth</label>
                <span>{currentUserData.dob || 'Not provided'}</span>
              </div>
              <div className="detail-item">
                <label>Place of Birth</label>
                <span>{currentUserData.pob || 'Not provided'}</span>
              </div>
              <div className="detail-item">
                <label>Father's Name</label>
                <span>{currentUserData.father || 'Not provided'}</span>
              </div>
              <div className="detail-item">
                <label>Mother's Name</label>
                <span>{currentUserData.mother || 'Not provided'}</span>
              </div>
              <div className="detail-item">
                <label>Guardian's Contact</label>
                <span>{currentUserData.guardian || 'Not provided'}</span>
              </div>
              <div className="detail-item">
                <label>Previous Average</label>
                <span>{currentUserData.avg || 'Not provided'}</span>
              </div>
              <div className="detail-item">
                <label>Form/Class</label>
                <span>{currentUserData.form || 'Not provided'}</span>
              </div>
              <div className="detail-item">
                <label>Vocation Department</label>
                <span>{currentUserData.vocation || 'Not provided'}</span>
              </div>
            </div>
            <div className="track-documents">
              <h3>Submitted Documents</h3>
              <div className="documents-grid">
                <div className="document-item">
                  <label>Student Picture</label>
                  {currentUserData.picture ? (
                    <img src={currentUserData.picture} alt="Student" className="student-picture" />
                  ) : (
                    <span className="no-document">Not uploaded</span>
                  )}
                </div>
                <div className="document-item">
                  <label>Report Card</label>
                  {currentUserData.report ? (
                    <a href={currentUserData.report} target="_blank" rel="noopener noreferrer" className="view-document">
                      View Document
                    </a>
                  ) : (
                    <span className="no-document">Not uploaded</span>
                  )}
                </div>
              </div>
            </div>
            <div className="track-timeline">
              <h3>Application Timeline</h3>
              <div className="timeline">
                <div className={`timeline-item ${status !== 'Rejected' ? 'active' : 'rejected'}`}>
                  <div className="timeline-point"></div>
                  <div className="timeline-content">
                    <h4>Application Submitted</h4>
                    <p>{new Date(currentUserData.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className={`timeline-item ${paymentStatus === 'Processing' ? 'active' : ''}`}>
                  <div className="timeline-point"></div>
                  <div className="timeline-content">
                    <h4>Payment Status</h4>
                    <p>{paymentStatus}</p>
                  </div>
                </div>
                <div className={`timeline-item ${status === 'Approved' ? 'active' : ''}`}>
                  <div className="timeline-point"></div>
                  <div className="timeline-content">
                    <h4>Final Decision</h4>
                    <p>{status === 'Approved' ? 'Application Approved' : 'Pending Review'}</p>
                  </div>
                </div>
              </div>
              <div className="progress-bar">
                <div 
                  className={`progress-fill status-${status.toLowerCase()}`} 
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
            </div>
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

export default UserTrack; 