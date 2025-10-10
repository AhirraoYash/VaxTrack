// src/context/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../api/authService';

// 1. Create the context
const AuthContext = createContext(null);

// 2. Create the Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // To handle initial page load check

  // Check if user is already logged in when the app loads
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false); // Finished checking
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const userData = await authService.login({ email, password });
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Login failed:', error);
      // We should handle and display this error in the UI
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const newUser = await authService.register(userData);
      setUser(newUser);
      return newUser;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // The value that will be available to all children components
  const value = {
    user,
    isAuthenticated: !!user, // A handy boolean to check if user is logged in
    loading,

    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// 3. Create a custom hook for easy access to the context
export const useAuth = () => {
  return useContext(AuthContext);
};