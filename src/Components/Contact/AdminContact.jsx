import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RiMenu3Line, RiCloseFill, RiMailLine, RiMailOpenLine, RiHeartLine, RiHeartFill, RiSendPlaneLine } from 'react-icons/ri';
import { ref, onValue, update, push, off } from 'firebase/database';
import { database } from '../../firebase';
import { AdmissionContext } from '../AdmissionContext';
import AdminNav from '../Admin/AdminNav';
import './AdminContact.css';
import logo from '../../assets/logo.png';

const AdminContact = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    // Fetch messages from Firebase
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
        setMessages(messagesList);
      }
    });

    return () => unsubscribe();
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleMessageClick = async (message) => {
    setSelectedMessage(message);
    
    // Mark message as read if unread
    if (message.status === 'unread') {
      const messageRef = ref(database, `messages/${message.id}`);
      await update(messageRef, {
        status: 'read'
      });
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selectedMessage) return;

    try {
      const messageRef = ref(database, `messages/${selectedMessage.id}`);
      const replyData = {
        text: replyText,
        timestamp: new Date().toISOString(),
        from: 'admin',
        isRead: false
      };

      // Get current replies or initialize empty object
      const repliesRef = ref(database, `messages/${selectedMessage.id}/replies`);
      await push(repliesRef, replyData);

      // Update message status to indicate there's a new reply
      await update(messageRef, {
        hasNewReply: true
      });

      setReplyText('');
      setSuccessMessage('Reply sent successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  const handleLike = async (messageId) => {
    const messageRef = ref(database, `messages/${messageId}`);
    const message = messages.find(m => m.id === messageId);
    
    await update(messageRef, {
      likes: (message.likes || 0) + 1
    });
  };

  return (
    <div className="admin-contact-wrapper">
      <AdminNav />
      <main className="admin-contact-main">
        <div className="messages-container">
          <div className="messages-list">
            <h2 className="messages-title">Messages</h2>
            {messages.length === 0 ? (
              <div className="no-messages">No messages yet</div>
            ) : (
              <div className="message-items">
                {messages.map(message => (
                  <div 
                    key={message.id} 
                    className={`message-item${selectedMessage?.id === message.id ? ' selected' : ''}`}
                    onClick={() => handleMessageClick(message)}
                  >
                    <div className="message-item-header">
                      <div className="message-sender">
                        {message.status === 'unread' ? (
                          <RiMailLine className="message-icon unread" />
                        ) : (
                          <RiMailOpenLine className="message-icon" />
                        )}
                        <span>{message.fullName}</span>
                      </div>
                      <span className="message-time">{message.timestamp}</span>
                    </div>
                    <div className="message-preview">
                      {message.message.substring(0, 100)}...
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="message-detail">
            {selectedMessage ? (
              <>
                <div className="message-detail-header">
                  <div className="message-detail-info">
                    <h3>{selectedMessage.fullName}</h3>
                    <div className="message-contact-info">
                      <span>{selectedMessage.email}</span>
                      <span>{selectedMessage.phoneNumber}</span>
                    </div>
                  </div>
                  <button 
                    className="like-button"
                    onClick={() => handleLike(selectedMessage.id)}
                  >
                    {selectedMessage.likes > 0 ? (
                      <RiHeartFill className="liked" />
                    ) : (
                      <RiHeartLine />
                    )}
                    <span>{selectedMessage.likes || 0}</span>
                  </button>
                </div>

                <div className="message-content">
                  <p>{selectedMessage.message}</p>
                </div>

                <div className="message-replies">
                  {selectedMessage.replies && Object.entries(selectedMessage.replies).map(([replyId, reply]) => (
                    <div key={replyId} className={`reply-bubble ${reply.from}`}>
                      <p>{reply.text}</p>
                      <span className="reply-time">
                        {new Date(reply.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="reply-box">
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
                    onClick={handleReply}
                    disabled={!replyText.trim()}
                  >
                    <RiSendPlaneLine />
                  </button>
                </div>
              </>
            ) : (
              <div className="no-message-selected">
                Select a message to view details
              </div>
            )}
          </div>
        </div>
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

export default AdminContact; 