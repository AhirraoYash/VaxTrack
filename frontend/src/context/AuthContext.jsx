// src/context/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../api/authService';
// --- FIX 1: Import campService ---
import campService from '../api/campService';

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
    // --- FIX 2: Also clear staff login info ---
    localStorage.removeItem('staffToken');
    localStorage.removeItem('staffInfo');
  };

  // --- FIX 3: Add the staffLogin function ---
  const staffLogin = async (loginData) => {
    // 'loginData' is the { campAccessCode, staffEmail, staffPin } object
    try {
      // 1. Call the API service
      const res = await campService.staffLogin(loginData);

      // 2. Save data to localStorage
      localStorage.setItem('staffToken', res.staffIdentifier);
      localStorage.setItem('staffInfo', JSON.stringify(res));

      // 3. (Optional) You could set the user state here if you want
      // setUser({ role: 'staff', email: res.staffIdentifier, ...res });
      
      // 4. Return the data
      return res;

    } catch (err) {
      // 5. If it fails, throw the error so the page can catch it
      console.error("AuthContext staffLogin error:", err);
      throw err;
    }
  };

  // The value that will be available to all children components
  const value = {
    user,
    isAuthenticated: !!user, // A handy boolean to check if user is logged in
    loading,

    login,
    register,
    logout,
    staffLogin, // --- FIX 4: Add staffLogin to the value ---
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