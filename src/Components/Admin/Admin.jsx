import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RiMenu3Line, RiCloseFill } from 'react-icons/ri';
import { PieChart } from 'react-minimal-pie-chart';
import { FaUserGraduate, FaMoneyBillWave, FaUserTimes, FaBuilding, FaUser, FaEdit } from 'react-icons/fa';
import { AdmissionContext } from '../AdmissionContext';
import './Admin.css';
import logo from '../../assets/logo.png';

const Admin = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { accounts, admissions } = useContext(AdmissionContext);
  const [stats, setStats] = useState({
    totalAccounts: 0,
    totalStudents: 0,
    rejectedStudents: [],
    totalRejected: 0,
    totalAmount: 0,
    thisWeekTotal: 0,
    lastWeekTotal: 0,
    weeklyGrowth: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Calculate statistics when data changes
    if (Array.isArray(accounts) && Array.isArray(admissions)) {
      const totalAccounts = accounts.length;
      const totalStudents = admissions.length;
      const rejectedStudents = admissions.filter(student => student.status === 'Rejected');
      const totalRejected = rejectedStudents.length;
      
      // Calculate total amount
      const totalAmount = admissions.reduce((sum, admission) => {
        const paymentAmount = admission.payment?.amount || 0;
        return sum + paymentAmount;
      }, 0);

      // Get current date and start of weeks
      const now = new Date();
      const startOfThisWeek = new Date(now);
      startOfThisWeek.setHours(0, 0, 0, 0);
      startOfThisWeek.setDate(now.getDate() - now.getDay()); // Start from Sunday

      const startOfLastWeek = new Date(startOfThisWeek);
      startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);
      const endOfLastWeek = new Date(startOfThisWeek);
      endOfLastWeek.setMilliseconds(-1);

      // Filter admissions for current week and last week
      const thisWeekAdmissions = admissions.filter(admission => {
        const admissionDate = new Date(admission.timestamp);
        return admissionDate >= startOfThisWeek && admissionDate <= now;
      });

      const lastWeekAdmissions = admissions.filter(admission => {
        const admissionDate = new Date(admission.timestamp);
        return admissionDate >= startOfLastWeek && admissionDate <= endOfLastWeek;
      });

      const thisWeekTotal = thisWeekAdmissions.length;
      const lastWeekTotal = lastWeekAdmissions.length;

      // Calculate weekly growth percentage
      const weeklyGrowth = lastWeekTotal > 0 
        ? Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100)
        : thisWeekTotal > 0 ? 100 : 0;

      setStats({
        totalAccounts,
        totalStudents,
        rejectedStudents,
        totalRejected,
        totalAmount,
        thisWeekTotal,
        lastWeekTotal,
        weeklyGrowth
      });

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
            className={`app-nav-link${location.pathname === '/admincontact' ? ' active' : ''}`}
            onClick={() => navigate('/admincontact')}
          >
            Contact
          </button>
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
            <div className="admin-stat-value"><span className="admin-edit-icon"><FaEdit /></span>10</div>
          </div>
          <div className="admin-stat-card yellow">
            <div className="admin-stat-icon"><FaUser /></div>
            <div className="admin-stat-label">Total Accounts</div>
            <div className="admin-stat-value">{stats.totalAccounts}</div>
          </div>
        </div>
        <section className="admin-rejected-section">
          <h3 className="admin-rejected-title">Rejected Students</h3>
          <table className="admin-rejected-table">
            <thead>
              <tr>
                <th>Names</th>
                <th>Reason(s) for Rejection</th>
              </tr>
            </thead>
            <tbody>
              {stats.rejectedStudents.map((student, idx) => (
                <tr key={idx}>
                  <td>{student.name || student.fullName}</td>
                  <td>{student.rejectionReason || 'No reason provided'}</td>
                </tr>
              ))}
              {stats.rejectedStudents.length === 0 && (
                <tr>
                  <td colSpan="2" style={{ textAlign: 'center', padding: '20px' }}>
                    No rejected applications
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
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

export default Admin; 