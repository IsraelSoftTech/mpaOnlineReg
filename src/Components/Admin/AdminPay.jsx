import React, { useState, useEffect } from 'react';
import { database } from '../../firebase';
import { ref, onValue, update, get } from 'firebase/database';
import './AdminPay.css';
import AdminNav from './AdminNav';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminPay = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      const payment = payments.find(p => p.id === paymentId);
      if (!payment) return;

      // Update payment status in payments collection
      const paymentRef = ref(database, `payments/${paymentId}`);
      await update(paymentRef, {
        status: 'Paid',
        adminConfirmed: true
      });

      // Update payment status in admissions collection
      const admissionsRef = ref(database, 'admissions');
      const snapshot = await get(admissionsRef);
      const admissions = snapshot.val();
      
      if (admissions) {
        const userAdmission = Object.entries(admissions).find(([_, adm]) => adm.username === payment.username);
        if (userAdmission) {
          const [admissionId] = userAdmission;
          const admissionRef = ref(database, `admissions/${admissionId}`);
          await update(admissionRef, {
            paymentStatus: 'Paid',
            status: 'Admitted',
            paymentDetails: payment,
            paymentTimestamp: new Date().toISOString()
          });
        }
      }

      toast.success('Payment confirmed successfully');
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error('Error confirming payment');
    }
  };

  const handleReject = async (paymentId) => {
    try {
      const payment = payments.find(p => p.id === paymentId);
      if (!payment) return;

      // Update payment status in payments collection
      const paymentRef = ref(database, `payments/${paymentId}`);
      await update(paymentRef, {
        status: 'Not Paid',
        adminConfirmed: true
      });

      // Update payment status in admissions collection
      const admissionsRef = ref(database, 'admissions');
      const snapshot = await get(admissionsRef);
      const admissions = snapshot.val();
      
      if (admissions) {
        const userAdmission = Object.entries(admissions).find(([_, adm]) => adm.username === payment.username);
        if (userAdmission) {
          const [admissionId] = userAdmission;
          const admissionRef = ref(database, `admissions/${admissionId}`);
          await update(admissionRef, {
            paymentStatus: 'Not Paid',
            paymentDetails: payment,
            paymentTimestamp: new Date().toISOString()
          });
        }
      }

      toast.info('Payment rejected');
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast.error('Error rejecting payment');
    }
  };

  return (
    <div className="adminpay-wrapper">
      <AdminNav />
      <ToastContainer position="top-right" autoClose={3000} />
      <main className="adminpay-main">
        <h2>Payment Records</h2>
        
        {loading ? (
          <div className="loading">Loading payments...</div>
        ) : (
          <div className="admin-pay-table-container">
            <table className="admin-pay-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Sender Name</th>
                  <th>Transaction ID</th>
                  <th>Payment Link ID</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(payment => (
                  <tr key={payment.id}>
                    <td>{new Date(payment.timestamp).toLocaleDateString()}</td>
                    <td>{payment.senderName}</td>
                    <td>{payment.transactionId}</td>
                    <td>{payment.paymentLinkId}</td>
                    <td>{payment.amount} {payment.currency}</td>
                    <td>
                      <span className={`status-badge ${payment.status.toLowerCase().replace(' ', '-')}`}>
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
                      {payment.adminConfirmed && (
                        <span className="action-taken">
                          {payment.status === 'Paid' ? 'Confirmed' : 'Rejected'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr>
                    <td colSpan="7" className="no-records">
                      No payment records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPay; 