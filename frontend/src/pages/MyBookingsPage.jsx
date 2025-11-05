import React, { useState, useEffect } from 'react';
import appointmentService from '../api/appointmentService'; // Make sure this path is correct
import { Link } from 'react-router-dom';
import { Calendar, MapPin, XCircle } from 'lucide-react'; // Using icons for a better UI

const MyBookingsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Confirmation Modal State
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [cancelError, setCancelError] = useState('');

  // Fetch appointments when the page loads
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await appointmentService.getMyAppointments();
        // Sort by date, newest first
        const sortedData = data.sort((a, b) => new Date(b.slotDate) - new Date(a.slotDate));
        setAppointments(sortedData);
      } catch (err) {
        setError('Failed to fetch your appointments.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // --- Cancelation Logic ---
  
  // 1. Show confirmation modal
  const promptCancel = (appointmentId) => {
    setSelectedAppId(appointmentId);
    setCancelError('');
    setShowConfirm(true);
  };

  // 2. Hide confirmation modal
  const closeConfirm = () => {
    setShowConfirm(false);
    setSelectedAppId(null);
    setCancelError('');
  };

  // 3. Handle the final "Yes, Cancel" click
  const handleCancelBooking = async () => {
    if (!selectedAppId) return;

    try {
      setCancelError('');

      // --- THIS IS THE FIX ---
      // Your service file uses 'deleteAppointment', not 'cancelAppointment'
      await appointmentService.deleteAppointment(selectedAppId);
      // --- END OF FIX ---
      
      // If successful, remove the appointment from the list in the UI
      setAppointments(prevAppointments =>
        prevAppointments.filter(app => app._id !== selectedAppId)
      );
      closeConfirm(); // Close the modal
    } catch (err) {
      // --- IMPROVED ERROR ---
      // Show the specific error message from the backend
      const message = err.response?.data?.message || 'Failed to cancel appointment. Please try again.';
      setCancelError(message);
      console.error(err);
    }
  };

  // --- Render Status Badge ---
  const StatusBadge = ({ status }) => {
    let colorClasses = 'bg-yellow-100 text-yellow-800'; // Default: scheduled
    if (status === 'completed') {
      colorClasses = 'bg-green-100 text-green-800';
    } else if (status === 'cancelled' || status === 'noShow') {
      colorClasses = 'bg-red-100 text-red-800';
    }
    
    return (
      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${colorClasses}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // --- Render Loading State ---
  if (loading) {
    return <div className="text-center mt-10">Loading your bookings...</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-left">My Bookings</h1>

      {/* Show a general error message if one exists */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Show message if no appointments are found */}
      {!loading && appointments.length === 0 ? (
        <div className="text-center text-gray-500 bg-white p-12 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-2">No Bookings Found</h2>
          <p className="text-lg mb-6">You have no upcoming or past appointments.</p>
          <Link to="/camps">
            <button className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-all duration-300 font-semibold">
              Book a Camp
            </button>
          </Link>
        </div>
      ) : (
        // Display the list of appointment cards
        <div className="space-y-6">
          {appointments.map((app) => (
            <div key={app._id} className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
                  <h2 className="text-2xl font-bold text-blue-700 mb-2 sm:mb-0">
                    {app.camp?.name || 'Camp Details Unavailable'}
                  </h2>
                  <StatusBadge status={app.status} />
                </div>
                
                <div className="text-gray-700 space-y-3">
                  <div className="flex items-center">
                    <MapPin size={18} className="mr-3 text-gray-500" />
                    <span>{app.camp?.address || 'Address not found'}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar size={18} className="mr-3 text-gray-500" />
                    <span className="font-semibold">
                      {new Date(app.slotDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Card Footer with Cancel Button */}
              {/* --- UPDATED: Also allow canceling 'noShow' --- */}
              {(app.status === 'scheduled' || app.status === 'noShow') && (
                
                // --- MODIFIED SECTION ---
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end items-center space-x-3">
                  
                  {/* New Download Button */}
                  <button
                    className="flex items-center justify-center bg-blue-100 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-200 transition duration-300 font-semibold text-sm"
                  >
                    Download Report
                  </button>

                  {/* Existing Cancel Button */}
                  <button
                    onClick={() => promptCancel(app._id)}
                    className="flex items-center justify-center bg-red-100 text-red-700 py-2 px-4 rounded-lg hover:bg-red-200 transition duration-300 font-semibold text-sm"
                  >
                    <XCircle size={16} className="mr-2" />
                    Cancel Booking
                  </button>
                </div>
                // --- END OF MODIFIED SECTION ---
              )}
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={closeConfirm}>
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Are you sure?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to cancel this appointment? This action cannot be undone.
              </p>
              
              {cancelError && (
                <p className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{cancelError}</p>
              )}

              <div className="flex justify-end space-x-4">
                <button
                  onClick={closeConfirm}
                  className="bg-gray-200 text-gray-800 py-2 px-6 rounded-lg hover:bg-gray-300 font-semibold"
                >
                  Go Back
                </button>
                <button
                  onClick={handleCancelBooking}
                  className="bg-red-600 text-white py-2 px-6 rounded-lg hover:bg-red-700 font-semibold"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;