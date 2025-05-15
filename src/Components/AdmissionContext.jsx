import React, { createContext, useState, useEffect } from 'react';
import { database } from '../firebase';
import { ref, push, onValue, update, get, child } from 'firebase/database';

export const AdmissionContext = createContext();

export const AdmissionProvider = ({ children }) => {
  const [admissions, setAdmissions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [schoolClasses, setSchoolClasses] = useState([]);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [currentPassword, setCurrentPassword] = useState(null);

  useEffect(() => {
    try {
      // Listen for admissions changes
      const admissionsRef = ref(database, 'admissions');
      const accountsRef = ref(database, 'accounts');
      const classesRef = ref(database, 'schoolClasses');
      
      const unsubscribeAdmissions = onValue(admissionsRef, (snapshot) => {
        try {
          const data = snapshot.val();
          if (data) {
            const admissionsList = Object.entries(data).map(([id, admission]) => ({
              id,
              ...admission
            }));
            setAdmissions(admissionsList);
          } else {
            setAdmissions([]);
          }
        } catch (err) {
          console.error('Error processing admissions data:', err);
          setError('Error loading applications');
        }
      });

      // Listen for accounts changes
      const unsubscribeAccounts = onValue(accountsRef, (snapshot) => {
        try {
          const data = snapshot.val();
          if (data) {
            const accountsList = Object.entries(data).map(([id, account]) => ({
              id,
              ...account
            }));
            setAccounts(accountsList);
            
            // Update currentUserData when accounts change
            if (currentUser && currentPassword) {
              const userData = accountsList.find(
                account => account.username === currentUser && 
                account.password === currentPassword
              );
              setCurrentUserData(userData);
            }
          } else {
            setAccounts([]);
          }
        } catch (err) {
          console.error('Error processing accounts data:', err);
          setError('Error loading accounts');
        }
      });

      // Listen for school classes changes
      const unsubscribeClasses = onValue(classesRef, (snapshot) => {
        try {
          const data = snapshot.val();
          if (data) {
            const classesList = Object.entries(data).map(([id, classData]) => ({
              id,
              ...classData
            }));
            setSchoolClasses(classesList.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
          } else {
            setSchoolClasses([]);
          }
        } catch (err) {
          console.error('Error processing school classes data:', err);
          setError('Error loading school classes');
        }
      });

      return () => {
        unsubscribeAdmissions();
        unsubscribeAccounts();
        unsubscribeClasses();
      };
    } catch (err) {
      console.error('Error setting up database connection:', err);
      setError('Error connecting to database');
    }
  }, [currentUser, currentPassword]);

  const addAccount = async (account) => {
    try {
      // Check if username already exists
      const accountsRef = ref(database, 'accounts');
      const snapshot = await get(accountsRef);
      const accounts = snapshot.val();
      
      if (accounts) {
        const exists = Object.values(accounts).some(
          acc => acc.username === account.username || acc.email === account.email
        );
        if (exists) {
          setError('Username or email already exists');
          return false;
        }
      }

      // Add new account
      await push(accountsRef, {
        ...account,
        timestamp: new Date().toISOString()
      });
      setError(null);
      return true;
    } catch (err) {
      console.error('Error adding account:', err);
      setError('Error creating account');
      return false;
    }
  };

  const addAdmission = async (admission) => {
    try {
      const admissionsRef = ref(database, 'admissions');
      await push(admissionsRef, {
        ...admission,
        timestamp: new Date().toISOString()
      });
      setError(null);
      return true;
    } catch (err) {
      console.error('Error adding admission:', err);
      setError('Error submitting application');
      return false;
    }
  };

  const updateProfile = async (userId, profileData) => {
    try {
      const userRef = ref(database, `accounts/${userId}`);
      await update(userRef, {
        ...profileData,
        lastUpdated: new Date().toISOString()
      });
      
      // Update local state immediately
      setCurrentUser(profileData.username);
      setCurrentPassword(profileData.password);
      setCurrentUserData({
        ...currentUserData,
        ...profileData,
        lastUpdated: new Date().toISOString()
      });
      
      setError(null);
      return true;
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Error updating profile');
      return false;
    }
  };

  const login = async (username, password) => {
    try {
      const accountsRef = ref(database, 'accounts');
      const snapshot = await get(accountsRef);
      const accounts = snapshot.val();
      
      if (accounts) {
        const account = Object.values(accounts).find(
          acc => acc.username === username && acc.password === password
        );
        
        if (account) {
          setCurrentUser(username);
          setCurrentPassword(password);
          setCurrentUserData(account);
          setError(null);
          return true;
        }
      }
      
      setError('Invalid credentials');
      return false;
    } catch (err) {
      console.error('Error during login:', err);
      setError('Error during login');
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentPassword(null);
    setCurrentUserData(null);
  };

  const addSchoolClass = async (classData) => {
    try {
      // Check if class name already exists
      const classesRef = ref(database, 'schoolClasses');
      const snapshot = await get(classesRef);
      const classes = snapshot.val();
      
      if (classes) {
        const exists = Object.values(classes).some(
          cls => cls.className.toLowerCase() === classData.className.toLowerCase()
        );
        if (exists) {
          setError('A class with this name already exists');
          return false;
        }
      }

      // Add new class
      await push(classesRef, classData);
      setError(null);
      return true;
    } catch (err) {
      console.error('Error adding school class:', err);
      setError('Error creating class');
      return false;
    }
  };

  // Update payment status
  const updatePaymentStatus = async (status, paymentDetails = null) => {
    if (currentUser) {
      try {
        // Find the user's admission
        const admission = admissions.find(adm => adm.userId === currentUser.id);
        if (admission) {
          // Update the admission with payment status and details
          const admissionRef = ref(database, `admissions/${admission.id}`);
          const updateData = {
            paymentStatus: status,
            status: 'Pending', // Keep status as pending until admin approval
            lastUpdated: new Date().toISOString()
          };

          // If payment details are provided, add them to the update
          if (paymentDetails) {
            updateData.paymentDetails = {
              ...paymentDetails,
              submittedAt: new Date().toISOString()
            };
          }

          await update(admissionRef, updateData);
          
          // Update local state
          const updatedAdmissions = admissions.map(adm => {
            if (adm.id === admission.id) {
              return {
                ...adm,
                ...updateData
              };
            }
            return adm;
          });
          
          setAdmissions(updatedAdmissions);
        }
      } catch (error) {
        console.error('Error updating payment status:', error);
        setError('Error updating payment status');
      }
    }
  };

  // Update admission status (for payment validation)
  const updateAdmissionStatus = async (admissionId, status) => {
    try {
      const admissionRef = ref(database, `admissions/${admissionId}`);
      const updateData = {
        status,
        paymentStatus: status,
        lastUpdated: new Date().toISOString()
      };

      await update(admissionRef, updateData);
      
      // Update local state
      const updatedAdmissions = admissions.map(adm => {
        if (adm.id === admissionId) {
          return {
            ...adm,
            ...updateData
          };
        }
        return adm;
      });
      
      setAdmissions(updatedAdmissions);
      return true;
    } catch (error) {
      console.error('Error updating admission status:', error);
      setError('Error updating admission status');
      return false;
    }
  };

  return (
    <AdmissionContext.Provider value={{ 
      admissions,
      accounts, 
      schoolClasses,
      addAdmission,
      addAccount,
      addSchoolClass,
      error, 
      currentUser,
      setCurrentUser,
      currentUserData,
      updateProfile,
      login,
      logout,
      updatePaymentStatus,
      updateAdmissionStatus
    }}>
      {children}
    </AdmissionContext.Provider>
  );
}; 