import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoNotificationsOutline, IoCloseOutline } from 'react-icons/io5';
import { ref, onValue, query, orderByChild, limitToLast } from 'firebase/database';
import { database } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import './UserNotif.css';

const UserNotif = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const notifRef = useRef(null);
  const navigate = useNavigate();
  const auth = useAuth();
  const currentUser = auth?.currentUser;

  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    const fetchNotifications = () => {
      setIsLoading(true);
      const notifications = [];

      // Listen to interviews
      const interviewsRef = ref(database, 'interviews');
      const interviewsQuery = query(interviewsRef, orderByChild('timestamp'), limitToLast(10));
      const interviewsUnsubscribe = onValue(interviewsQuery, (snapshot) => {
        snapshot.forEach((childSnapshot) => {
          const interview = childSnapshot.val();
          if (interview.userId === currentUser.uid && !interview.isRead) {
            notifications.push({
              id: childSnapshot.key,
              type: 'interview',
              title: 'Interview Update',
              message: `Your interview status has been updated to: ${interview.status}`,
              timestamp: interview.timestamp,
              path: '/usertrack'
            });
          }
        });
      });

      // Listen to payments
      const paymentsRef = ref(database, 'payments');
      const paymentsQuery = query(paymentsRef, orderByChild('timestamp'), limitToLast(10));
      const paymentsUnsubscribe = onValue(paymentsQuery, (snapshot) => {
        snapshot.forEach((childSnapshot) => {
          const payment = childSnapshot.val();
          if (payment.userId === currentUser.uid && !payment.isRead) {
            notifications.push({
              id: childSnapshot.key,
              type: 'payment',
              title: 'Payment Update',
              message: `Payment status: ${payment.status}`,
              timestamp: payment.timestamp,
              path: '/userAdmission'
            });
          }
        });
      });

      // Listen to messages
      const messagesRef = ref(database, 'messages');
      const messagesQuery = query(messagesRef, orderByChild('timestamp'), limitToLast(10));
      const messagesUnsubscribe = onValue(messagesQuery, (snapshot) => {
        snapshot.forEach((childSnapshot) => {
          const message = childSnapshot.val();
          if (message.userId === currentUser.uid && !message.isRead) {
            notifications.push({
              id: childSnapshot.key,
              type: 'message',
              title: 'New Message',
              message: `You have a new message: ${message.subject}`,
              timestamp: message.timestamp,
              path: '/contact'
            });
          }
        });
      });

      // Sort notifications by timestamp
      notifications.sort((a, b) => b.timestamp - a.timestamp);
      setNotifications(notifications);
      setUnreadCount(notifications.length);
      setIsLoading(false);

      return () => {
        interviewsUnsubscribe();
        paymentsUnsubscribe();
        messagesUnsubscribe();
      };
    };

    const unsubscribe = fetchNotifications();
    return () => unsubscribe;
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification) => {
    // Mark as read in the database
    const nodeRef = ref(database, `${notification.type}s/${notification.id}`);
    // Update the isRead status
    // Note: You'll need to implement the update logic based on your database structure

    // Navigate to the appropriate page
    navigate(notification.path);
    setIsOpen(false);
  };

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="notif-container" ref={notifRef}>
      <button 
        className="notif-toggle"
        onClick={toggleNotifications}
        aria-label="Toggle notifications"
      >
        <IoNotificationsOutline />
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount}</span>
        )}
      </button>

      <div className={`notif-overlay ${isOpen ? 'active' : ''}`}>
        <div className="notif-content">
          <div className="notif-header">
            <h3>Notifications</h3>
            <button 
              className="close-notif"
              onClick={() => setIsOpen(false)}
              aria-label="Close notifications"
            >
              <IoCloseOutline />
            </button>
          </div>

          <div className="notif-list">
            {isLoading ? (
              <div className="notif-loading">Loading notifications...</div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  className="notif-item"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notif-item-header">
                    <h4>{notification.title}</h4>
                    <span className="notif-time">
                      {new Date(notification.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="notif-message">{notification.message}</p>
                </button>
              ))
            ) : (
              <div className="no-notifications">
                <p>No new notifications</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserNotif; 