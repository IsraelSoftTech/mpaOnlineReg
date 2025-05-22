import React, { useState, useContext } from 'react';
import { AdmissionContext } from '../AdmissionContext';
import { ref, push, set } from 'firebase/database';
import { database } from '../../firebase';
import { toast } from 'react-toastify';
import './AdminReg.css';

const AdminReg = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    class: '',
    address: '',
    username: 'admin_registered'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { admissions } = useContext(AdmissionContext);

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
      // Add to admissions collection
      const admissionRef = ref(database, 'admissions');
      const newAdmissionRef = push(admissionRef);
      await set(newAdmissionRef, {
        ...formData,
        status: 'Pending',
        timestamp: Date.now(),
        registeredBy: 'admin'
      });

      // Add to payments collection with initial status
      const paymentRef = ref(database, 'payments');
      const newPaymentRef = push(paymentRef);
      await set(newPaymentRef, {
        studentId: newAdmissionRef.key,
        name: formData.name,
        class: formData.class,
        status: 'Not Paid',
        timestamp: Date.now()
      });

      toast.success('Student registered successfully!');
      setFormData({
        name: '',
        email: '',
        phone: '',
        class: '',
        address: '',
        username: 'admin_registered'
      });
    } catch (error) {
      console.error('Error registering student:', error);
      toast.error('Failed to register student. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-reg-container">
      <div className="admin-reg-content">
        <h1>Register New Student</h1>
        <form onSubmit={handleSubmit} className="admin-reg-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
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
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
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
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Registering...' : 'Register Student'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminReg; 