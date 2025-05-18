import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RiMenu3Line, RiCloseFill } from 'react-icons/ri';
import { IoNotificationsOutline } from 'react-icons/io5';
import { database } from '../../firebase';
import { ref, onValue, off } from 'firebase/database';
import logo from '../../assets/logo.png';
import './AdminNav.css';

const AdminNav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastChecked, setLastChecked] = useState({
    admissions: new Date().toISOString(),
    interviews: new Date().toISOString(),
    messages: new Date().toISOString(),
    payments: new Date().toISOString()
  });
  
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const notificationRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Function to check if a timestamp is newer than lastChecked
  const isNewItem = (timestamp, type) => {
    return new Date(timestamp) > new Date(lastChecked[type]);
  };

  useEffect(() => {
    // Listen for new data in multiple nodes
    const admissionsRef = ref(database, 'admissions');
    const interviewsRef = ref(database, 'interviews');
    const messagesRef = ref(database, 'messages');
    const paymentsRef = ref(database, 'payments');
    
    const handleNewData = (snapshot, type) => {
      const data = snapshot.val() || {};
      const items = Object.entries(data)
        .map(([id, item]) => ({
          id,
          ...item,
          type // Add type to identify the source
        }))
        .filter(item => isNewItem(item.timestamp, type))
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
              message = `New message from ${item.name}: ${item.subject}`;
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

        setNotifications(prev => [...newNotifications, ...prev]);
        setUnreadCount(prev => prev + newNotifications.length);
        
        // Update lastChecked timestamp for this type
        setLastChecked(prev => ({
          ...prev,
          [type]: new Date().toISOString()
        }));
      }
    };

    // Set up listeners for each node
    onValue(admissionsRef, snapshot => handleNewData(snapshot, 'admissions'));
    onValue(interviewsRef, snapshot => handleNewData(snapshot, 'interviews'));
    onValue(messagesRef, snapshot => handleNewData(snapshot, 'messages'));
    onValue(paymentsRef, snapshot => handleNewData(snapshot, 'payments'));

    return () => {
      // Clean up listeners
      off(admissionsRef);
      off(interviewsRef);
      off(messagesRef);
      off(paymentsRef);
    };
  }, []);

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

  const toggleMenu = () => setIsMenuOpen((open) => !open);

  return (
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
          className={`app-nav-link${location.pathname === '/interviews' ? ' active' : ''}`}
          onClick={() => navigate('/interviews')}
        >
          Interviews
        </button>
        <button 
          className={`app-nav-link${location.pathname === '/admincontact' ? ' active' : ''}`}
          onClick={() => navigate('/admincontact')}
        >
          Messages
        </button>
      </nav>
      <div className="notification-container">
        <button
          className="notification-button"
          onClick={() => setShowNotifications(!showNotifications)}
          aria-label="Toggle notifications"
        >
          <IoNotificationsOutline size={24} />
          {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
        </button>
        {showNotifications && (
          <div ref={notificationRef} className="notification-dropdown">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <p>{notification.message}</p>
                  <small>{new Date(notification.timestamp).toLocaleString()}</small>
                </div>
              ))
            ) : (
              <div className="no-notifications">No new notifications</div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default AdminNav; 