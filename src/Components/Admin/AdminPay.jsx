import React, { useState, useEffect } from 'react';
import { database } from '../../firebase';
import { ref, onValue, update } from 'firebase/database';
import './AdminPay.css';
import AdminNav from './AdminNav';

const AdminPay = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    // Listen for payments
    const paymentsRef = ref(database, 'payments');
    const unsubscribe = onValue(paymentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const paymentsList = Object.entries(data).map(([id, payment]) => ({
          id,
          ...payment
        }))
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        setPayments(paymentsList);
      } else {
        setPayments([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleConfirm = async (paymentId) => {
    try {
      const paymentRef = ref(database, `payments/${paymentId}`);
      await update(paymentRef, {
        status: 'Paid',
        adminConfirmed: true,
        admissionStatus: 'Admitted'
      });

      // Update the user's admission status
      const payment = payments.find(p => p.id === paymentId);
      if (payment) {
        const userRef = ref(database, `users/${payment.username}`);
        await update(userRef, {
          paymentStatus: 'Paid',
          admissionStatus: 'Admitted'
        });
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
    }
  };

  const handleReject = async (paymentId) => {
    try {
      const paymentRef = ref(database, `payments/${paymentId}`);
      await update(paymentRef, {
        status: 'Rejected',
        adminConfirmed: true
      });

      // Update the user's payment status
      const payment = payments.find(p => p.id === paymentId);
      if (payment) {
        const userRef = ref(database, `users/${payment.username}`);
        await update(userRef, {
          paymentStatus: 'Rejected'
        });
      }
    } catch (error) {
      console.error('Error rejecting payment:', error);
    }
  };

  const viewReceipt = (url) => {
    setSelectedReceipt(url);
  };

  return (
    <div className="admin-pay-container">
      <AdminNav />
      <div className="admin-pay-content">
        <h2>Payment Records</h2>
        
        {loading ? (
          <div className="loading">Loading payments...</div>
        ) : (
          <div className="payment-table-container">
            <table className="payment-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone Number</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Receipt</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(payment => (
                  <tr key={payment.id}>
                    <td>{new Date(payment.timestamp).toLocaleDateString()}</td>
                    <td>{payment.name}</td>
                    <td>{payment.email}</td>
                    <td>{payment.phoneNumber}</td>
                    <td>{payment.amount} {payment.currency}</td>
                    <td>{payment.paymentMethod}</td>
                    <td>
                      {payment.receiptUrl && (
                        <button 
                          className="view-receipt-btn"
                          onClick={() => viewReceipt(payment.receiptUrl)}
                        >
                          View Receipt
                        </button>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${payment.status.toLowerCase()}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td>
                      {!payment.adminConfirmed && (
                        <div className="action-buttons">
                          <button
                            className="confirm-btn"
                            onClick={() => handleConfirm(payment.id)}
                          >
                            Confirm
                          </button>
                          <button
                            className="reject-btn"
                            onClick={() => handleReject(payment.id)}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr>
                    <td colSpan="9" className="no-records">
                      No payment records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {selectedReceipt && (
          <div className="receipt-modal">
            <div className="receipt-modal-content">
              <button 
                className="close-modal"
                onClick={() => setSelectedReceipt(null)}
              >
                ×
              </button>
              {selectedReceipt.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={selectedReceipt}
                  title="Payment Receipt"
                  width="100%"
                  height="500px"
                />
              ) : (
                <img
                  src={selectedReceipt}
                  alt="Payment Receipt"
                  style={{ maxWidth: '100%', maxHeight: '80vh' }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPay; 