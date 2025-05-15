import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { RiMenu3Line, RiCloseFill, RiMailSendLine, RiMessage2Line, RiSendPlaneLine } from 'react-icons/ri';
import { ref, push, onValue, update } from 'firebase/database';
import { database } from '../../firebase';
import './UserContact.css';
import logo from '../../assets/logo.png';

const UserContact = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    message: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    // Fetch messages and replies for this user
    const messagesRef = ref(database, 'messages');
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messagesList = Object.entries(data)
          .map(([id, msg]) => ({
            id,
            ...msg,
            timestamp: new Date(msg.timestamp).toLocaleString()
          }))
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setReplies(messagesList);

        // If there's a message with new replies, update its status
        messagesList.forEach(message => {
          if (message.hasNewReply) {
            const messageRef = ref(database, `messages/${message.id}`);
            update(messageRef, { hasNewReply: false });
          }
        });
      }
    });

    return () => unsubscribe();
  }, []);

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

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError('Failed to send message. Please try again.');
    }
  };

  const handleUserReply = async (messageId) => {
    if (!replyText.trim()) return;

    try {
      const repliesRef = ref(database, `messages/${messageId}/replies`);
      await push(repliesRef, {
        text: replyText,
        timestamp: new Date().toISOString(),
        from: 'user',
        isRead: false
      });

      setReplyText('');
      setSuccessMessage('Reply sent successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      setError('Failed to send reply. Please try again.');
    }
  };

  return (
    <div className="user-contact-wrapper">
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
          <Link to="/about" className="app-nav-link">About</Link>
          <Link to="/admission" className="app-nav-link">Admission</Link>
          <Link to="/checkstatus" className="app-nav-link">Check Status</Link>
          <Link to="/contact" className={`app-nav-link${location.pathname === '/contact' ? ' active' : ''}`}>Contact</Link>
          <Link to="/profile" className="app-nav-link">Profile</Link>
          <button className="app-nav-link logout" onClick={() => navigate('/signin')}>Log out</button>
        </nav>
      </header>

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
                <RiMailSendLine /> Send Message
              </button>
            </form>
          </div>
        ) : (
          <div className="replies-container">
            <h3 className="replies-title">Your Messages & Replies</h3>
            {replies.length === 0 ? (
              <div className="no-replies">
                No messages or replies yet.
              </div>
            ) : (
              <div className="replies-list">
                {replies.map(message => (
                  <div key={message.id} className="reply-card">
                    <div className="reply-header">
                      <span className="reply-timestamp">{message.timestamp}</span>
                      {message.hasNewReply && (
                        <span className="new-reply-badge">New Reply</span>
                      )}
                    </div>
                    <div className="reply-content">
                      <p className="reply-message">{message.message}</p>
                    </div>
                    <div className="replies-thread">
                      {message.replies && Object.entries(message.replies).map(([replyId, reply]) => (
                        <div key={replyId} className={`reply-bubble ${reply.from}`}>
                          <p>{reply.text}</p>
                          <span className="reply-time">
                            {new Date(reply.timestamp).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="reply-input">
                      {successMessage && (
                        <div className="success-message">{successMessage}</div>
                      )}
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
                        <RiSendPlaneLine />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
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

export default UserContact; 