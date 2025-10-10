// src/pages/HomePage.jsx

import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {

  return (
    <div className="text-center">
      {/* Hero Section */}
      <div className="bg-white p-10 rounded-lg shadow-xl">
        <h1 className="text-5xl font-bold text-blue-600 mb-4">
          Welcome to VaxTrack
        </h1>
        <p className="text-lg text-gray-700 mb-8">
          Your one-stop solution for managing and finding vaccination camps with ease.
          Register, find a camp, and book your slot in minutes.
        </p>
        <Link
          to="/camps"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full text-xl transition duration-300 ease-in-out transform hover:scale-105"
        >
          Find a Camp Near You
        </Link>
      </div>

      {/* Features Section */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-xl font-semibold mb-2">1. Find a Camp</h3>
            <p className="text-gray-600">
              Easily search for vaccination camps in your area using our interactive map and search filters.
            </p>
          </div>
          {/* Feature 2 */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-xl font-semibold mb-2">2. Register & Login</h3>
            <p className="text-gray-600">
              Create an account in seconds to manage your appointments and view your vaccination history.
            </p>
          </div>
          {/* Feature 3 */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-xl font-semibold mb-2">3. Book Your Slot</h3>
            <p className="text-gray-600">
              Select an available time slot that works for you and confirm your appointment instantly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;