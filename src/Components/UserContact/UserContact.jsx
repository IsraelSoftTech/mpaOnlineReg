import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './UserContact.css';
import { AdmissionContext } from '../AdmissionContext';
import { database } from '../../firebase';
import { ref, push, onValue } from 'firebase/database';
import UserNav from '../Shared/UserNav';

const UserContact = () => {
  const navigate = useNavigate();
  const { currentUser } = useContext(AdmissionContext);

  return (
    <div className="user-contact-container">
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
      <UserNav />
      <main className="user-contact-main">
        {/* ... rest of the existing JSX ... */}
      </main>
    </div>
  );
};

export default UserContact; 