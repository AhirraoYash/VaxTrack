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
          {user && <span className="text-white">{user.role} !</span>}
        </Link>
        <nav className="flex items-center space-x-6">
          <NavLink to="/camps" className="hover:text-blue-200">
            Find Camps
          </NavLink>
          {/* create create camp button for organizer */}
          {user && user.role === 'organizer' && (
            <NavLink to="/create-camp" className="hover:text-blue-200">
              Create Camp
            </NavLink>
          )}
          {/*show only organizer not benefier*/}
          {user && user.role === 'organizer' && (
          <NavLink to="/my-camps" className="hover:text-blue-200">
                My Camps
              </NavLink>)}

          {user  && (
            <NavLink to="/dashboard"  className="hover:text-blue-200">
              My booking
            </NavLink>
          )}
          {isAuthenticated ? (
            <>
              
              <span className="font-semibold">Welcome, {user.name}!</span>
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
          {user && user.role === 'organizer' && (
            <NavLink to="/organizer-profile" className="hover:text-blue-200">
              Profile
            </NavLink>
          )}
          {
            user && user.role === 'beneficiary' && (
              <NavLink to="/beneficiary-profile" className="hover:text-blue-200">
                Profile
              </NavLink>
            )
          }
        </nav>
      </div>
    </header>
  );
};

export default Header;