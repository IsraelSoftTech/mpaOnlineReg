import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RiMenu3Line, RiCloseFill } from 'react-icons/ri';
import { PieChart } from 'react-minimal-pie-chart';
import { FaUserGraduate, FaMoneyBillWave, FaUserTimes, FaBuilding, FaUser, FaEdit, FaTrash, FaBan, FaCheck } from 'react-icons/fa';
import { IoNotificationsOutline } from 'react-icons/io5';
import { database } from '../../firebase';
import { ref, onValue, off, update, get, remove } from 'firebase/database';
import { AdmissionContext } from '../AdmissionContext';
import './Admin.css';
import logo from '../../assets/logo.png';

const Admin = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { accounts = [], admissions = [], currentUserData, allAdmissions = [] } = useContext(AdmissionContext) || {};
  const [rejectedStudents, setRejectedStudents] = useState([]);
  const [lastChecked, setLastChecked] = useState(() => {
    // Initialize with current time
    return {
      admissions: new Date().toISOString(),
      interviews: new Date().toISOString(),
      messages: new Date().toISOString(),
      payments: new Date().toISOString()
    };
  });
  const [stats, setStats] = useState({
    totalAccounts: 0,
    totalStudents: 0,
    rejectedStudents: [],
    totalRejected: 0,
    totalAmount: 0,
    thisWeekTotal: 0,
    lastWeekTotal: 0,
    weeklyGrowth: 0,
    totalDepartments: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const notificationRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Function to check if a timestamp is newer than lastChecked
  const isNewItem = (timestamp, type) => {
    if (!timestamp) return false;
    const itemDate = new Date(timestamp);
    const lastCheckedDate = new Date(lastChecked[type]);
    return itemDate > lastCheckedDate;
  };

  useEffect(() => {
    // Check if user is admin
    if (!currentUserData?.role === 'admin') {
      navigate('/signin');
      return;
    }

    // Listen for new data in multiple nodes
    const admissionsRef = ref(database, 'admissions');
    const interviewsRef = ref(database, 'interviews');
    const messagesRef = ref(database, 'messages');
    const paymentsRef = ref(database, 'payments');
    const departmentsRef = ref(database, 'departments');
    
    const handleNewData = (snapshot, type) => {
      const data = snapshot.val() || {};
      
      const items = Object.entries(data)
        .map(([id, item]) => ({
          id,
          ...item,
          type
        }))
        .filter(item => {
          // For messages, check status and timestamp
          if (type === 'messages') {
            return item.status === 'unread' && isNewItem(item.timestamp, type);
          }
          return isNewItem(item.timestamp, type);
        })
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      if (items.length > 0) {
        // Create notifications for new items
        const newNotifications = items.map(item => {
          let message = '';
          let route = '';
          
          switch(type) {
            case 'admissions':
              message = `New admission application from ${item.name || item.fullName}`;
              route = '/adminAdmission';
              break;
            case 'interviews':
              message = `New interview request from ${item.name}`;
              route = '/interviews';
              break;
            case 'messages':
              const preview = item.message ? 
                (item.message.length > 30 ? `${item.message.substring(0, 30)}...` : item.message) 
                : '';
              message = `New message from ${item.fullName}: ${preview}`;
              route = '/admincontact';
              break;
            case 'payments':
              message = `New payment received from ${item.studentName}`;
              route = '/adminpay';
              break;
            default:
              break;
          }

          return {
            id: item.id,
            message,
            timestamp: item.timestamp,
            type,
            route,
            read: false
          };
        });

        // Update notifications state with deduplication
        setNotifications(prev => {
          const existingIds = new Set(prev.map(n => n.id));
          const uniqueNewNotifications = newNotifications.filter(n => !existingIds.has(n.id));
          return [...uniqueNewNotifications, ...prev].slice(0, 50);
        });

        // Update unread count only for unique notifications
        setUnreadCount(prev => {
          const existingIds = new Set(notifications.map(n => n.id));
          const uniqueCount = newNotifications.filter(n => !existingIds.has(n.id)).length;
          return prev + uniqueCount;
        });

        // Update lastChecked timestamp
        setLastChecked(prev => ({
          ...prev,
          [type]: new Date().toISOString()
        }));
      }
    };

    // Set up listeners for each node with error handling
    const setupListener = (ref, type) => {
      onValue(ref, 
        snapshot => handleNewData(snapshot, type),
        error => console.error(`Error in ${type} listener:`, error)
      );
    };

    setupListener(messagesRef, 'messages');
    setupListener(admissionsRef, 'admissions');
    setupListener(interviewsRef, 'interviews');
    setupListener(paymentsRef, 'payments');
    
    // Listen for departments count
    onValue(departmentsRef, snapshot => {
      const data = snapshot.val() || {};
      const departmentsCount = Object.keys(data).length;
      setStats(prev => ({
        ...prev,
        totalDepartments: departmentsCount
      }));
    });

    return () => {
      // Clean up listeners
      off(admissionsRef);
      off(interviewsRef);
      off(messagesRef);
      off(paymentsRef);
      off(departmentsRef);
    };
  }, [currentUserData, navigate, notifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showNotifications &&
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const handleNotificationClick = async (notification) => {
    // Mark notification as read
    const updatedNotifications = notifications.map(n => 
      n.id === notification.id ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);
    setUnreadCount(prev => Math.max(0, prev - 1));

    // Navigate to appropriate route
    navigate(notification.route);
    setShowNotifications(false);
  };

  useEffect(() => {
    // Calculate statistics when data changes
    if (Array.isArray(accounts) && Array.isArray(admissions)) {
      const totalAccounts = accounts.length;
      
      // Total students is simply the count of all admissions
      const totalStudents = admissions.length;
      
      // Calculate rejected students - count all entries with 'Rejected' status
      const rejectedStudents = admissions.filter(student => student.status === 'Rejected');
      const totalRejected = rejectedStudents.length;
      
      // Calculate total amount from payments
      const totalAmount = admissions.reduce((sum, admission) => {
        const paymentAmount = admission.paymentDetails?.amount || 0;
        return sum + Number(paymentAmount);
      }, 0);

      // Get current date and start/end of weeks for comparison
      const now = new Date();
      
      // Current week (Sunday to current day)
      const startOfThisWeek = new Date(now);
      startOfThisWeek.setHours(0, 0, 0, 0);
      startOfThisWeek.setDate(now.getDate() - now.getDay());

      // Last week (previous Sunday to Saturday)
      const startOfLastWeek = new Date(startOfThisWeek);
      startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
      const endOfLastWeek = new Date(startOfThisWeek);
      endOfLastWeek.setMilliseconds(-1);

      // Count admissions submitted in current week and last week
      const thisWeekAdmissions = admissions.filter(admission => {
        const submissionDate = new Date(admission.submittedAt || admission.timestamp);
        return submissionDate >= startOfThisWeek && submissionDate <= now;
      });

      const lastWeekAdmissions = admissions.filter(admission => {
        const submissionDate = new Date(admission.submittedAt || admission.timestamp);
        return submissionDate >= startOfLastWeek && submissionDate < startOfThisWeek;
      });

      const thisWeekTotal = thisWeekAdmissions.length;
      const lastWeekTotal = lastWeekAdmissions.length;

      // Calculate weekly growth percentage
      const weeklyGrowth = lastWeekTotal > 0 
        ? Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100)
        : thisWeekTotal > 0 ? 100 : 0;

      setStats(prevStats => ({
        ...prevStats,
        totalAccounts,
        totalStudents,
        rejectedStudents,
        totalRejected,
        totalAmount,
        thisWeekTotal,
        lastWeekTotal,
        weeklyGrowth
      }));

      setIsLoading(false);
    }
  }, [accounts, admissions]);

  const toggleMenu = () => setIsMenuOpen((open) => !open);

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
    // Implement edit functionality
    console.log('Edit account:', accountId);
  };

  // Add useEffect to fetch rejected students from admissions
  useEffect(() => {
    const admissionsRef = ref(database, 'admissions');
    
    const unsubscribe = onValue(admissionsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const rejectedList = Object.entries(data)
            .map(([id, admission]) => ({
              id,
              ...admission
            }))
            .filter(student => student.status === 'rejected')
            .sort((a, b) => new Date(b.timestamp || b.submittedAt || b.date) - new Date(a.timestamp || a.submittedAt || a.date));
          
          setRejectedStudents(rejectedList);
          
          // Update stats
          setStats(prev => ({
            ...prev,
            totalRejected: rejectedList.length,
            rejectedStudents: rejectedList
          }));
        } else {
          setRejectedStudents([]);
        }
      } catch (error) {
        console.error('Error fetching rejected students:', error);
        setRejectedStudents([]);
      }
    });

    return () => unsubscribe();
  }, []);

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
            className={`app-nav-link${location.pathname === '/interviews' ? ' active' : ''}`}
            onClick={() => navigate('/interviews')}
          >
            Interviews
          </button>
          <button 
            className={`app-nav-link${location.pathname === '/admincontact' ? ' active' : ''}`}
            onClick={() => navigate('/admincontact')}
          >
            Contact
          </button>
          <div className="notification-container" ref={notificationRef}>
            <button
              className="notification-bell"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <IoNotificationsOutline size={24} />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>
            {showNotifications && (
              <div className="notifications-dropdown">
                <h3>Notifications</h3>
                {notifications.length === 0 ? (
                  <p className="no-notifications">No new notifications</p>
                ) : (
                  <div className="notifications-list">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="notification-content">
                          <p className="notification-text">{notification.message}</p>
                          <span className="notification-time">
                            {new Date(notification.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <button className="app-nav-link logout" onClick={() => navigate('/signin')}>Log out</button>
        </nav>
      </header>
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
            <div className="admin-stat-label">Weekly Registration Comparison</div>
            <div className="admin-weekly-comparison">
              <div className="admin-week-stat">
                <PieChart
                  data={[
                    { title: 'Last Week', value: stats.lastWeekTotal, color: '#2196f3' },
                    { title: 'Max', value: Math.max(stats.lastWeekTotal, stats.thisWeekTotal) - stats.lastWeekTotal, color: '#e0e0e0' },
                  ]}
                  lineWidth={20}
                  rounded
                  startAngle={180}
                  totalValue={Math.max(stats.lastWeekTotal, stats.thisWeekTotal)}
                  lengthAngle={180}
                  style={{ height: '40px', width: '40px' }}
                />
                <div className="admin-week-info">
                  <span className="admin-week-label">Last Week</span>
                  <span className="admin-week-value">{stats.lastWeekTotal}</span>
                </div>
              </div>
              <div className="admin-week-stat">
                <PieChart
                  data={[
                    { title: 'This Week', value: stats.thisWeekTotal, color: '#4caf50' },
                    { title: 'Max', value: Math.max(stats.lastWeekTotal, stats.thisWeekTotal) - stats.thisWeekTotal, color: '#e0e0e0' },
                  ]}
                  lineWidth={20}
                  rounded
                  startAngle={180}
                  totalValue={Math.max(stats.lastWeekTotal, stats.thisWeekTotal)}
                  lengthAngle={180}
                  style={{ height: '40px', width: '40px' }}
                />
                <div className="admin-week-info">
                  <span className="admin-week-label">This Week</span>
                  <span className="admin-week-value">{stats.thisWeekTotal}</span>
                </div>
              </div>
              <div className="admin-growth-indicator">
                <span className={`growth-value ${stats.weeklyGrowth >= 0 ? 'positive' : 'negative'}`}>
                  {stats.weeklyGrowth >= 0 ? '+' : ''}{stats.weeklyGrowth}%
                </span>
                <span className="growth-label">weekly growth</span>
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
                {rejectedStudents.map((student) => (
                  <tr key={student.id}>
                    <td>{student.fullName || student.name}</td>
                    <td>{student.class || student.form}</td>
                    <td>{student.rejectionReason || student.reason || 'No reason provided'}</td>
                    <td>{new Date(student.timestamp || student.submittedAt || student.date).toLocaleDateString()}</td>
                  </tr>
                ))}
                {rejectedStudents.length === 0 && (
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
                {accounts.map((account) => (
                  <tr key={account.id}>
                    <td>{account.username}</td>
                    <td>{account.email}</td>
                    <td>{account.password}</td>
                    <td>
                      <span className={`status-badge ${account.suspended ? 'suspended' : 'active'}`}>
                        {account.suspended ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td className="action-buttons">
                      <button 
                        className="edit-btn"
                        onClick={() => handleEditAccount(account.id)}
                        title="Edit account"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className={`suspend-btn ${account.suspended ? 'uplift' : ''}`}
                        onClick={() => handleSuspendAccount(account.id, account.suspended)}
                        title={account.suspended ? 'Uplift suspension' : 'Suspend account'}
                      >
                        {account.suspended ? <FaCheck /> : <FaBan />}
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteAccount(account.id)}
                        title="Delete account"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
                {accounts.length === 0 && (
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