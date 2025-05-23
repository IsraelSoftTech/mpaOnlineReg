import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RiMenu3Line, RiCloseFill, RiMessage2Line } from 'react-icons/ri';
import { ref, push, onValue } from 'firebase/database';
import { database } from '../../firebase';
import { AdmissionContext } from '../AdmissionContext';
import './UserContact.css';
import logo from '../../assets/logo.png';
import UserNav from '../Shared/UserNav';

const UserContact = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useContext(AdmissionContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([]);
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
        
        // Set up real-time listener for messages
        const unsubscribe = onValue(messagesRef, (snapshot) => {
          const data = snapshot.val() || {};
          const userMessages = Object.entries(data)
            .filter(([_, msg]) => msg.userId === currentUser)
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

          setReplies(userMessages);
          setIsLoading(false);
        });

        return () => unsubscribe();
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

  return (
    <div className="user-contact-wrapper">
   <UserNav/>

      <main className="user-contact-main">
        <div className="contact-header-actions">
          <h2 className="contact-title">Contact Us</h2>
          <button 
            className={`view-replies-btn${showReplies ? ' active' : ''}`}
            onClick={() => setShowReplies(!showReplies)}
          >
            <RiMessage2Line /> {showReplies ? 'New Message' : 'View Replies'}
          </button>
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
            <h3 className="replies-title">Your Messages & Replies</h3>
            {isLoading ? (
              <div className="loading-indicator">Loading messages...</div>
            ) : replies.length === 0 ? (
              <div className="no-replies">
                No messages or replies yet.
              </div>
            ) : (
              <div className="replies-list">
                {replies.map(message => (
                  <div key={message.id} className="reply-card">
                    <div className="reply-header">
                      <span className="reply-timestamp">{message.timestamp}</span>
                    </div>
                    <div className="reply-content">
                      <p className="reply-message">{message.message}</p>
                    </div>
                    <div className="replies-thread">
                      {message.replies && message.replies.map(reply => (
                        <div key={reply.id} className={`reply-bubble ${reply.from}`}>
                          <p>{reply.text}</p>
                          <span className="reply-time">{reply.timestamp}</span>
                        </div>
                      ))}
                    </div>
                    <div className="reply-input">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your reply..."
                      />
                      <button
                        className="send-reply-btn"
                        onClick={() => handleUserReply(message.id)}
                        disabled={!replyText.trim()}
                      >
                        Send Reply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default UserContact; 