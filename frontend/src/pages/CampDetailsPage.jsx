// src/pages/CampDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // --- ADDED useNavigate ---
import campService from '../api/campService';
import { useAuth } from '../context/AuthContext'; // --- ADDED useAuth ---

const CampDetailsPage = () => {
  const [camp, setCamp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams();
  
  // --- ADDED: Hooks for auth and navigation ---
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCamp = async () => {
      console.log("user");
      console.log(user);
      try {
        const data = await campService.getCampById(id);
        setCamp(data);
      } catch (err) {
        setError('Failed to fetch camp details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCamp();
  }, [id]);

  // --- ADDED: Handle Book Button Click ---
  const handleBookAppointment = () => {

    console.log("user");
    console.log(user);
    if (!user) {
      // If no user, redirect to login
      // We also pass where they came from, so login can send them back
      navigate('/login', { state: { from: `/camps/${id}` } });
    } else {
      // If user is logged in, send them to the booking page
      // (You'll need to create this booking page/modal)
      navigate(`/book-appointment/${id}`);
    }
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
      case 'cancelled': // You can add 'cancelled' from backend if it exists
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return <div className="text-center mt-10">Loading camp details...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  if (!camp) {
    return <div className="text-center mt-10">Camp not found.</div>;
  }

  // --- ADDED: Frontend Status Calculation ---
  // This logic runs *every time* the component renders
  const now = new Date();
  const startDate = new Date(camp.startDate);
  const endDate = new Date(camp.endDate);

  let derivedStatus = 'upcoming';
  let statusMessage = 'Booking is available until the camp starts.';

  if (now > endDate) {
    derivedStatus = 'completed';
    statusMessage = 'Booking is no longer available.';
  } else if (now >= startDate && now <= endDate) {
    derivedStatus = 'active';
    statusMessage = 'Booking closed, camp is in progress.';
  }
  // --- End of new logic ---

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg">
      
      {/* --- UPDATED: Uses our new 'derivedStatus' --- */}
      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusClasses(derivedStatus)}`}>
        Status: {derivedStatus.charAt(0).toUpperCase() + derivedStatus.slice(1)}
      </span>
      
      <h1 className="text-4xl font-bold my-4">{camp.name}</h1>
      <p className="text-gray-600 text-lg mb-6">{camp.address}</p>

      <div className="my-6">
        <h3 className="text-xl font-bold mb-2">Vaccine Inventory</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border-b">Vaccine Name</th>
                <th className="py-2 px-4 border-b">Quantity Available</th>
              </tr>
            </thead>
            <tbody>
              {camp.vaccineInventory.length > 0 ? (
                camp.vaccineInventory.map((item) => (
                  <tr key={item._id} className="text-center">
                    <td className="py-2 px-4 border-b">{item.vaccine?.name || 'N/A'}</td>
                    <td className="py-2 px-4 border-b">{item.quantity}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="py-4 px-4 text-center text-gray-500">
                    Vaccine inventory not listed.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* --- UPDATED: Conditional Button Logic based on 'derivedStatus' --- */}
      {derivedStatus === 'upcoming' ? (
        <button 
          onClick={handleBookAppointment} // --- ADDED: Click handler
          className="w-full bg-green-500 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-green-600"
        >
          Book Appointment
        </button>
      ) : (
        <div className="w-full bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-lg text-lg text-center cursor-not-allowed">
          {/* --- UPDATED: Uses our new 'statusMessage' --- */}
          {statusMessage}
        </div>
      )}

    </div>
  );
};

export default CampDetailsPage; 