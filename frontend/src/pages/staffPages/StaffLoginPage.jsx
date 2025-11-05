// src/pages/StaffLoginPage.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// We no longer import campService directly
import { useAuth } from '../../context/AuthContext'; // Import your useAuth hook

const StaffLoginPage = () => {
  const [formData, setFormData] = useState({
    campAccessCode: '',
    staffEmail: '',
    staffPin: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Get the staffLogin function from your AuthContext
  const { staffLogin } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
  
    try {
      // --- THIS IS THE CHANGE ---
      // Call the staffLogin function from the context.
      // It will handle the API call and localStorage.
      await staffLogin(formData);
  
      // 2. Redirect to the staff dashboard
      navigate('/staff-dashboard'); 
      
    } catch (err) {
      // The context function will throw an error if login fails
      const message = err.response?.data?.message || err.message || "Login Failed";
      setError(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Staff Login</h2>
        {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>}
        
        {/* --- Camp Access Code Field --- */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="campAccessCode">
            Camp Access Code
          </label>
          <input
            type="text"
            name="campAccessCode"
            id="campAccessCode"
            value={formData.campAccessCode}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* --- Staff Email Field --- */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="staffEmail">
            Your Staff Email
          </label>
          <input
            type="email"
            name="staffEmail"
            id="staffEmail"
            value={formData.staffEmail}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* --- Staff PIN Field --- */}
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="staffPin">
            Staff PIN
          </label>
          <input
            type="password"
            name="staffPin"
            id="staffPin"
            value={formData.staffPin}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-blue-300"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login as Staff'}
        </button>

        <p className="text-center mt-4">
          Are you an organizer?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Organizer Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default StaffLoginPage;