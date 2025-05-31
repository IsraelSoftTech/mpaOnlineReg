import { initializeApp } from "firebase/app";
import { getDatabase, connectDatabaseEmulator } from "firebase/database";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getAuth, connectAuthEmulator } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBu_nTtUzjTf1K_1P0yF6_KBa7pX_r7d74",
  authDomain: "idmachine.firebaseapp.com",
  databaseURL: "https://idmachine-default-rtdb.firebaseio.com",
  projectId: "idmachine",
  storageBucket: "idmachine.appspot.com",
  messagingSenderId: "528831135229",
  appId: "1:528831135229:web:4c6d48048874d746616d94"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services with security rules
const database = getDatabase(app);
const storage = getStorage(app);
const auth = getAuth(app);

// Security rules for database
const databaseRules = {
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "admissions": {
      ".read": "auth != null",
      ".write": "auth != null && (auth.token.role === 'admin' || auth.token.role === 'user')"
    },
    "payments": {
      ".read": "auth != null",
      ".write": "auth != null && (auth.token.role === 'admin' || auth.token.role === 'user')"
    },
    "users": {
      "$uid": {
        ".read": "auth != null && (auth.uid === $uid || auth.token.role === 'admin')",
        ".write": "auth != null && (auth.uid === $uid || auth.token.role === 'admin')"
      }
    }
  }
};

// Security rules for storage
const storageRules = {
  "rules": {
    "files": {
      ".read": "auth != null",
      ".write": "auth != null && (auth.token.role === 'admin' || auth.token.role === 'user')",
      "$fileId": {
        ".validate": "newData.hasChildren(['contentType', 'size', 'name'])"
      }
    }
  }
};

// Error handling for database operations
const handleDatabaseError = (error) => {
  console.error('Database Error:', error);
  // Implement your error handling logic here
  throw new Error('Database operation failed');
};

// Error handling for storage operations
const handleStorageError = (error) => {
  console.error('Storage Error:', error);
  // Implement your error handling logic here
  throw new Error('Storage operation failed');
};

// Error handling for authentication
const handleAuthError = (error) => {
  console.error('Authentication Error:', error);
  // Implement your error handling logic here
  throw new Error('Authentication failed');
};

// Export with error handling wrappers
export { 
  database, 
  storage, 
  auth,
  handleDatabaseError,
  handleStorageError,
  handleAuthError
}; 