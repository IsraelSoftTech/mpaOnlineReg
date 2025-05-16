import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RiMenu3Line, RiCloseFill } from 'react-icons/ri';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../UserAdmission/UserAdmission.css';
import './UserTrack.css';
import { AdmissionContext } from '../AdmissionContext';
import logo from '../../assets/logo.png';
import { database } from '../../firebase';
import { ref, push, onValue, update, off, get } from 'firebase/database';

const UserTrack = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [interviewSchedule, setInterviewSchedule] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const { currentUser, admissions, updatePaymentStatus, logout } = useContext(AdmissionContext);
  const menuRef = React.useRef(null);
  const buttonRef = React.useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [hasExistingInterview, setHasExistingInterview] = useState(false);

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

  useEffect(() => {
    if (!currentUser) return;

    // Listen for notifications
    const notificationsRef = ref(database, 'notifications');
    
    const handleNotifications = (snapshot) => {
      const data = snapshot.val() || {};
      const userNotifications = Object.entries(data)
        .map(([id, notification]) => ({
          id,
          ...notification,
        }))
        .filter(n => n.userId === currentUser && n.type === 'interview_schedule' && !n.read)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setNotifications(userNotifications);

      // If there's an interview schedule notification, fetch the interview details
      if (userNotifications.length > 0) {
        const latestNotification = userNotifications[0];
        const interviewRef = ref(database, `interviews/${latestNotification.interviewId}`);
        
        onValue(interviewRef, (snapshot) => {
          const interviewData = snapshot.val();
          if (interviewData && interviewData.status === 'Scheduled') {
            setInterviewSchedule(interviewData);
          }
        });
      }
    };

    onValue(notificationsRef, handleNotifications);

    return () => off(notificationsRef);
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    // Check for existing interview booking
    const interviewsRef = ref(database, 'interviews');
    
    const checkExistingInterview = async () => {
      try {
        const snapshot = await get(interviewsRef);
        const interviews = snapshot.val() || {};
        const userInterviews = Object.values(interviews).filter(
          interview => interview.username === currentUser
        );
        setHasExistingInterview(userInterviews.length > 0);
      } catch (error) {
        console.error('Error checking existing interviews:', error);
      }
    };

    checkExistingInterview();
  }, [currentUser]);

  const toggleMenu = () => setIsMenuOpen((open) => !open);

  const handleLogout = () => {
    logout();
    navigate('/about');
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

  const handleBookInterview = async (formData) => {
    try {
      // Check again for existing interview before booking
      const interviewsRef = ref(database, 'interviews');
      const snapshot = await get(interviewsRef);
      const interviews = snapshot.val() || {};
      const userInterviews = Object.values(interviews).filter(
        interview => interview.username === currentUser
      );

      if (userInterviews.length > 0) {
        toast.error('You have already booked an interview');
        setShowInterviewModal(false);
        return;
      }

      // Proceed with booking if no existing interview
      await push(interviewsRef, {
        ...formData,
        username: currentUser,
        timestamp: new Date().toISOString(),
        status: 'Pending'
      });
      toast.success('Interview booked successfully!');
      setShowInterviewModal(false);
      setHasExistingInterview(true);
    } catch (error) {
      console.error('Error booking interview:', error);
      toast.error('Failed to book interview');
    }
  };

  const handleViewSchedule = async (notification) => {
    // Mark notification as read
    const notificationRef = ref(database, `notifications/${notification.id}`);
    await update(notificationRef, { read: true });
    setShowScheduleModal(true);
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

  const InterviewModal = ({ onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
      name: currentUserData?.name || '',
      class: currentUserData?.form || '',
      subject: 'Interview'
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Book Interview</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                disabled
              />
            </div>
            <div className="form-group">
              <label>Class:</label>
              <input
                type="text"
                value={formData.class}
                onChange={(e) => setFormData({...formData, class: e.target.value})}
                required
                disabled
              />
            </div>
            <div className="form-group">
              <label>Subject:</label>
              <input
                type="text"
                value={formData.subject}
                disabled
              />
            </div>
            <div className="modal-buttons">
              <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
              <button type="submit" className="submit-btn">Book</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const InterviewScheduleModal = ({ schedule, onClose }) => (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Interview Schedule</h2>
        <div className="schedule-details">
          <p><strong>Date:</strong> {new Date(schedule.date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> {schedule.time}</p>
          <p><strong>Mode:</strong> {schedule.mode}</p>
          {schedule.link && (
            <p>
              <strong>Meeting Link:</strong>{' '}
              <a href={schedule.link} target="_blank" rel="noopener noreferrer">
                Join Meeting
              </a>
            </p>
          )}
          {schedule.notes && (
            <div className="schedule-notes">
              <strong>Additional Notes:</strong>
              <p>{schedule.notes}</p>
            </div>
          )}
        </div>
        <div className="modal-buttons">
          <button onClick={onClose} className="close-btn">Close</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="userad-wrapper">
      <ToastContainer position="top-right" autoClose={3000} />
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
          <button 
            className={`app-nav-link${location.pathname === '/contact' ? ' active' : ''}`}
            onClick={() => navigate('/contact')}
          >
            Contact
          </button>
          <button 
            className={`app-nav-link${location.pathname === '/profile' ? ' active' : ''}`}
            onClick={() => navigate('/profile')}
          >
            Profile
          </button>
          <button 
            className="app-nav-link logout" 
            onClick={handleLogout}
          >
            Log out
          </button>
        </nav>
      </header>
      <main className="userad-main">
        <h2 className="userad-title-main">Track Your Admission</h2>
        {notifications.length > 0 && (
          <div className="notification-banner">
            <button 
              className="view-schedule-btn"
              onClick={() => handleViewSchedule(notifications[0])}
            >
              New Interview Update
            </button>
          </div>
        )}
        <div className="track-container">
          <div className="track-status-header">
            <div className="status-box">
              <h3>Application Status</h3>
              <span className={`status-badge status-${status.toLowerCase()}`}>{status}</span>
            </div>
            <div className="status-box">
              <h3>Payment Status</h3>
              <span className={`status-badge status-${status === 'Admitted' ? 'done' : paymentStatus.toLowerCase().replace(' ', '-')}`}>
                {status === 'Admitted' ? 'Done' : paymentStatus}
              </span>
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
                    <button className="pay-admission-btn" disabled>
                      Pay Admission
                    </button>
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
                <div className={`timeline-item ${paymentStatus === 'Processing' || status === 'Admitted' ? 'active' : ''}`}>
                  <div className="timeline-point"></div>
                  <div className="timeline-content">
                    <h4>Payment Status</h4>
                    <p>{status === 'Admitted' ? 'Done' : paymentStatus}</p>
                  </div>
                </div>
                <div className={`timeline-item ${status === 'Admitted' ? 'active' : ''}`}>
                  <div className="timeline-point"></div>
                  <div className="timeline-content">
                    <h4>Final Decision</h4>
                    <p>{status === 'Admitted' ? 'Admitted' : 'Pending Review'}</p>
                    {status === 'Admitted' && !currentUserData.isOldStudent && (
                      <>
                        {hasExistingInterview ? (
                          <div className="interview-status">
                            <p className="interview-booked-message">Interview has been booked</p>
                            <p className="interview-note">Please check notifications for updates</p>
                          </div>
                        ) : (
                          <button 
                            className="book-interview-btn"
                            onClick={() => setShowInterviewModal(true)}
                          >
                            Book for Interview
                          </button>
                        )}
                      </>
                    )}
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
      {showInterviewModal && (
        <InterviewModal
          onClose={() => setShowInterviewModal(false)}
          onSubmit={handleBookInterview}
        />
      )}
      {showScheduleModal && interviewSchedule && (
        <InterviewScheduleModal
          schedule={interviewSchedule}
          onClose={() => setShowScheduleModal(false)}
        />
      )}
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