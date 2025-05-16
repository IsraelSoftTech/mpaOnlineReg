import React, { createContext, useState, useEffect } from 'react';
import { database } from '../firebase';
import { ref, push, onValue, update, get } from 'firebase/database';

export const AdmissionContext = createContext();

export const AdmissionProvider = ({ children }) => {
  const [allAdmissions, setAllAdmissions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [schoolClasses, setSchoolClasses] = useState([]);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [currentPassword, setCurrentPassword] = useState(null);

  // Filter admissions based on user role and current user
  const admissions = React.useMemo(() => {
    if (!currentUser || !currentUserData) return [];
    
    // If admin, return all admissions
    if (currentUserData.role === 'admin') {
      return allAdmissions;
    }
    
    // For regular users, return only their admissions
    return allAdmissions.filter(admission => admission.username === currentUser);
  }, [allAdmissions, currentUser, currentUserData]);

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
            setAllAdmissions(admissionsList);
          } else {
            setAllAdmissions([]);
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
      // Get a direct reference to the specific user's account
      const accountsRef = ref(database, 'accounts');
      const query = await get(accountsRef);
      const accounts = query.val();
      
      if (!accounts) {
        setError('Invalid credentials');
        return false;
      }

      // Find the matching account
      const accountEntry = Object.entries(accounts).find(([_, acc]) => 
        acc.username === username && acc.password === password
      );

      if (accountEntry) {
        const [id, account] = accountEntry;
        const userData = {
          id,
          ...account
        };
        
        // Set all user data at once to reduce re-renders
        setCurrentUser(username);
        setCurrentPassword(password);
        setCurrentUserData(userData);
        setError(null);

        // Cache user data in sessionStorage for faster subsequent loads
        sessionStorage.setItem('userData', JSON.stringify(userData));
        
        return true;
      }
      
      setError('Invalid credentials');
      return false;
    } catch (err) {
      console.error('Error during login:', err);
      setError('Error during login');
      return false;
    }
  };

  // Add a function to check for cached login
  const checkCachedLogin = () => {
    const cachedUserData = sessionStorage.getItem('userData');
    if (cachedUserData) {
      try {
        const userData = JSON.parse(cachedUserData);
        setCurrentUser(userData.username);
        setCurrentPassword(userData.password);
        setCurrentUserData(userData);
        return true;
      } catch (err) {
        console.error('Error parsing cached user data:', err);
        sessionStorage.removeItem('userData');
      }
    }
    return false;
  };

  // Modify logout to clear cache
  const logout = () => {
    setCurrentUser(null);
    setCurrentPassword(null);
    setCurrentUserData(null);
    sessionStorage.removeItem('userData');
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
    if (!currentUser) return;

    try {
      // Find the user's admission record
      const userAdmission = admissions.find(admission => admission.username === currentUser);
      if (!userAdmission) return;

      // Update the payment status in the database
      const admissionRef = ref(database, `admissions/${userAdmission.id}`);
      await update(admissionRef, {
        paymentStatus: status,
        paymentDetails: paymentDetails,
        paymentTimestamp: new Date().toISOString()
      });

      // Update local state
      setAllAdmissions(prevAdmissions => 
        prevAdmissions.map(admission => 
          admission.id === userAdmission.id 
            ? { 
                ...admission, 
                paymentStatus: status,
                paymentDetails: paymentDetails,
                paymentTimestamp: new Date().toISOString()
              } 
            : admission
        )
      );

      return true;
    } catch (error) {
      console.error('Error updating payment status:', error);
      return false;
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
      const updatedAdmissions = allAdmissions.map(adm => {
        if (adm.id === admissionId) {
          return {
            ...adm,
            ...updateData
          };
        }
        return adm;
      });
      
      setAllAdmissions(updatedAdmissions);
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
      error,
      currentUser,
      currentUserData,
      addAccount,
      addAdmission,
      updateProfile,
      login,
      logout,
      addSchoolClass,
      updatePaymentStatus,
      updateAdmissionStatus,
      setCurrentUser,
      setCurrentPassword,
      setCurrentUserData
    }}>
      {children}
    </AdmissionContext.Provider>
  );
}; 