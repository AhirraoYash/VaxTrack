// src/components/layout/Header.jsx

import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center p-4">
        <Link to="/" className="text-2xl font-bold tracking-tight">
          VaxTrack 💉
          {/* --- FIX 1: Safely show user role --- */}
          {user?.role && (
            <span className="text-sm ml-2 px-2 py-0.5 bg-white/20 rounded-full">
              {user.role}
            </span>
          )}
        </Link>
        <nav className="flex items-center space-x-6">
          <NavLink to="/camps" className="hover:text-blue-200">
            Find Camps
          </NavLink>
          
          {/* --- FIX 2: Role-based navigation --- */}

          {/* Organizer Links */}
          {user && user.role === 'organizer' && (
            <NavLink to="/my-camps" className="hover:text-blue-200">
              My Camps
            </NavLink>
          )}

          {/* Beneficiary Links (assuming default role is 'beneficiary') */}
          {user && (user.role === 'beneficiary' || !user.role) && (
            <NavLink to="/my-booking" className="hover:text-blue-200">
              My Bookings
            </NavLink>
          )}

          {/* Staff Links */}
          {user && user.role === 'staff' && (
            <NavLink to="/staff-dashboard" className="hover:text-blue-200">
              Staff Dashboard
            </NavLink>
          )}
          
          
          {isAuthenticated ? (
            <>
              {/* --- FIX 3: Safe display for user name --- */}
              <span className="font-semibold">
                Welcome, {user?.name || user?.email || 'User'}
              </span>
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 px-3 py-2 rounded-md font-bold"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="space-x-4">
              <NavLink
                to="/login"
                className="bg-white text-blue-600 hover:bg-gray-100 px-3 py-2 rounded-md font-bold"
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                className="bg-green-500 hover:bg-green-600 px-3 py-2 rounded-md font-bold"
              >
                Register
              </NavLink>
            </div>
          )}
            
        </nav>
      </div>
    </header>
  );
};

export default Header;