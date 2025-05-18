import React, { useState, useEffect } from 'react';
import { database } from '../../firebase';
import { ref, onValue, push, update, remove } from 'firebase/database';
import AdminNav from './AdminNav';
import './Departments.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Departments = () => {
  // ... keep existing state and functions ...

  return (
    <div className="departments-wrapper">
      <AdminNav />
      <ToastContainer position="top-right" autoClose={3000} />
      <main className="departments-main">
        // ... keep rest of the existing JSX ...
      </main>
    </div>
  );
};

export default Departments; 