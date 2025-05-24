import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RiMenu3Line, RiCloseFill, RiMailLine, RiMailOpenLine, RiHeartLine, RiHeartFill, RiSendPlaneLine, RiAddLine } from 'react-icons/ri';
import { ref, onValue, update, push, off } from 'firebase/database';
import { database } from '../../firebase';
import { AdmissionContext } from '../AdmissionContext';
import AdminNav from '../Admin/AdminNav';
import './AdminContact.css';
import logo from '../../assets/logo.png';

const AdminContact = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { accounts, announcements, setAnnouncements } = useContext(AdmissionContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [newMessageText, setNewMessageText] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
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
      const repliesRef = ref(database, `messages/${selectedMessage.id}/replies`);
      await push(repliesRef, {
        text: replyText,
        timestamp: new Date().toISOString(),
        from: 'admin',
        isRead: false
      });

      setReplyText('');
      setSuccessMessage('Reply sent successfully!');
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error sending reply:', error);
      setSuccessMessage('Error sending reply. Please try again.');
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      setSelectedUsers(accounts.map(account => account.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSendNewMessage = async () => {
    if (!newMessageText.trim() || selectedUsers.length === 0) return;

    try {
      const adminMessagesRef = ref(database, 'adminmessages');
      
      // Send message to each selected user
      for (const userId of selectedUsers) {
        const user = accounts.find(acc => acc.id === userId);
        if (user) {
          const messageData = {
            message: newMessageText,
            from: 'admin',
            userId: userId.toString(), // Ensure userId is a string
            fullName: user.fullName,
            email: user.email,
            status: 'unread',
            timestamp: new Date().toISOString(),
            replies: []
          };
          console.log('Sending message to user:', messageData); // Debug log
          await push(adminMessagesRef, messageData);
        }
      }
      
      // Show success message
      setSuccessMessage(`Message sent successfully to ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''}`);
      
      // Reset form
      setNewMessageText('');
      setSelectedUsers([]);
      setSelectAll(false);
      setShowNewMessageModal(false);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error sending message:', error);
      setSuccessMessage('Error sending message. Please try again.');
    }
  };

  const handleSendAnnouncement = async () => {
    if (!announcementText.trim()) return;

    try {
      const announcementData = {
        message: announcementText,
        from: 'admin',
        timestamp: new Date().toISOString()
      };

      // Store in Firebase
      const announcementsRef = ref(database, 'announcements');
      await push(announcementsRef, announcementData);

      // Update context
      setAnnouncements(prev => [announcementData, ...(prev || [])]);
      
      setSuccessMessage('Announcement sent successfully');
      setAnnouncementText('');
      setShowAnnouncementModal(false);

      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error in handleSendAnnouncement:', error);
      setSuccessMessage('Error sending announcement');
    }
  };

  return (
    <div className="admin-contact-wrapper">
      <AdminNav />
      <main className="admin-contact-main">
        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}
        <div className="messages-container">
          <div className="messages-list">
            <div className="messages-header">
              <h2 className="messages-title">Messages</h2>
              <button 
                className="announcement-btn"
                onClick={() => setShowAnnouncementModal(true)}
              >
                <RiAddLine /> Announcement
              </button>
            </div>
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
                </div>
                <div className="message-content">
                  <p>{selectedMessage.message}</p>
                </div>
                <div className="message-replies">
                  {selectedMessage.replies && Object.entries(selectedMessage.replies).map(([replyId, reply]) => (
                    <div key={replyId} className={`reply-bubble ${reply.from}`}>
                      <p>{reply.text}</p>
                      <span className="reply-time">{new Date(reply.timestamp).toLocaleString()}</span>
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

        {/* New Message Modal */}
        {showNewMessageModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>New Message</h2>
              <div className="user-selection">
                <div className="select-all-container">
                  <input
                    type="checkbox"
                    id="selectAll"
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                  <label htmlFor="selectAll">Select All Users</label>
                </div>
                <div className="users-list">
                  {accounts.map(account => (
                    <div key={account.id} className="user-item">
                      <input
                        type="checkbox"
                        id={account.id}
                        checked={selectedUsers.includes(account.id)}
                        onChange={() => handleSelectUser(account.id)}
                      />
                      <label htmlFor={account.id}>
                        {account.fullName} ({account.email})
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <textarea
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                placeholder="Type your message..."
                rows="5"
              />
              <div className="modal-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => {
                    setShowNewMessageModal(false);
                    setNewMessageText('');
                    setSelectedUsers([]);
                    setSelectAll(false);
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="send-btn"
                  onClick={handleSendNewMessage}
                  disabled={!newMessageText.trim() || selectedUsers.length === 0}
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Announcement Modal */}
        {showAnnouncementModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Send Announcement</h2>
              <p className="announcement-info">
                This announcement will be sent to all registered users.
              </p>
              <textarea
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="Type your announcement here..."
                rows="5"
              />
              <div className="modal-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => {
                    setShowAnnouncementModal(false);
                    setAnnouncementText('');
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="send-btn"
                  onClick={handleSendAnnouncement}
                  disabled={!announcementText.trim()}
                >
                  Send Announcement
                </button>
              </div>
            </div>
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

export default AdminContact; 