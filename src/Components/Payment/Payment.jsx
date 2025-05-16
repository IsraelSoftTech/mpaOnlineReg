import React, { useState, useRef, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RiMenu3Line, RiCloseFill } from 'react-icons/ri';
import '../UserAdmission/UserAdmission.css';
import './Payment.css';
import { AdmissionContext } from '../AdmissionContext';
import logo from '../../assets/logo.png';

const Payment = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [paymentDetails, setPaymentDetails] = useState({
    senderNumber: '',
    senderName: '',
    transactionId: ''
  });
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, updatePaymentStatus } = useContext(AdmissionContext);

  const toggleMenu = () => setIsMenuOpen((open) => !open);

  const handleLogout = () => {
    logout();
    navigate('/about');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentSubmit = async () => {
    // Update payment status to pending with payment details
    await updatePaymentStatus('Pending', paymentDetails);
    // Move to confirmation step
    setStep(4);
  };

  // Dummy data for design
  const item = { name: 'For new students', price: '2000', desc: 'Admission Fee' };

  return (
    <div className="userad-wrapper">
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
          <button className={`app-nav-link${location.pathname === '/about' ? ' active' : ''}`} onClick={() => navigate('/about')}>About</button>
          <button className={`app-nav-link${location.pathname === '/userAdmission' ? ' active' : ''}`} onClick={() => navigate('/userAdmission')}>Admission</button>
          <button className={`app-nav-link${location.pathname === '/usertrack' ? ' active' : ''}`} onClick={() => navigate('/usertrack')}>Check Status</button>
          <button className={`app-nav-link${location.pathname === '/contact' ? ' active' : ''}`} onClick={() => navigate('/contact')}>Contact</button>
          <button className={`app-nav-link${location.pathname === '/profile' ? ' active' : ''}`} onClick={() => navigate('/profile')}>Profile</button>
          <button className="app-nav-link logout" onClick={handleLogout}>Logout</button>
        </nav>
      </header>
      <main className="userad-main payment-main">
        <h2 className="userad-title-main">Pay for admission</h2>
      
        <div className="payment-content">
          {step === 1 && (
            <div className="payment-step payment-step1">
              <div className="payment-item-info">
                <div>
                  <b>Admission Fee</b><br />{item.name}
                </div>
                <div className="payment-price">
                  <b>Amount</b><br />XAF {item.price}
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
                    <span className="pay-icon mtn" /> MTN MoMo
                  </label>
                </div>
              </div>
              <button className="payment-btn" onClick={() => setStep(2)}>Continue</button>
            </div>
          )}

          {step === 2 && (
            <div className="payment-step payment-step2">
              <div className="payment-card">
                <div className="pay-icon mtn large" />
                <div className="payment-label">MTN Mobile Money</div>
                <div className="payment-desc">Dial the code below on your phone:</div>
                <div className="payment-dial-code">
                  *126*9*676768796*2000#
                </div>
                <div className="payment-desc">Enter your PIN to confirm payment</div>
                <button className="payment-btn" onClick={() => setStep(3)}>Continue to Confirm</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="payment-step payment-step3">
              <div className="payment-card">
                <div className="payment-label">Confirm Payment Details</div>
                <form className="payment-confirm-form" onSubmit={(e) => e.preventDefault()}>
                  <input
                    type="tel"
                    name="senderNumber"
                    value={paymentDetails.senderNumber}
                    onChange={handleInputChange}
                    placeholder="Enter Sender Number"
                    required
                  />
                  <input
                    type="text"
                    name="senderName"
                    value={paymentDetails.senderName}
                    onChange={handleInputChange}
                    placeholder="Enter Sender Name"
                    required
                  />
                  <input
                    type="text"
                    name="transactionId"
                    value={paymentDetails.transactionId}
                    onChange={handleInputChange}
                    placeholder="Enter Transaction ID"
                    required
                  />
                  <button 
                    className="payment-btn" 
                    onClick={handlePaymentSubmit}
                    disabled={!paymentDetails.senderNumber || !paymentDetails.senderName || !paymentDetails.transactionId}
                  >
                    Confirm Payment
                  </button>
                </form>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="payment-step payment-step4">
              <div className="payment-card">
                <div className="payment-label">Payment Details Submitted</div>
                <div className="payment-success-icon">✓</div>
                <div className="payment-confirm-desc">
                  Your payment details have been submitted successfully. Please wait for admin approval.
                </div>
                <button className="payment-btn" onClick={() => navigate('/usertrack')}>
                  Check Your Admission Status
                </button>
              </div>
            </div>
          )}
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

export default Payment;