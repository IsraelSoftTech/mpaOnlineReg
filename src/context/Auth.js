import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/verify-token', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setUser(response.data.user);
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      setError(null);
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        username,
        password
      });

      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        setUser(user);
        return { success: true };
      } else {
        setError(response.data.message || 'Login failed');
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await axios.post('http://localhost:5000/api/auth/register', userData);

      if (response.data.success) {
        return { success: true };
      } else {
        setError(response.data.message || 'Registration failed');
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const resetPassword = async (username, newPassword) => {
    try {
      setError(null);
      const response = await axios.post('http://localhost:5000/api/auth/reset-password', {
        username,
        newPassword
      });

      if (response.data.success) {
        return { success: true };
      } else {
        setError(response.data.message || 'Password reset failed');
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Password reset failed');
      return { success: false, message: error.response?.data?.message || 'Password reset failed' };
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 