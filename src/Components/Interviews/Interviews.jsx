import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { database } from '../../firebase';
import { ref, onValue, off, update, push, remove } from 'firebase/database';
import { AdmissionContext } from '../AdmissionContext';
import { FaTrash } from 'react-icons/fa';
import AdminNav from '../Admin/AdminNav';
import './Interviews.css';

const Interviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [interviewToDelete, setInterviewToDelete] = useState(null);
  const { currentUserData } = useContext(AdmissionContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    if (!currentUserData?.role === 'admin') {
      navigate('/signin');
      return;
    }

    // Fetch interviews
    const interviewsRef = ref(database, 'interviews');
    
    const handleData = (snapshot) => {
      const data = snapshot.val() || {};
      const interviewsList = Object.entries(data)
        .map(([id, interview]) => ({
          id,
          ...interview,
        }))
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      setInterviews(interviewsList);
    };

    onValue(interviewsRef, handleData);

    return () => off(interviewsRef);
  }, [currentUserData, navigate]);

  const handleDelete = async (interviewId) => {
    try {
      const interviewRef = ref(database, `interviews/${interviewId}`);
      await remove(interviewRef);

      // Create notification for user about interview deletion
      const interview = interviews.find(i => i.id === interviewId);
      if (interview) {
        const notificationsRef = ref(database, 'notifications');
        await push(notificationsRef, {
          type: 'interview_deleted',
          userId: interview.username,
          message: 'Your interview request has been cancelled by the administrator',
          timestamp: new Date().toISOString(),
          read: false
        });
      }

      toast.success('Interview deleted successfully');
      setShowDeleteConfirmModal(false);
      setInterviewToDelete(null);
    } catch (error) {
      console.error('Error deleting interview:', error);
      toast.error('Failed to delete interview');
    }
  };

  const handleSchedule = async (interviewId, scheduleData) => {
    try {
      // Update interview with schedule
      const interviewRef = ref(database, `interviews/${interviewId}`);
      await update(interviewRef, {
        ...scheduleData,
        status: 'Scheduled'
      });

      // Create notification for user
      const notificationsRef = ref(database, 'notifications');
      await push(notificationsRef, {
        type: 'interview_schedule',
        userId: selectedInterview.username,
        message: `Your interview has been scheduled for ${new Date(scheduleData.date).toLocaleDateString()} at ${scheduleData.time}`,
        timestamp: new Date().toISOString(),
        read: false,
        interviewId
      });

      toast.success('Interview scheduled successfully');
      setShowScheduleModal(false);
      setSelectedInterview(null);
    } catch (error) {
      console.error('Error scheduling interview:', error);
      toast.error('Failed to schedule interview');
    }
  };

  const ScheduleModal = ({ interview, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
      date: '',
      time: '',
      mode: 'video',
      link: '',
      notes: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(interview.id, formData);
    };

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Schedule Interview</h2>
          <div className="interview-details">
            <p><strong>Student:</strong> {interview.name}</p>
            <p><strong>Class:</strong> {interview.class}</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Date:</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="form-group">
              <label>Time:</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Mode:</label>
              <select
                value={formData.mode}
                onChange={(e) => setFormData({...formData, mode: e.target.value})}
                required
              >
                <option value="video">Video Call</option>
                <option value="audio">Audio Call</option>
                <option value="in-person">In Person</option>
              </select>
            </div>
            <div className="form-group">
              <label>Meeting Link (if applicable):</label>
              <input
                type="text"
                value={formData.link}
                onChange={(e) => setFormData({...formData, link: e.target.value})}
                placeholder="Enter meeting link"
              />
            </div>
            <div className="form-group">
              <label>Additional Notes:</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Any additional information"
              />
            </div>
            <div className="modal-buttons">
              <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
              <button type="submit" className="submit-btn">Schedule Interview</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const DeleteConfirmModal = ({ interview, onClose, onConfirm }) => (
    <div className="modal-overlay">
      <div className="modal-content delete-confirm-modal">
        <h2>Delete Interview</h2>
        <div className="delete-confirm-content">
          <p>Are you sure you want to delete this interview request?</p>
          <div className="interview-delete-details">
            <p><strong>Student:</strong> {interview.name}</p>
            <p><strong>Class:</strong> {interview.class}</p>
            <p><strong>Request Date:</strong> {new Date(interview.timestamp).toLocaleDateString()}</p>
          </div>
          <p className="delete-warning">This action cannot be undone.</p>
        </div>
        <div className="modal-buttons">
          <button onClick={onClose} className="cancel-btn">Cancel</button>
          <button 
            onClick={() => onConfirm(interview.id)} 
            className="interview-delete-btn"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="interviews-wrapper">
      <AdminNav />
      <main className="interviews-main">
        <ToastContainer position="top-right" autoClose={3000} />
        <h2>Interview Requests</h2>
        <div className="interviews-container">
          <div className="interviews-list">
            {interviews.length === 0 ? (
              <p className="no-interviews">No interview requests found</p>
            ) : (
              <table className="interviews-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Class</th>
                    <th>Request Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {interviews.map((interview) => (
                    <tr key={interview.id} className={interview.status === 'Scheduled' ? 'scheduled' : ''}>
                      <td>{interview.name}</td>
                      <td>{interview.class}</td>
                      <td>{new Date(interview.timestamp).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-badge status-${interview.status.toLowerCase()}`}>
                          {interview.status}
                        </span>
                      </td>
                      <td className="action-buttons">
                        {interview.status !== 'Scheduled' ? (
                          <button
                            type="button"
                            className="interview-schedule-btn"
                            onClick={() => {
                              setSelectedInterview(interview);
                              setShowScheduleModal(true);
                            }}
                          >
                            Schedule
                          </button>
                        ) : (
                          <div className="schedule-info">
                            <p>Date: {new Date(interview.date).toLocaleDateString()}</p>
                            <p>Time: {interview.time}</p>
                            <p>Mode: {interview.mode}</p>
                          </div>
                        )}
                        <button
                          type="button"
                          className="interview-delete-btn"
                          onClick={() => {
                            setInterviewToDelete(interview);
                            setShowDeleteConfirmModal(true);
                          }}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {showScheduleModal && selectedInterview && (
            <ScheduleModal
              interview={selectedInterview}
              onClose={() => {
                setShowScheduleModal(false);
                setSelectedInterview(null);
              }}
              onSubmit={handleSchedule}
            />
          )}
          {showDeleteConfirmModal && interviewToDelete && (
            <DeleteConfirmModal
              interview={interviewToDelete}
              onClose={() => {
                setShowDeleteConfirmModal(false);
                setInterviewToDelete(null);
              }}
              onConfirm={handleDelete}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Interviews; 