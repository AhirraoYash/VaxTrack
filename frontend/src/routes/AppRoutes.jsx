// src/routes/AppRoutes.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// --- Import all our Page Components ---
// (We will create these files in the next steps, for now, they are just placeholders)
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage';
import FindCampsPage from '../pages/FindCampsPage';
import CampDetailsPage from '../pages/CampDetailsPage';
import MyDashboardPage from '../pages/MyDashboardPage';
import CreateCamp from '../pages/CreateCamp';
import MyCampsPage from '../pages/MyCampsPage';
// ... import other pages like AdminDashboard, OrganizerDashboard etc.

const AppRoutes = () => {
  return (
    <Routes>
      {/* --- Public Routes --- */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/camps" element={<FindCampsPage />} />
      <Route path="/camps/:id" element={<CampDetailsPage />} />
      
      {/* --- Protected Routes (Beneficiary) --- */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MyDashboardPage />
          </ProtectedRoute>
        }
      />

<Route path="/create-camp" element={
  <ProtectedRoute>
    <CreateCamp />
  </ProtectedRoute>
} />  

  <Route path="/my-camps" element={
    <ProtectedRoute>
      <MyCampsPage />
    </ProtectedRoute>
  } />  
      {/* Add more protected routes for Organizers, Vaccinators, and Admins here */}
      {/* Example for an Admin route */}
      {/*
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      */}

      {/* --- Catch-all Route for 404 Not Found --- */}
      <Route path="*" element={<h1>404: Page Not Found</h1>} />
    </Routes>
  );
};

export default AppRoutes;