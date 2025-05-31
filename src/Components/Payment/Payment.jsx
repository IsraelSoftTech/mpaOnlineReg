import React, { useState } from 'react';
import { ref, push } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { database } from '../../firebase';
import UserNav from '../Shared/UserNav';
import './Payment.css';

const Payment = () => {
  const [showDetails, setShowDetails] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [payerName, setPayerName] = useState('');
  const [success, setSuccess] = useState(false);
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  const handleProceed = () => {
    window.open('https://checkout.fapshi.com/link/66659157', '_blank');
    setShowDetails(true);
  };

  const handleSendDetails = async (e) => {
    e.preventDefault();
    if (!transactionId || !payerName) return;
    setSending(true);
    try {
      await push(ref(database, 'payments'), {
        transactionId,
        payerName,
        timestamp: Date.now()
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate('/usertrack');
      }, 3000);
    } catch (err) {
      alert('Error saving payment details. Please try again.');
    }
    setSending(false);
  };

  return (
    <div className="admission-payment-page">
      <UserNav />
      <main className="admission-payment-main">
        {!showDetails && (
          <section className="admission-payment-section">
            <h2>Payment for Admission</h2>
            <div className="admission-payment-method">
              <label>Payment Method:</label>
              <span className="admission-payment-method-selected">MTN Momo/Orange Money</span>
            </div>
            <div className="admission-payment-fee">
              <label>Payment Fee:</label>
              <span className="admission-payment-fee-amount">2000 XAF</span>
            </div>
            <div className="admission-payment-alert">
              <strong>Note:</strong> Make sure you enter a correct email when filling the payment form. You will receive payment details through it.
            </div>
            <button className="admission-payment-proceed-btn" onClick={handleProceed}>
              Proceed
            </button>
          </section>
        )}

        {showDetails && (
          <section className="admission-payment-form-section">
            <h3>Enter Payment Details</h3>
            <form className="admission-payment-form" onSubmit={handleSendDetails}>
              <div className="admission-payment-form-group">
                <label htmlFor="transactionId">Transaction ID (Sent through email)</label>
                <input
                  type="text"
                  id="transactionId"
                  value={transactionId}
                  onChange={e => setTransactionId(e.target.value)}
                  required
                />
              </div>
              <div className="admission-payment-form-group">
                <label htmlFor="payerName">Payer Name</label>
                <input
                  type="text"
                  id="payerName"
                  value={payerName}
                  onChange={e => setPayerName(e.target.value)}
                  required
                />
              </div>
              <button
                className="admission-payment-send-btn"
                type="submit"
                disabled={sending}
              >
                {sending ? 'Sending...' : 'Send Details'}
              </button>
            </form>
            {success && (
              <div className="admission-payment-success">
                Payment details sent successfully!
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default Payment;