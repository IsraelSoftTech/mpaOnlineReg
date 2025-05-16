import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Signin from './Components/Signin/Signin';
import Signup from './Components/Signup/Signup';
import About from './Components/About/About';
import Admin from './Components/Admin/Admin';
import Department from './Components/Departments/Department';
import UserAdmission from './Components/UserAdmission/UserAdmission';
import AdminAdmission from './Components/AdminAdmission/AdminAdmission';
import CreateClass from './Components/Admin/CreateClass';
import { AdmissionProvider } from './Components/AdmissionContext';
import Payment from './Components/Payment/Payment';
import UserTrack from './Components/UserTrack/UserTrack';
import Profile from './Components/Profile/Profile';
import IDCards from './Components/Admin/IDCards';
import AdminPay from './Components/Admin/AdminPay';
import UserContact from './Components/Contact/UserContact';
import AdminContact from './Components/Contact/AdminContact';
import Interviews from './Components/Interviews/Interviews';
import './Components/common.css';

function App() {
  return (
    <Router>
      <AdmissionProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/about" element={<About />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected User Routes */}
          <Route path="/userAdmission" element={<UserAdmission />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/usertrack" element={<UserTrack />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/contact" element={<UserContact />} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<Admin />} />
          <Route path="/adminpay" element={<AdminPay />} />
          <Route path="/departments" element={<Department />} />
          <Route path="/classes" element={<CreateClass />} />
          <Route path="/adminAdmission" element={<AdminAdmission />} />
          <Route path="/idcards" element={<IDCards />} />
          <Route path="/admincontact" element={<AdminContact />} />
          <Route path="/interviews" element={<Interviews />} />

          {/* Default Routes */}
          <Route path="/" element={<Navigate to="/about" replace />} />
          <Route path="*" element={<Navigate to="/about" replace />} />
        </Routes>
      </AdmissionProvider>
    </Router>
  );
}

export default App;
