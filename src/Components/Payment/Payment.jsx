import React, { useState, useContext } from 'react';
import { AdmissionContext } from '../AdmissionContext';
import { ref, push, set } from 'firebase/database';
import { database } from '../../firebase';
import { toast } from 'react-toastify';
import './Payment.css';

const Payment = () => {
  const [formData, setFormData] = useState({
    name: '',
    class: '',
    amount: '',
    paymentMethod: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser } = useContext(AdmissionContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const paymentRef = ref(database, 'payments');
      const newPaymentRef = push(paymentRef);
      await set(newPaymentRef, {
        ...formData,
        status: 'Pending',
        timestamp: Date.now(),
        userId: currentUser?.uid
      });

      toast.success('Payment submitted successfully!');
      setFormData({
        name: '',
        class: '',
        amount: '',
        paymentMethod: ''
      });
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast.error('Failed to submit payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="payment-container">
      <div className="payment-content">
        <h1>Make a Payment</h1>
        <form onSubmit={handleSubmit} className="payment-form">
          <div className="form-group">
            <label htmlFor="name">Student Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="class">Class</label>
            <select
              id="class"
              name="class"
              value={formData.class}
              onChange={handleChange}
              required
            >
              <option value="">Select Class</option>
              <option value="Grade 7">Grade 7</option>
              <option value="Grade 8">Grade 8</option>
              <option value="Grade 9">Grade 9</option>
              <option value="Grade 10">Grade 10</option>
              <option value="Grade 11">Grade 11</option>
              <option value="Grade 12">Grade 12</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="paymentMethod">Payment Method</label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              required
            >
              <option value="">Select Payment Method</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Mobile Money">Mobile Money</option>
            </select>
          </div>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : 'Submit Payment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Payment;