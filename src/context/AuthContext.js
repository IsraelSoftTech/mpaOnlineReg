import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (e.g., check localStorage or token)
    const token = localStorage.getItem('token');
    if (token) {
      // Validate token and get user info
      // For now, we'll just set a mock user
      setUser({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'user'
      });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Make API call to login
      // For now, we'll just set a mock user
      const mockUser = {
        id: 1,
        name: 'Test User',
        email,
        role: email.includes('admin') ? 'admin' : 'user'
      };
      localStorage.setItem('token', 'mock-token');
      setUser(mockUser);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      // Make API call to register
      // For now, we'll just set a mock user
      const mockUser = {
        id: 1,
        name: userData.fullName,
        email: userData.email,
        role: 'user'
      };
      localStorage.setItem('token', 'mock-token');
      setUser(mockUser);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 