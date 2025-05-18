import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RiMenu3Line, RiCloseFill } from 'react-icons/ri';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../UserAdmission/UserAdmission.css';
import './Payment.css';
import { AdmissionContext } from '../AdmissionContext';
import { database } from '../../firebase';
import { ref as dbRef, set, push, update } from 'firebase/database';
import logo from '../../assets/logo.png';

const FAPSHI_PAYMENT_LINK = 'https://checkout.fapshi.com/link/48024815';

const Payment = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    transactionId: '',
    paymentLinkId: '',
    senderName: ''
  });

  const menuRef = React.useRef(null);
  const buttonRef = React.useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, updatePaymentStatus, currentUser, currentUserData } = useContext(AdmissionContext);

  useEffect(() => {
    if (!currentUser) {
      toast.error('Please log in to continue');
      navigate('/login');
      return;
    }
  }, [currentUser, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const savePaymentData = async () => {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    try {
      const paymentsRef = dbRef(database, 'payments');
      const newPaymentRef = push(paymentsRef);
      const paymentId = newPaymentRef.key;
      const timestamp = new Date().toISOString();
      
      const userData = currentUserData || {};
      
      const paymentRecord = {
        id: paymentId,
        username: currentUser,
        timestamp,
        status: 'Pending',
        adminConfirmed: false,
        transactionId: paymentDetails.transactionId,
        paymentLinkId: paymentDetails.paymentLinkId,
        senderName: paymentDetails.senderName,
        email: userData.email || 'Unknown',
        amount: 100,
        currency: 'XAF',
        paymentMethod: 'MTN MOMO'
      };

      // Save to payments collection
      await set(newPaymentRef, paymentRecord);

      // Update only payment status in user's profile
      if (userData) {
        const userRef = dbRef(database, `users/${currentUser}`);
        await update(userRef, {
          paymentStatus: 'Pending',
          paymentId,
          lastPaymentTimestamp: timestamp
        });
      }

      return true;
    } catch (error) {
      console.error('Error saving payment data:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!paymentDetails.transactionId || !paymentDetails.paymentLinkId || !paymentDetails.senderName) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setIsProcessing(true);
      await savePaymentData();
      toast.success('Payment details submitted successfully!');
      
      setTimeout(() => {
        navigate('/usertrack');
      }, 2000);
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast.error('Error submitting payment details. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const openFapshiPayment = () => {
    if (!currentUser) {
      toast.error('Please log in to continue');
      navigate('/login');
      return;
    }

    setShowPaymentForm(true);
    const paymentWindow = window.open(FAPSHI_PAYMENT_LINK, 'FapshiPayment', 'width=600,height=600');
  };

  const handleLogout = () => {
    logout();
    navigate('/about');
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="userad-wrapper">
      <ToastContainer 
        position="top-right" 
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <header className="app-header">
        <div className="logo-section">
          <img src={logo} alt="logo" className="app-logo" />
          <span className="app-brand">MPASAT</span>
        </div>
        <button
          ref={buttonRef}
          className="menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <RiCloseFill size={24} /> : <RiMenu3Line size={24} />}
        </button>
        <nav ref={menuRef} className={"app-nav" + (isMenuOpen ? " nav-open" : "")}>
          <button className={"app-nav-link" + (location.pathname === '/about' ? " active" : "")} onClick={() => navigate('/about')}>About</button>
          <button className={"app-nav-link" + (location.pathname === '/userAdmission' ? " active" : "")} onClick={() => navigate('/userAdmission')}>Admission</button>
          <button className={"app-nav-link" + (location.pathname === '/usertrack' ? " active" : "")} onClick={() => navigate('/usertrack')}>Check Status</button>
          <button className={"app-nav-link" + (location.pathname === '/contact' ? " active" : "")} onClick={() => navigate('/contact')}>Contact</button>
          <button className={"app-nav-link" + (location.pathname === '/profile' ? " active" : "")} onClick={() => navigate('/profile')}>Profile</button>
          <button className="app-nav-link logout" onClick={handleLogout}>Logout</button>
        </nav>
      </header>
      <main className="payment-main">
        <h2 className="userad-title-main">Pay for admission</h2>
      
        <div className="payment-content">
          {!showPaymentForm ? (
            <div className="payment-step payment-step1">
              <div className="payment-item-info">
                <div>
                  <b>Admission Fee</b><br />NB: Enter a valid email when filling payment form
                </div>
                <div className="payment-price">
                  <b>Amount</b><br />XAF 2000
                </div>
              </div>
              <div className="payment-section">
                <div className="payment-label">Payment method</div>
                <div className="payment-options">
                  <label>
                    <input 
                      type="radio" 
                      name="paymethod" 
                      checked={true}
                      readOnly
                    />
                    <span className="pay-icon mtn" /> MTN MoMo / Orange Money
                  </label>
                </div>
              </div>
              <button 
                className="payment-btn" 
                onClick={openFapshiPayment}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Proceed to Pay'}
              </button>
            </div>
          ) : (
            <div className="payment-step payment-step2">
              <h3>Submit Payment Details</h3>
              <form onSubmit={handleSubmit} className="payment-form">
                <div className="form-group">
                  <label htmlFor="transactionId">Transaction ID From Fapshi</label>
                  <input
                    type="text"
                    id="transactionId"
                    name="transactionId"
                    value={paymentDetails.transactionId}
                    onChange={handleInputChange}
                    placeholder="Enter transaction ID"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="paymentLinkId">Payment Link ID From Fapshi</label>
                  <input
                    type="text"
                    id="paymentLinkId"
                    name="paymentLinkId"
                    value={paymentDetails.paymentLinkId}
                    onChange={handleInputChange}
                    placeholder="Enter payment link ID"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="senderName">Name of Sender</label>
                  <input
                    type="text"
                    id="senderName"
                    name="senderName"
                    value={paymentDetails.senderName}
                    onChange={handleInputChange}
                    placeholder="Enter sender's name"
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  className="payment-btn"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Send Payment Details'}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Payment;