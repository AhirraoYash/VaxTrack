import React, { useState, useEffect, useMemo } from 'react'; // --- NEW: Added useMemo ---
import useCamps from '../hooks/useCamps';
import campService from '../api/campService';
import appointmentService from '../api/appointmentService';
import { useAuth } from '../context/AuthContext';
import { Search } from 'lucide-react'; // --- NEW: Icon for search bar ---

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

// --- Main FindCampsPage Component ---
const FindCampsPage = () => {
  const { camps, loading: loadingList, error: listError } = useCamps();
  const { user } = useAuth();
  
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
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  
  // --- NEW: State for the search filter ---
  const [searchQuery, setSearchQuery] = useState('');

  
  // --- Fetch user's appointments (No Change) ---
  useEffect(() => {
    const fetchMyAppointments = async () => {
      try {
        const data = await appointmentService.getMyAppointments();
        const campIds = new Set(data.map(app => app.camp._id));
        setBookedCampIds(campIds);
      } catch (err) {
        console.error("Failed to fetch user appointments:", err);
      } finally {
        setLoadingAppointments(false);
      }
    };

    if (user) {
      fetchMyAppointments();
    } else {
      setLoadingAppointments(false); 
    }
  }, [user]);
  
  // --- NEW: Memoized filter logic ---
  // This filters the camps based on the search query
  const filteredCamps = useMemo(() => {
    // If camps isn't an array yet, return an empty one
    if (!Array.isArray(camps)) {
      return [];
    }
    // If no search query, return all camps
    if (!searchQuery) {
      return camps;
    }
    // Return filtered list
    return camps.filter(camp =>
      camp.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [camps, searchQuery]); // Re-run only if camps or searchQuery change


  // --- Modal and Booking Handlers (No Change) ---

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

  // --- Main Render ---
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Available Vaccination Camps</h1>
      
      {/* --- NEW: Search Bar --- */}
      <div className="mb-8 max-w-2xl mx-auto">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for camps by name..."
            className="w-full p-4 pl-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </div>
      
      {/* --- Loading / Error States --- */}
      {(loadingList || loadingAppointments) && <div className="text-center mt-10">Loading camps...</div>} 
      {listError && <div className="text-center mt-10 text-red-500">{listError}</div>}
      
      {/* --- CAMP LIST --- */}
      {/* --- MODIFIED: Map over filteredCamps --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCamps && filteredCamps.map((camp) => {
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

              {/* --- Conditional Button Rendering (No Change) --- */}
              {isBooked ? (
                <div className="w-full bg-green-500 text-white py-3 font-semibold text-center cursor-not-allowed">
                  Already Booked
                </div>
              ) : (
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

      {/* --- NEW: No Results Message --- */}
      {!loadingList && filteredCamps.length === 0 && (
        <div className="text-center mt-16 text-gray-500">
          <h2 className="text-2xl font-semibold">No Camps Found</h2>
          {searchQuery ? (
            <p className="text-lg mt-2">No camps matched your search for: "{searchQuery}"</p>
          ) : (
            <p className="text-lg mt-2">There are no active camps at this time. Please check back later.</p>
          )}
        </div>
      )}


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