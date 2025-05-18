import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPrint } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AdminAdmission.css';
import { AdmissionContext } from '../AdmissionContext';
import PrintClassList from './PrintClassList';
import { database } from '../../firebase';
import { ref, update, onValue, off } from 'firebase/database';
import AdminNav from '../Admin/AdminNav';

const AdminAdmission = () => {
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { currentUserData } = useContext(AdmissionContext);

  const [admissions, setAdmissions] = useState([]);

  // Real-time admissions fetch
  useEffect(() => {
    if (!currentUserData?.role === 'admin') {
      navigate('/signin');
      return;
    }

    setIsLoading(true);
    setError(null);

    const admissionsRef = ref(database, 'admissions');
    
    const handleData = (snapshot) => {
      try {
        const data = snapshot.val() || {};
        const admissionsList = Object.entries(data)
          .map(([id, admission]) => ({
            id,
            fullName: admission.name || 'N/A',
            ...admission
          }))
          .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
        setAdmissions(admissionsList);
        setIsLoading(false);
      } catch (error) {
        setError('Error loading admissions data');
        setIsLoading(false);
        toast.error('Failed to load admissions data');
      }
    };

    const handleError = (error) => {
      setError('Error connecting to database');
      setIsLoading(false);
      toast.error('Failed to connect to database');
    };

    onValue(admissionsRef, handleData, handleError);

    return () => off(admissionsRef);
  }, [currentUserData, navigate]);

  const handleStatusUpdate = async (admissionId, newStatus) => {
    try {
      const admissionRef = ref(database, `admissions/${admissionId}`);
      const updateData = {
        status: newStatus,
        lastUpdated: new Date().toISOString()
      };

      // If status is Admitted, ensure payment status is set to Done
      if (newStatus === 'Admitted') {
        updateData.paymentStatus = 'Done';
      }

      await update(admissionRef, updateData);
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="adminad-wrapper">
      <AdminNav />
      <main className="adminad-main">
        <div className="admin-content">
          <div className="admin-header-head">
            <h2>Admissions Management</h2>
            <button 
              className="print-button" 
              onClick={() => setShowPrintDialog(true)}
              disabled={isLoading || admissions.length === 0}
            >
              <FaPrint /> Print Class List
            </button>
          </div>

          {isLoading ? (
            <div className="loading-state">
              <div className="loader"></div>
              <p>Loading admissions data...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>Retry</button>
            </div>
          ) : admissions.length === 0 ? (
            <div className="empty-state">
              <p>No admissions found</p>
            </div>
          ) : (
            <div className="admissions-table-wrapper">
              <table className="admissions-table">
                <thead>
                  <tr>
                    <th>Picture</th>
                    <th>Full Name</th>
                    <th>Sex</th>
                    <th>Date of Birth</th>
                    <th>Place of Birth</th>
                    <th>Father's Name</th>
                    <th>Mother's Name</th>
                    <th>Guardian's Contact</th>
                    <th>Previous Average</th>
                    <th>Form/Class</th>
                    <th>Vocation Department</th>
                    <th>Report Card</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admissions.map(admission => (
                    <tr key={admission.id}>
                      <td>
                        {admission.picture ? (
                          <img 
                            src={admission.picture} 
                            alt={admission.fullName} 
                            className="student-picture"
                          />
                        ) : (
                          <span className="no-picture">No Picture</span>
                        )}
                      </td>
                      <td>{admission.fullName || 'N/A'}</td>
                      <td>{admission.sex || 'N/A'}</td>
                      <td>{admission.dob || 'N/A'}</td>
                      <td>{admission.pob || 'N/A'}</td>
                      <td>{admission.father || 'N/A'}</td>
                      <td>{admission.mother || 'N/A'}</td>
                      <td>{admission.guardian || 'N/A'}</td>
                      <td>{admission.avg || 'N/A'}</td>
                      <td>{admission.form || 'N/A'}</td>
                      <td>{admission.vocation || 'N/A'}</td>
                      <td>
                        {admission.report ? (
                          <a 
                            href={admission.report}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="report-link"
                            download
                          >
                            Download
                          </a>
                        ) : (
                          <span className="no-report">No Report</span>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge status-${(admission.status || 'pending').toLowerCase()}`}>
                          {admission.status || 'Pending'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons-admission">
                          {admission.status !== 'Admitted' && (
                            <button
                              className="admission-admit-btn"
                              onClick={() => handleStatusUpdate(admission.id, 'Admitted')}
                            >
                              Admit
                            </button>
                          )}
                          {admission.status !== 'Rejected' && (
                            <button
                              className="admission-reject-btn"
                              onClick={() => handleStatusUpdate(admission.id, 'Rejected')}
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {showPrintDialog && (
        <PrintClassList
          onClose={() => setShowPrintDialog(false)}
          admissions={admissions.filter(a => a.status === 'Admitted')}
        />
      )}
    </div>
  );
};

export default AdminAdmission; 