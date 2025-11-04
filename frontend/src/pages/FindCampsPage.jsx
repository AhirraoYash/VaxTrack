// src/pages/FindCampsPage.jsx

import React, { useState, useEffect } from 'react';
import useCamps from '../hooks/useCamps';
import campService from '../api/campService';
import appointmentService from '../api/appointmentService';
import { useAuth } from '../context/AuthContext'; // --- NEW --- Import useAuth

// --- Modal Component (No Change) ---
const Modal = ({ children, onClose }) => (
  <div 
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    onClick={onClose}
  >
    <div
      className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-8 relative"> 
        <button 
          onClick={onClose} 
          className="absolute top-4 right-6 text-3xl font-light text-gray-500 hover:text-gray-800 z-10"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  </div>
);

// --- REMOVED BookingForm component ---


// --- Main FindCampsPage Component ---
const FindCampsPage = () => {
  const { camps, loading: loadingList, error: listError } = useCamps();
  const { user } = useAuth(); // --- NEW --- Get the logged-in user
  
  // State for the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCamp, setSelectedCamp] = useState(null); 
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  
  // State for the single booking button
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  
  // State for booked camps
  const [bookedCampIds, setBookedCampIds] = useState(new Set());
  const [loadingAppointments, setLoadingAppointments] = useState(true); // --- MODIFIED --- Start as true
  
  
  // --- MODIFIED ---
  // Fetch the user's appointments on page load, *if* they are logged in.
  useEffect(() => {
    const fetchMyAppointments = async () => {
      try {
        const data = await appointmentService.getMyAppointments();
        // Assuming data.data is an array of appointment objects
        const campIds = new Set(data.map(app => app.camp._id));
        console.log("campIds", campIds);
        setBookedCampIds(campIds);
      } catch (err) {
        console.error("Failed to fetch user appointments:", err);
      } finally {
        setLoadingAppointments(false);
      }
    };

    // --- NEW --- Only fetch if the user exists
    if (user) {
      fetchMyAppointments();
    } else {
      // If no user, we're done loading (with an empty list)
      setLoadingAppointments(false); 
    }

  }, [user]); // --- NEW --- This effect depends on the user
  

  // When user clicks "View Details"
  const handleViewDetails = async (campId) => {
    setIsModalOpen(true);
    setModalLoading(true);
    setModalError('');
    setBookingSuccess('');
    setBookingError('');
    setSelectedCamp(null);

    try {
      const data = await campService.getCampById(campId);
      setSelectedCamp(data);
    } catch (err) {
      setModalError('Failed to fetch camp details. Please try again.');
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCamp(null);
  };
  
  // Called on successful booking
  const handleBookingSuccess = (message) => {
    setBookingSuccess(message);

    // Add the newly booked camp to our list so the button updates instantly
    if (selectedCamp) {
      setBookedCampIds(prevIds => new Set(prevIds).add(selectedCamp._id));
    }

    setTimeout(() => {
      closeModal();
    }, 2000);
  };

  // This handles the single "Confirm Booking" click
  const handleConfirmBooking = async () => {
    setIsBooking(true);
    setBookingError('');
    try {
      const appointmentData = {
        camp: selectedCamp._id,
        slotDate: selectedCamp.startDate,
      };

      await appointmentService.bookAppointment(appointmentData);
      handleBookingSuccess('Appointment booked successfully!');

    } catch (err) {
      setBookingError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Available Vaccination Camps</h1>
      
      {/* --- CAMP LIST --- */}
      {/* --- MODIFIED --- Check both loading states */}
      {(loadingList || loadingAppointments) && <div className="text-center mt-10">Loading camps...</div>} 
      {listError && <div className="text-center mt-10 text-red-500">{listError}</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {camps && camps.map((camp) => {
          // Check if this camp is in the user's booked list
          const isBooked = bookedCampIds.has(camp._id);

          return (
            <div key={camp._id} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col border border-gray-100">
              <div className="p-6 flex-grow">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  camp.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {camp.status}
                </span>
                <h2 className="text-2xl font-bold text-gray-800 my-3">{camp.name}</h2>
                <p className="text-gray-600 mb-4 h-12">{camp.address}</p>
                <div className="text-sm text-gray-500">
                  <p>
                    <strong>Dates:</strong> {new Date(camp.startDate).toLocaleDateString()} - {new Date(camp.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* --- Conditional Button Rendering --- */}
              {isBooked ? (
                // If booked, show a green "Booked" button
                <div className="w-full bg-green-500 text-white py-3 font-semibold text-center cursor-not-allowed">
                  Already Booked
                </div>
              ) : (
                // Otherwise, show the normal button
                <button 
                  onClick={() => handleViewDetails(camp._id)}
                  className="w-full bg-blue-600 text-white py-3 font-semibold hover:bg-blue-700 transition duration-300"
                >
                  View Details & Book
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* --- MODAL (No Change) --- */}
      {isModalOpen && (
        <Modal onClose={closeModal}>
          {modalLoading && <div className="text-center p-12">Loading details...</div>}
          {modalError && <div className="text-center p-12 text-red-500">{modalError}</div>}
          {bookingSuccess && (
            <div className="text-center p-12">
              <h2 className="text-2xl font-bold text-green-600">{bookingSuccess}</h2>
              <p>Returning to camps list...</p>
            </div>
          )}

          {selectedCamp && !bookingSuccess && (
            <>
              {/* Camp Details Section */}
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                selectedCamp.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                Status: {selectedCamp.status}
              </span>
              <h1 className="text-4xl font-bold my-4">{selectedCamp.name}</h1>
              <p className="text-gray-600 text-lg mb-6">{selectedCamp.address}</p>
              
              {/* Timings Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Camp Date</h3>
                  <p className="text-gray-600">
                    {new Date(selectedCamp.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Daily Timings</h3>
                  <p className="text-gray-600">
                    {new Date(selectedCamp.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {' - '}
                    {new Date(selectedCamp.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              
              {/* Description Section */}
              <div className="my-6">
                <h3 className="text-xl font-bold mb-2">Description</h3>
                <p className="text-gray-600">{selectedCamp.description || 'No description available for this camp.'}</p>
              </div>

              {/* Show error message if booking fails */}
              {bookingError && <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{bookingError}</p>}

              {/* --- SINGLE CONFIRM BOOKING BUTTON --- */}
              <button
                onClick={handleConfirmBooking}
                disabled={isBooking}
                className="w-full mt-6 bg-green-500 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-green-600 transition duration-300 disabled:bg-gray-400"
              >
                {isBooking ? 'Booking...' : 'Confirm Booking'}
              </button>
            </>
          )}
        </Modal>
      )}
    </div>
  );
};

export default FindCampsPage;

