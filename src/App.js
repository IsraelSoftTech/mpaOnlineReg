import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import Loader from './Components/Common/Loader';
import Footer from './Components/Common/Footer';
import './Components/common.css';
import AdminReg from './Components/AdminRegistration/AdminReg';
import AdminTrack from './Components/AdminTrack/AdminTrack';
import AdminPayPage from './Components/AdminPayPage/AdminPayPage';
import UserResult from './Components/Results/UserResult';


// Add this style to ensure footer stays at bottom
const appStyle = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column'
};

// Wrapper component to handle route change detection
const AppContent = () => {
  const location = useLocation();
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const handleRouteChange = async () => {
      setLoading(true);
      // Wait for 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(false);
    };

    handleRouteChange();
  }, [location]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div style={appStyle}>
      <div style={{ flex: 1 }}>
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
          <Route path="/result" element={<UserResult />} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<Admin />} />
          <Route path="/adminpay" element={<AdminPay />} />
          <Route path="/departments" element={<Department />} />
          <Route path="/classes" element={<CreateClass />} />
          <Route path="/adminAdmission" element={<AdminAdmission />} />
          <Route path="/idcards" element={<IDCards />} />
          <Route path="/admincontact" element={<AdminContact />} />
          <Route path="/interviews" element={<Interviews />} />
          <Route path="/adminreg" element={<AdminReg />} />
          <Route path="/admintrack" element={<AdminTrack />} />
          <Route path="/adminpaypage" element={<AdminPayPage />} />
       

          {/* Default Routes */}
          <Route path="/" element={<Navigate to="/about" replace />} />
          <Route path="*" element={<Navigate to="/about" replace />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AdmissionProvider>
        <AppContent />
      </AdmissionProvider>
    </Router>
  );
}

export default App;
