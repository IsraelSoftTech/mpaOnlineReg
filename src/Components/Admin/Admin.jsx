import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart } from 'react-minimal-pie-chart';
import { FaUserGraduate, FaMoneyBillWave, FaUserTimes, FaBuilding, FaUser, FaEdit, FaTrash, FaBan, FaCheck } from 'react-icons/fa';
import { database } from '../../firebase';
import { ref, onValue, off, update, remove } from 'firebase/database';
import { AdmissionContext } from '../AdmissionContext';
import AdminNav from './AdminNav';
import './Admin.css';

const Admin = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUserData } = useContext(AdmissionContext) || {};
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalAmount: 0,
    totalRejected: 0,
    totalDepartments: 0,
    totalAccounts: 0
  });
  const [rejectedStudents, setRejectedStudents] = useState([]);
  const [accountsList, setAccountsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const [weeklyStats, setWeeklyStats] = useState({
    today: 0,
    yesterday: 0,
    percentage: 0,
    growth: 0
  });

  useEffect(() => {
    // Check if user is admin
    if (!currentUserData?.role === 'admin') {
      navigate('/signin');
      return;
    }

    // Set up database listeners
    const admissionsRef = ref(database, 'admissions');
    const paymentsRef = ref(database, 'payments');
    const departmentsRef = ref(database, 'departments');
    const accountsRef = ref(database, 'accounts');
    
    // Listen for admissions data
    onValue(admissionsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const admissionsArray = Object.values(data);
      const rejectedOnes = admissionsArray.filter(student => student.status?.toLowerCase() === 'rejected');
      
      // Calculate daily statistics
      const now = new Date();
      const today = now.toDateString();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toDateString();

      const todayAdmissions = admissionsArray.filter(admission => {
        const admissionDate = new Date(admission.timestamp || admission.submittedAt || admission.date);
        return admissionDate.toDateString() === today;
      }).length;

      const yesterdayAdmissions = admissionsArray.filter(admission => {
        const admissionDate = new Date(admission.timestamp || admission.submittedAt || admission.date);
        return admissionDate.toDateString() === yesterdayString;
      }).length;

      // Calculate percentages
      const total = todayAdmissions + yesterdayAdmissions;
      const todayPercentage = total > 0 ? (todayAdmissions / total) * 100 : 0;
      const growth = yesterdayAdmissions > 0 
        ? ((todayAdmissions - yesterdayAdmissions) / yesterdayAdmissions) * 100 
        : todayAdmissions > 0 ? 100 : 0;

      setWeeklyStats({
        today: todayAdmissions,
        yesterday: yesterdayAdmissions,
        percentage: todayPercentage,
        growth
      });

      setStats(prev => ({
        ...prev,
        totalStudents: admissionsArray.length,
        totalRejected: rejectedOnes.length
      }));

      // Update rejected students list
      const rejectedList = rejectedOnes.map(student => ({
        name: student.name || student.fullName,
        class: student.class || student.form,
        reason: student.rejectionReason || student.reason || 'No reason provided',
        date: student.timestamp || student.submittedAt || student.date
      }));
      setRejectedStudents(rejectedList);
    });

    // Listen for payments data
    onValue(paymentsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const paymentsCount = Object.keys(data).length;
      setStats(prev => ({
        ...prev,
        totalAmount: paymentsCount * 2000
      }));
    });

    // Listen for departments data
    onValue(departmentsRef, (snapshot) => {
      const data = snapshot.val() || {};
      setStats(prev => ({
          ...prev,
        totalDepartments: Object.keys(data).length
      }));
    });

    // Listen for accounts data
    onValue(accountsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const accountsArray = Object.entries(data).map(([id, account]) => ({
        id,
        ...account
      }));
      setAccountsList(accountsArray);
      setStats(prev => ({
        ...prev,
        totalAccounts: accountsArray.length
      }));
    });

    setIsLoading(false);

    // Cleanup listeners
    return () => {
      off(admissionsRef);
      off(paymentsRef);
      off(departmentsRef);
      off(accountsRef);
    };
  }, [currentUserData, navigate]);

  const handleSuspendAccount = async (accountId, isSuspended) => {
    try {
      const accountRef = ref(database, `accounts/${accountId}`);
      await update(accountRef, { suspended: !isSuspended });
    } catch (err) {
      console.error('Error updating account status:', err);
    }
  };

  const handleDeleteAccount = async (accountId) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        const accountRef = ref(database, `accounts/${accountId}`);
        await remove(accountRef);
      } catch (err) {
        console.error('Error deleting account:', err);
      }
    }
  };

  const handleEditAccount = async (accountId) => {
    // Navigate to edit page or show edit modal
    console.log('Edit account:', accountId);
  };

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

  if (isLoading) {
    return (
      <div className="admin-wrapper">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-wrapper">
      <AdminNav />
      <main className="admin-main">
        <h2 className="admin-overview-title">Overview</h2>
        <div className="admin-stats-grid">
          <div className="admin-stat-card green">
            <div className="admin-stat-icon"><FaUserGraduate /></div>
            <div className="admin-stat-label">Total Students</div>
            <div className="admin-stat-value">{stats.totalStudents}</div>
          </div>
          <div className="admin-stat-card pink">
            <div className="admin-stat-icon"><FaMoneyBillWave /></div>
            <div className="admin-stat-label">Total Amount</div>
            <div className="admin-stat-value">{stats.totalAmount.toLocaleString()} XAF</div>
          </div>
          <div className="admin-stat-card yellow">
            <div className="admin-stat-icon"><FaUserTimes /></div>
            <div className="admin-stat-label">Rejected students</div>
            <div className="admin-stat-value">{stats.totalRejected}</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">Daily Registration Comparison</div>
            <div className="admin-weekly-comparison">
              <div className="pie-chart-container" style={{ height: '150px', marginBottom: '16px' }}>
                <PieChart
                  data={[
                    { title: 'Today', value: weeklyStats.today, color: '#4caf50' },
                    { title: 'Yesterday', value: weeklyStats.yesterday, color: '#2196f3' }
                  ]}
                  lineWidth={20}
                  rounded
                  animate
                  label={({ dataEntry }) => `${Math.round(dataEntry.percentage)}%`}
                  labelStyle={{
                    fontSize: '8px',
                    fontFamily: 'sans-serif',
                    fill: '#fff'
                  }}
                />
              </div>
              <div className="chart-legend">
                <div className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: '#4caf50' }}></span>
                  <span className="legend-label">Today ({weeklyStats.today})</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: '#2196f3' }}></span>
                  <span className="legend-label">Yesterday ({weeklyStats.yesterday})</span>
                </div>
              </div>
              <div className="admin-growth-indicator">
                <span className={`growth-value ${weeklyStats.growth >= 0 ? 'positive' : 'negative'}`}>
                  {weeklyStats.growth >= 0 ? '+' : ''}{Math.round(weeklyStats.growth)}%
                </span>
                <span className="growth-label">daily growth</span>
              </div>
            </div>
          </div>
          <div className="admin-stat-card green">
            <div className="admin-stat-icon"><FaBuilding /></div>
            <div className="admin-stat-label">Total Departments</div>
            <div className="admin-stat-value">{stats.totalDepartments}</div>
          </div>
          <div className="admin-stat-card yellow">
            <div className="admin-stat-icon"><FaUser /></div>
            <div className="admin-stat-label">Total Accounts</div>
            <div className="admin-stat-value">{stats.totalAccounts}</div>
          </div>
        </div>
        <section className="admin-rejected-section">
          <h3 className="admin-rejected-title">Rejected Students</h3>
          <div className="table-container">
            <table className="admin-table">
            <thead>
              <tr>
                  <th>Name</th>
                  <th>Class</th>
                  <th>Reason for Rejection</th>
                  <th>Date</th>
              </tr>
            </thead>
            <tbody>
                {rejectedStudents.length > 0 ? (
                  rejectedStudents.map((student, index) => (
                    <tr key={index}>
                      <td>{student.name}</td>
                      <td>{student.class}</td>
                      <td>{student.reason}</td>
                      <td>{new Date(student.date).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="no-data">No rejected students</td>
                </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
        <section className="admin-section">
          <h2>User Accounts</h2>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Password</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {accountsList.length > 0 ? (
                  accountsList.map((account) => (
                    <tr key={account.id}>
                      <td>{account.username}</td>
                      <td>{account.email}</td>
                      <td>{account.password}</td>
                      <td>
                        <span className={`status-badge ${account.suspended ? 'suspended' : 'active'}`}>
                          {account.suspended ? 'Suspended' : 'Active'}
                        </span>
                      </td>
                      <td className="admin-account-actions">
                        <button 
                          className="admin-action-btn admin-edit-btn"
                          onClick={() => handleEditAccount(account.id)}
                          title="Edit account"
                        >
                          <FaEdit className="admin-action-icon" />
                        </button>
                        <button 
                          className={`admin-action-btn admin-suspend-btn ${account.suspended ? 'uplift' : ''}`}
                          onClick={() => handleSuspendAccount(account.id, account.suspended)}
                          title={account.suspended ? 'Uplift suspension' : 'Suspend account'}
                        >
                          {account.suspended ? <FaCheck className="admin-action-icon" /> : <FaBan className="admin-action-icon" />}
                        </button>
                        <button 
                          className="admin-action-btn admin-delete-btn"
                          onClick={() => handleDeleteAccount(account.id)}
                          title="Delete account"
                        >
                          <FaTrash className="admin-action-icon" />
                        </button>
                  </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="no-data">No accounts found</td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Admin; 