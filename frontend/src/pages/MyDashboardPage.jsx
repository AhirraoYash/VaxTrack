// src/pages/MyDashboardPage.jsx

import React, { useState, useEffect } from 'react';
import appointmentService from '../api/appointmentService';
import { useAuth } from '../context/AuthContext';

const MyDashboardPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await appointmentService.getMyAppointments();
        setAppointments(data);
      } catch (err) {
        setError('Could not fetch your appointments.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Welcome back, <span className="text-blue-600">{user?.name}!</span>
      </h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Your Appointments</h2>
        {loading && <p>Loading your appointments...</p>}
        {error && <p className="text-red-500">{error}</p>}
        
        {!loading && !error && (
          appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map(app => (
                <div key={app._id} className="border p-4 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-bold">{app.camp?.name || 'Camp details unavailable'}</p>
                    <p className="text-sm text-gray-600">Vaccine: {app.vaccine?.name || 'N/A'}</p>
                    <p className="text-sm text-gray-600">Date: {new Date(app.slotDate).toLocaleString()}</p>
                  </div>
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                      app.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p>You have no appointments scheduled.</p>
          )
        )}
      </div>
    </div>
  );
};

export default MyDashboardPage;