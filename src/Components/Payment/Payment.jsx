import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RiMenu3Line, RiCloseFill } from 'react-icons/ri';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../UserAdmission/UserAdmission.css';
import './Payment.css';
import { AdmissionContext } from '../AdmissionContext';
import { database, storage } from '../../firebase';
import { ref, push, set } from 'firebase/database';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import logo from '../../assets/logo.png';

const FAPSHI_PAYMENT_LINK = 'https://checkout.fapshi.com/link/48024815';

const Payment = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUpload, setShowUpload] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const menuRef = React.useRef(null);
  const buttonRef = React.useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, updatePaymentStatus, currentUser, currentUserData } = useContext(AdmissionContext);

  const toggleMenu = () => setIsMenuOpen((open) => !open);

  const handleLogout = () => {
    logout();
    navigate('/about');
  };

  // Function to handle receipt file selection
  const handleReceiptChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.match('application/pdf|image/*')) {
        toast.error('Please upload only PDF or image files');
        return;
      }
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      setReceipt(file);
      toast.info('Receipt file selected successfully');
    }
  };

  // Function to upload receipt and save payment data
  const handleReceiptUpload = async () => {
    if (!receipt) {
      toast.error('Please select a receipt file');
      return;
    }

    try {
      setIsProcessing(true);
      
      // Create a unique filename
      const timestamp = Date.now();
      const fileExtension = receipt.name.split('.').pop();
      const filename = `${currentUser}_${timestamp}.${fileExtension}`;
      
      // Create storage reference
      const fileRef = storageRef(storage, `receipts/${filename}`);
      
      // Create upload task
      const uploadTask = uploadBytesResumable(fileRef, receipt);

      // Monitor upload progress
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          toast.error('Error uploading receipt. Please try again.');
          setIsProcessing(false);
        },
        async () => {
          try {
            // Get download URL
            const receiptUrl = await getDownloadURL(fileRef);

            // Generate a unique payment ID
            const paymentsRef = ref(database, 'payments');
            const newPaymentRef = push(paymentsRef);
            const paymentId = newPaymentRef.key;

            // Prepare payment data
            const paymentRecord = {
              id: paymentId,
              username: currentUser,
              timestamp: new Date().toISOString(),
              status: 'Pending',
              receiptUrl,
              receiptType: receipt.type,
              adminConfirmed: false,
              ...paymentData
            };

            // Save to database
            await set(newPaymentRef, paymentRecord);

            // Update user's payment status
            await updatePaymentStatus('Pending', paymentRecord);

            toast.success('Payment receipt uploaded successfully!');
            
            // Navigate to usertrack after a short delay
            setTimeout(() => {
              navigate('/usertrack');
            }, 2000);
          } catch (error) {
            console.error('Error saving payment data:', error);
            toast.error('Error saving payment data. Please try again.');
          } finally {
            setIsProcessing(false);
          }
        }
      );
    } catch (error) {
      console.error('Error starting upload:', error);
      toast.error('Error uploading receipt. Please try again.');
      setIsProcessing(false);
    }
  };

  // Function to open Fapshi payment window
  const openFapshiPayment = () => {
    setShowUpload(true);
    const paymentWindow = window.open(FAPSHI_PAYMENT_LINK, 'FapshiPayment', 'width=600,height=600');
    
    // Listen for messages from the payment window
    window.addEventListener('message', async (event) => {
      if (event.origin === 'https://checkout.fapshi.com') {
        const { data } = event;
        
        if (data.status === 'success') {
          setPaymentData({
            name: data.name || currentUserData?.fullName,
            email: data.email || currentUserData?.email,
            phoneNumber: data.phoneNumber,
            amount: 100,
            currency: 'XAF',
            paymentMethod: data.paymentMethod
          });
          
          toast.success('Payment completed successfully! Please upload your receipt.');
          
          if (paymentWindow) {
            paymentWindow.close();
          }
        }
      }
    });
  };

  return (
    <div className="userad-wrapper">
      <ToastContainer position="top-right" autoClose={5000} />
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
        <nav ref={menuRef} className={"app-nav" + (isMenuOpen ? " nav-open" : "")}>
          <button className={"app-nav-link" + (location.pathname === '/about' ? " active" : "")} onClick={() => navigate('/about')}>About</button>
          <button className={"app-nav-link" + (location.pathname === '/userAdmission' ? " active" : "")} onClick={() => navigate('/userAdmission')}>Admission</button>
          <button className={"app-nav-link" + (location.pathname === '/usertrack' ? " active" : "")} onClick={() => navigate('/usertrack')}>Check Status</button>
          <button className={"app-nav-link" + (location.pathname === '/contact' ? " active" : "")} onClick={() => navigate('/contact')}>Contact</button>
          <button className={"app-nav-link" + (location.pathname === '/profile' ? " active" : "")} onClick={() => navigate('/profile')}>Profile</button>
          <button className="app-nav-link logout" onClick={handleLogout}>Logout</button>
        </nav>
      </header>
      <main className="userad-main payment-main">
        <h2 className="userad-title-main">Pay for admission</h2>
      
        <div className="payment-content">
          {!showUpload ? (
            <div className="payment-step payment-step1">
              <div className="payment-item-info">
                <div>
                  <b>Admission Fee</b><br />Test Payment
                </div>
                <div className="payment-price">
                  <b>Amount</b><br />XAF 100
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
              <h3>Upload Payment Receipt</h3>
              <div className="upload-section">
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={handleReceiptChange}
                  className="file-input"
                  disabled={isProcessing}
                />
                <p className="upload-info">
                  Upload PDF or image file (max 5MB)
                </p>
                {receipt && (
                  <div className="selected-file">
                    Selected file: {receipt.name}
                  </div>
                )}
                {isProcessing && (
                  <div className="upload-progress">
                    Uploading: {uploadProgress.toFixed(0)}%
                  </div>
                )}
                <button 
                  className="payment-btn" 
                  onClick={handleReceiptUpload}
                  disabled={isProcessing || !receipt}
                >
                  {isProcessing ? `Uploading... ${uploadProgress.toFixed(0)}%` : 'Submit Receipt'}
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