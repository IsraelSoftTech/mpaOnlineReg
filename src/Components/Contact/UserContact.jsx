import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RiMenu3Line, RiCloseFill, RiMessage2Line, RiSendPlaneLine } from 'react-icons/ri';
import { ref, push, onValue } from 'firebase/database';
import { database } from '../../firebase';
import { AdmissionContext } from '../AdmissionContext';
import './UserContact.css';
import logo from '../../assets/logo.png';
import UserNav from '../Shared/UserNav';

const UserContact = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, announcements, setAnnouncements } = useContext(AdmissionContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [showSchoolMessages, setShowSchoolMessages] = useState(false);
  const [userMessages, setUserMessages] = useState([]);
  const [schoolMessages, setSchoolMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    message: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!currentUser) {
      navigate('/signin');
      return;
    }

    const loadMessages = async () => {
      try {
        setIsLoading(true);
        const messagesRef = ref(database, 'messages');
        const announcementsRef = ref(database, 'announcements');
        
        // Set up real-time listener for user messages
        const unsubscribeMessages = onValue(messagesRef, (snapshot) => {
          const data = snapshot.val() || {};
          const filteredMessages = Object.entries(data)
            .filter(([_, msg]) => msg.userId === currentUser.toString())
            .map(([id, msg]) => ({
              id,
              ...msg,
              timestamp: new Date(msg.timestamp).toLocaleString(),
              replies: msg.replies ? Object.entries(msg.replies).map(([replyId, reply]) => ({
                id: replyId,
                ...reply,
                timestamp: new Date(reply.timestamp).toLocaleString()
              })) : []
            }))
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

          setUserMessages(filteredMessages);
        });

        // Set up real-time listener for announcements
        const unsubscribeAnnouncements = onValue(announcementsRef, (snapshot) => {
          const data = snapshot.val() || {};
          const announcementsList = Object.entries(data)
            .map(([id, announcement]) => ({
              id,
              ...announcement,
              timestamp: new Date(announcement.timestamp).toLocaleString()
            }))
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

          setAnnouncements(announcementsList);
          setIsLoading(false);
        });

        return () => {
          unsubscribeMessages();
          unsubscribeAnnouncements();
        };
      } catch (error) {
        console.error('Error loading messages:', error);
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [currentUser, navigate]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!currentUser) {
      setError('Please sign in to send a message');
      return;
    }

    // Validate form
    if (!formData.fullName.trim() || !formData.email.trim() || 
        !formData.phoneNumber.trim() || !formData.message.trim()) {
      setError('All fields are required');
      return;
    }

    try {
      const messagesRef = ref(database, 'messages');
      await push(messagesRef, {
        ...formData,
        userId: currentUser,
        status: 'unread',
        timestamp: new Date().toISOString(),
        replies: [],
        likes: 0,
        reactions: {}
      });

      setSuccessMessage('Message sent successfully!');
      setFormData({
        fullName: '',
        email: '',
        phoneNumber: '',
        message: ''
      });

      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError('Failed to send message. Please try again.');
    }
  };

  const handleUserReply = async (messageId) => {
    if (!replyText.trim() || !currentUser) return;

    try {
      const repliesRef = ref(database, `messages/${messageId}/replies`);
      await push(repliesRef, {
        text: replyText,
        timestamp: new Date().toISOString(),
        from: 'user',
        userId: currentUser,
        isRead: false
      });

      setReplyText('');
      setSuccessMessage('Reply sent successfully!');
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      setError('Failed to send reply. Please try again.');
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="user-contact-wrapper">
      <UserNav/>

      <main className="user-contact-main">
        <div className="contact-header-actions">
          <h2 className="contact-title">Contact Us</h2>
          <div className="message-buttons">
            <button 
              className={`view-replies-btn${showReplies && !showSchoolMessages ? ' active' : ''}`}
              onClick={() => {
                setShowReplies(!showReplies);
                setShowSchoolMessages(false);
              }}
            >
              <RiMessage2Line /> {showReplies && !showSchoolMessages ? 'New Message' : 'View Messages'}
            </button>
            <button 
              className={`school-messages-btn${showSchoolMessages ? ' active' : ''}`}
              onClick={() => {
                setShowSchoolMessages(!showSchoolMessages);
                setShowReplies(true);
              }}
            >
              <RiMessage2Line /> Messages from School
            </button>
          </div>
        </div>

        {!showReplies ? (
          <div className="contact-form-container">
            {successMessage && (
              <div className="success-message">{successMessage}</div>
            )}
            {error && (
              <div className="error-message">{error}</div>
            )}
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                />
              </div>
              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Type your message here..."
                  rows="5"
                />
              </div>
              <button type="submit" className="send-message-btn">
                Send Message
              </button>
            </form>
          </div>
        ) : (
          <div className="replies-container">
            <h3 className="replies-title">
              {showSchoolMessages ? 'Messages from School' : 'Your Messages'}
            </h3>
            {isLoading ? (
              <div className="loading-indicator">Loading messages...</div>
            ) : showSchoolMessages ? (
              <div className="messages-list">
                {announcements && announcements.length > 0 ? (
                  announcements.map((announcement, index) => (
                    <div key={index} className="message-card">
                      <div className="message-header">
                        <div className="message-info">
                          <span className="message-sender">School Announcement</span>
                          <span className="message-time">
                            {new Date(announcement.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="message-content">
                        <p>{announcement.message}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-messages">No announcements from school</div>
                )}
              </div>
            ) : (
              <div className="messages-list">
                {userMessages.length === 0 ? (
                  <div className="no-messages">No messages yet</div>
                ) : (
                  userMessages.map((message) => (
                    <div key={message.id} className="message-card">
                      <div className="message-header">
                        <div className="message-info">
                          <span className="message-sender">
                            {message.from === 'admin' ? 'School' : 'You'}
                          </span>
                          <span className="message-time">{message.timestamp}</span>
                        </div>
                        {message.status === 'unread' && (
                          <span className="new-message-badge">New</span>
                        )}
                      </div>
                      <div className="message-content">
                        <p>{message.message}</p>
                      </div>
                      {message.replies && message.replies.length > 0 && (
                        <div className="message-replies">
                          {message.replies.map((reply) => (
                            <div key={reply.id} className={`reply-bubble ${reply.from}`}>
                              <p>{reply.text}</p>
                              <span className="reply-time">{reply.timestamp}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {message.from !== 'admin' && (
                        <div className="reply-input">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Type your reply..."
                            rows="3"
                          />
                          <button
                            className="send-reply-btn"
                            onClick={() => handleUserReply(message.id)}
                            disabled={!replyText.trim()}
                          >
                            <RiSendPlaneLine />
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default UserContact; 