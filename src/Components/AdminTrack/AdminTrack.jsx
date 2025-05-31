import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RiMenu3Line, RiCloseFill } from 'react-icons/ri';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../UserAdmission/UserAdmission.css';
import './AdminTrack.css';
import { AdmissionContext } from '../AdmissionContext';
import logo from '../../assets/logo.png';
import { database } from '../../firebase';
import { ref, push, onValue, update, off, get } from 'firebase/database';
import AdminNav from '../Admin/AdminNav';

// Move InterviewModal outside of AdminTrack
const InterviewModal = ({ onClose, onSubmit, admissionData }) => {
  const [formData, setFormData] = useState({
    name: admissionData?.name || '',
    class: admissionData?.form || '',
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

// Move InterviewScheduleModal outside of AdminTrack
const InterviewScheduleModal = ({ schedule, onClose }) => (
  <div className="modal-overlay">
    <div className="modal-content interview-schedule-modal">
      <div className="modal-header">
        <h2>Interview Schedule Details</h2>
        <button className="close-button" onClick={onClose}>&times;</button>
      </div>
      <div className="modal-body">
        <div className="schedule-details">
          <div className="schedule-header">
            <div className="schedule-icon">📅</div>
            <h3>Interview Information</h3>
          </div>
          <div className="schedule-grid">
            <div className="schedule-item">
              <label>Date</label>
              <span>{new Date(schedule.date).toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
            <div className="schedule-item">
              <label>Time</label>
              <span>{schedule.time}</span>
            </div>
            <div className="schedule-item">
              <label>Location</label>
              <span>{schedule.location}</span>
            </div>
            <div className="schedule-item">
              <label>Interviewer</label>
              <span>{schedule.interviewer}</span>
            </div>
            <div className="schedule-item full-width">
              <label>Additional Notes</label>
              <span>{schedule.notes || 'No additional notes provided'}</span>
            </div>
          </div>
          <div className="schedule-reminder">
            <p>Please arrive 10 minutes before your scheduled time.</p>
            <p>Bring all necessary documents and identification.</p>
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button className="close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  </div>
);

const AdminTrack = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [interviewSchedule, setInterviewSchedule] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const { admissions, updatePaymentStatus } = useContext(AdmissionContext);
  const menuRef = React.useRef(null);
  const buttonRef = React.useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [hasExistingInterview, setHasExistingInterview] = useState(false);
  const [admissionData, setAdmissionData] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  useEffect(() => {
    // Get admission data from location state
    if (location.state?.admissionData) {
      setAdmissionData(location.state.admissionData);
      setIsLoading(false);
    } else if (location.state?.viewAll) {
      // Fetch all registered students from AdminReg
      const admissionsRef = ref(database, 'admissions');
      const unsubscribe = onValue(admissionsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          // Filter students to only include those registered through AdminReg
          const students = Object.entries(data)
            .filter(([_, student]) => student.username === 'admin_registered')
            .map(([id, student]) => ({
              id,
              ...student
            }));
          setAllStudents(students);
          
          // If there's a selected student, update their data
          if (selectedStudent) {
            const updatedStudent = students.find(s => s.id === selectedStudent.id);
            if (updatedStudent) {
              setSelectedStudent(updatedStudent);
            }
          }
        }
        setIsLoading(false);
      });

      return () => unsubscribe();
    }
  }, [location.state, selectedStudent]);

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
    if (!admissionData) return;

    // Listen for notifications
    const notificationsRef = ref(database, 'notifications');
    
    const handleNotifications = (snapshot) => {
      const data = snapshot.val() || {};
      const userNotifications = Object.entries(data)
        .map(([id, notification]) => ({
          id,
          ...notification,
        }))
        .filter(n => n.userId === admissionData.username && n.type === 'interview_schedule' && !n.read)
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
  }, [admissionData]);

  useEffect(() => {
    if (!admissionData) return;

    // Check for existing interview booking
    const interviewsRef = ref(database, 'interviews');
    
    const checkExistingInterview = async () => {
      try {
        const snapshot = await get(interviewsRef);
        const interviews = snapshot.val() || {};
        const userInterviews = Object.values(interviews).filter(
          interview => interview.studentId === (selectedStudent?.id || admissionData.id) && interview.status === 'Scheduled'
        );
        setHasExistingInterview(userInterviews.length > 0);
        
        // If there's a scheduled interview, store its data
        if (userInterviews.length > 0) {
          setSelectedSchedule(userInterviews[0]);
        }
      } catch (error) {
        console.error('Error checking existing interviews:', error);
      }
    };

    // Set up real-time listener for interview updates
    const unsubscribe = onValue(interviewsRef, (snapshot) => {
      const interviews = snapshot.val() || {};
      const userInterviews = Object.values(interviews).filter(
        interview => interview.studentId === (selectedStudent?.id || admissionData.id) && interview.status === 'Scheduled'
      );
      setHasExistingInterview(userInterviews.length > 0);
      
      // If there's a scheduled interview, store its data
      if (userInterviews.length > 0) {
        setSelectedSchedule(userInterviews[0]);
      }
    });

    return () => unsubscribe();
  }, [admissionData, selectedStudent]);

  // Listen for payment status changes
  useEffect(() => {
    if (selectedStudent) {
      const paymentRef = ref(database, `payments/${selectedStudent.id}`);
      const unsubscribe = onValue(paymentRef, (snapshot) => {
        const paymentData = snapshot.val();
        if (paymentData) {
          setSelectedStudent(prev => ({
            ...prev,
            paymentStatus: paymentData.status,
            status: paymentData.status === 'Paid' ? 'Admitted' : prev.status
          }));
        }
      });

      return () => unsubscribe();
    }
  }, [selectedStudent]);

  // Listen for admission status changes
  useEffect(() => {
    if (selectedStudent) {
      const admissionRef = ref(database, `admissions/${selectedStudent.id}`);
      const unsubscribe = onValue(admissionRef, (snapshot) => {
        const admissionData = snapshot.val();
        if (admissionData) {
          setSelectedStudent(prev => ({
            ...prev,
            status: admissionData.status,
            paymentStatus: admissionData.paymentStatus
          }));
        }
      });

      return () => unsubscribe();
    }
  }, [selectedStudent]);

  const toggleMenu = () => setIsMenuOpen((open) => !open);

  // Get payment and admission status
  const status = admissionData?.status || 'Pending';
  const paymentStatus = admissionData?.paymentStatus || 'Not Paid';

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
      const studentId = selectedStudent?.id || admissionData?.id;
      if (!studentId) {
        toast.error('Student information not found');
        return;
      }

      // Check again for existing interview before booking
      const interviewsRef = ref(database, 'interviews');
      const snapshot = await get(interviewsRef);
      const interviews = snapshot.val() || {};
      const userInterviews = Object.values(interviews).filter(
        interview => interview.studentId === studentId
      );

      if (userInterviews.length > 0) {
        toast.error('Interview already booked for this student');
        setShowInterviewModal(false);
        return;
      }

      // Proceed with booking if no existing interview
      const newInterviewRef = await push(interviewsRef, {
        ...formData,
        studentId,
        username: selectedStudent?.username || admissionData?.username,
        name: selectedStudent?.name || admissionData?.name,
        class: selectedStudent?.form || admissionData?.form,
        timestamp: new Date().toISOString(),
        status: 'Pending'
      });

      // Create a notification for the student
      const notificationsRef = ref(database, 'notifications');
      await push(notificationsRef, {
        userId: selectedStudent?.username || admissionData?.username,
        type: 'interview_schedule',
        message: `Interview has been scheduled for ${formData.name}`,
        timestamp: new Date().toISOString(),
        read: false,
        interviewId: newInterviewRef.key
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
    try {
      // Mark notification as read
      const notificationRef = ref(database, `notifications/${notification.id}`);
      await update(notificationRef, { read: true });

      // Fetch the interview schedule details
      const interviewRef = ref(database, `interviews/${notification.interviewId}`);
      const interviewSnapshot = await get(interviewRef);
      
      if (interviewSnapshot.exists()) {
        const interviewData = interviewSnapshot.val();
        setSelectedSchedule(interviewData);
        setShowScheduleModal(true);
      } else {
        toast.error('Interview schedule not found');
      }
    } catch (error) {
      console.error('Error viewing schedule:', error);
      toast.error('Failed to load interview schedule');
    }
  };

  if (isLoading) {
    return (
      <div className="userad-wrapper">
        <AdminNav />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading student details...</p>
        </div>
      </div>
    );
  }

  if (location.state?.viewAll) {
    return (
      <div className="userad-wrapper">
        <ToastContainer position="top-right" autoClose={3000} />
        <AdminNav />
        <main className="usertrack-main">
          <h2 className="userad-title-main">Registered Students</h2>
          <div className="students-list">
            {allStudents.map((student) => (
              <div 
                key={student.id} 
                className={`student-card ${selectedStudent?.id === student.id ? 'selected' : ''}`}
                onClick={() => setSelectedStudent(student)}
              >
                <div className="student-info">
                  <h3>{student.name || student.fullName}</h3>
                  <p>Type: {student.studentType}</p>
                  <p>Class: {student.form}</p>
                  <p>Status: <span className={`status-badge status-${student.status?.toLowerCase() || 'pending'}`}>
                    {student.status || 'Pending'}
                  </span></p>
                </div>
              </div>
            ))}
          </div>
          {selectedStudent && (
            <div className="track-container">
              <div className="track-status-header">
                <div className="status-box">
                  <h3>Application Status</h3>
                  <span className={`status-badge status-${selectedStudent.status?.toLowerCase() || 'pending'}`}>
                    {selectedStudent.status || 'Pending'}
                  </span>
                </div>
                {selectedStudent.studentType === 'New Student' && (
                  <div className="status-box">
                    <h3>Payment Status</h3>
                    <span className={`status-badge status-${selectedStudent.status === 'Admitted' ? 'done' : (selectedStudent.paymentStatus?.toLowerCase().replace(' ', '-') || 'not-paid')}`}>
                      {selectedStudent.status === 'Admitted' ? 'Done' : (selectedStudent.paymentStatus || 'Not Paid')}
                    </span>
                    {selectedStudent.studentType === 'New Student' && selectedStudent.status !== 'Admitted' && selectedStudent.paymentStatus !== 'Paid' && (
                      <button 
                        className="pay-admission-btn"
                        onClick={() => navigate('/adminpaypage', { state: { admissionData: selectedStudent } })}
                      >
                        Pay Admission
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="track-details">
                <h3>Student Details</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <label>Full Name</label>
                    <span>{selectedStudent.name || selectedStudent.fullName || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Student Type</label>
                    <span className="student-type">{selectedStudent.studentType || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Sex</label>
                    <span>{selectedStudent.sex || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Date of Birth</label>
                    <span>{selectedStudent.dob || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Place of Birth</label>
                    <span>{selectedStudent.pob || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Father's Name</label>
                    <span>{selectedStudent.father || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Mother's Name</label>
                    <span>{selectedStudent.mother || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Guardian's Contact</label>
                    <span>{selectedStudent.guardian || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Previous Average</label>
                    <span>{selectedStudent.avg || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Form/Class</label>
                    <span>{selectedStudent.form || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Vocation Department</label>
                    <span>{selectedStudent.vocation || 'Not provided'}</span>
                  </div>
                </div>
                <div className="track-documents">
                  <h3>Submitted Documents</h3>
                  <div className="documents-grid">
                    <div className="document-item">
                      <label>Student Picture</label>
                      {selectedStudent.picture ? (
                        <img src={selectedStudent.picture} alt="Student" className="student-picture" />
                      ) : (
                        <span className="no-document">Not uploaded</span>
                      )}
                    </div>
                    {selectedStudent.studentType === 'New Student' && (
                      <div className="document-item">
                        <label>Interview Status</label>
                        {hasExistingInterview ? (
                          <button 
                            className="view-interview-btn"
                            onClick={() => setShowScheduleModal(true)}
                          >
                            View Interview Details
                          </button>
                        ) : (
                          <span className="no-document">No interview scheduled</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="track-timeline">
                  <h3>Application Timeline</h3>
                  <div className="timeline">
                    <div className={`timeline-item ${selectedStudent.status !== 'Rejected' ? 'active' : 'rejected'}`}>
                      <div className="timeline-point"></div>
                      <div className="timeline-content">
                        <h4>Application Submitted</h4>
                        <p>{new Date(selectedStudent.timestamp).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {selectedStudent.studentType === 'New Student' && (
                      <div className={`timeline-item ${selectedStudent.paymentStatus === 'Processing' || selectedStudent.status === 'Admitted' ? 'active' : ''}`}>
                        <div className="timeline-point"></div>
                        <div className="timeline-content">
                          <h4>Payment Status</h4>
                          <p>{selectedStudent.status === 'Admitted' ? 'Done' : selectedStudent.paymentStatus}</p>
                        </div>
                      </div>
                    )}
                    <div className={`timeline-item ${selectedStudent.status === 'Admitted' ? 'active' : ''}`}>
                      <div className="timeline-point"></div>
                      <div className="timeline-content">
                        <h4>Final Decision</h4>
                        <p>{selectedStudent.status === 'Admitted' ? 'Admitted' : 'Pending Review'}</p>
                        {selectedStudent.status === 'Admitted' && selectedStudent.studentType === 'New Student' && (
                          <>
                            {hasExistingInterview ? (
                              <div className="interview-status">
                                <p className="interview-booked-message">Interview has been booked</p>
                                <button 
                                  className="view-schedule-btn"
                                  onClick={() => setShowScheduleModal(true)}
                                >
                                  View Interview Details
                                </button>
                              </div>
                            ) : (
                              <button 
                                className="book-interview-btn"
                                onClick={() => {
                                  setAdmissionData(selectedStudent);
                                  setShowInterviewModal(true);
                                }}
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
                      className={`progress-fill status-${selectedStudent.status?.toLowerCase()}`} 
                      style={{ width: `${getProgressPercentage()}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
        {showInterviewModal && (
          <InterviewModal
            onClose={() => setShowInterviewModal(false)}
            onSubmit={handleBookInterview}
            admissionData={selectedStudent || admissionData}
          />
        )}
        {showScheduleModal && interviewSchedule && (
          <InterviewScheduleModal
            schedule={interviewSchedule}
            onClose={() => setShowScheduleModal(false)}
          />
        )}
      </div>
    );
  }

  if (!admissionData) {
    return (
      <div className="userad-wrapper">
        <AdminNav />
        <div className="no-application-container">
          <h2>No Student Data Found</h2>
          <p>Please register a student first.</p>
          <button 
            className="submit-application-btn"
            onClick={() => navigate('/adminreg')}
          >
            Register Student
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="userad-wrapper">
      <ToastContainer position="top-right" autoClose={3000} />
      <AdminNav />
      <main className="usertrack-main">
        <h2 className="userad-title-main">Student Admission Details</h2>
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
            {admissionData.studentType === 'New Student' && (
              <div className="status-box">
                <h3>Payment Status</h3>
                <span className={`status-badge status-${status === 'Admitted' ? 'done' : paymentStatus.toLowerCase().replace(' ', '-')}`}>
                  {status === 'Admitted' ? 'Done' : paymentStatus}
                </span>
                {admissionData.studentType === 'New Student' && status !== 'Admitted' && paymentStatus !== 'Paid' && (
                  <button 
                    className="pay-admission-btn"
                    onClick={() => navigate('/adminpaypage', { state: { admissionData } })}
                  >
                    Pay Admission
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="track-details">
            <h3>Student Details</h3>
            <div className="details-grid">
              <div className="detail-item">
                <label>Full Name</label>
                <span>{admissionData.name || admissionData.fullName || 'Not provided'}</span>
              </div>
              <div className="detail-item">
                <label>Student Type</label>
                <span className="student-type">{admissionData.studentType || 'Not provided'}</span>
              </div>
              <div className="detail-item">
                <label>Sex</label>
                <span>{admissionData.sex || 'Not provided'}</span>
              </div>
              <div className="detail-item">
                <label>Date of Birth</label>
                <span>{admissionData.dob || 'Not provided'}</span>
              </div>
              <div className="detail-item">
                <label>Place of Birth</label>
                <span>{admissionData.pob || 'Not provided'}</span>
              </div>
              <div className="detail-item">
                <label>Father's Name</label>
                <span>{admissionData.father || 'Not provided'}</span>
              </div>
              <div className="detail-item">
                <label>Mother's Name</label>
                <span>{admissionData.mother || 'Not provided'}</span>
              </div>
              <div className="detail-item">
                <label>Guardian's Contact</label>
                <span>{admissionData.guardian || 'Not provided'}</span>
              </div>
              <div className="detail-item">
                <label>Previous Average</label>
                <span>{admissionData.avg || 'Not provided'}</span>
              </div>
              <div className="detail-item">
                <label>Form/Class</label>
                <span>{admissionData.form || 'Not provided'}</span>
              </div>
              <div className="detail-item">
                <label>Vocation Department</label>
                <span>{admissionData.vocation || 'Not provided'}</span>
              </div>
            </div>
            <div className="track-documents">
              <h3>Submitted Documents</h3>
              <div className="documents-grid">
                <div className="document-item">
                  <label>Student Picture</label>
                  {admissionData.picture ? (
                    <img src={admissionData.picture} alt="Student" className="student-picture" />
                  ) : (
                    <span className="no-document">Not uploaded</span>
                  )}
                </div>
                {admissionData.studentType === 'New Student' && (
                  <div className="document-item">
                    <label>Interview Status</label>
                    {hasExistingInterview ? (
                      <button 
                        className="view-interview-btn"
                        onClick={() => setShowScheduleModal(true)}
                      >
                        View Interview Details
                      </button>
                    ) : (
                      <span className="no-document">No interview scheduled</span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="track-timeline">
              <h3>Application Timeline</h3>
              <div className="timeline">
                <div className={`timeline-item ${status !== 'Rejected' ? 'active' : 'rejected'}`}>
                  <div className="timeline-point"></div>
                  <div className="timeline-content">
                    <h4>Application Submitted</h4>
                    <p>{new Date(admissionData.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
                {admissionData.studentType === 'New Student' && (
                  <div className={`timeline-item ${paymentStatus === 'Processing' || status === 'Admitted' ? 'active' : ''}`}>
                    <div className="timeline-point"></div>
                    <div className="timeline-content">
                      <h4>Payment Status</h4>
                      <p>{status === 'Admitted' ? 'Done' : paymentStatus}</p>
                    </div>
                  </div>
                )}
                <div className={`timeline-item ${status === 'Admitted' ? 'active' : ''}`}>
                  <div className="timeline-point"></div>
                  <div className="timeline-content">
                    <h4>Final Decision</h4>
                    <p>{status === 'Admitted' ? 'Admitted' : 'Pending Review'}</p>
                    {status === 'Admitted' && admissionData.studentType === 'New Student' && (
                      <>
                        {hasExistingInterview ? (
                          <div className="interview-status">
                            <p className="interview-booked-message">Interview has been booked</p>
                            <button 
                              className="view-schedule-btn"
                              onClick={() => setShowScheduleModal(true)}
                            >
                              View Interview Details
                            </button>
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
          admissionData={selectedStudent || admissionData}
        />
      )}
      {showScheduleModal && interviewSchedule && (
        <InterviewScheduleModal
          schedule={interviewSchedule}
          onClose={() => setShowScheduleModal(false)}
        />
      )}
    </div>
  );
};

export default AdminTrack; 