import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, User, Phone, Clock, FileText } from 'lucide-react';
// Import campService
import campService from '../../api/campService.js'; 

// --- Re-usable Status Badge ---
const StatusBadge = ({ status }) => {
  let colorClasses = 'bg-yellow-100 text-yellow-800'; // scheduled
  if (status === 'completed') {
    colorClasses = 'bg-green-100 text-green-800';
  } else if (status === 'cancelled' || status === 'noShow') {
    colorClasses = 'bg-red-100 text-red-800';
  }
  
  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${colorClasses}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};


// --- Main Dashboard Component ---
const StaffDashboardPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [campInfo, setCampInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- NEW: State for the Remark Modal ---
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  // This will store { id: '...', status: '...' }
  const [currentAppointment, setCurrentAppointment] = useState(null); 
  const [remarkText, setRemarkText] = useState('');


  // --- 1. Load Camp Info & Fetch Appointments ---
  useEffect(() => {
    // Get camp info saved during login
    const storedInfo = localStorage.getItem('staffInfo');
    if (!storedInfo) {
      setError('Could not find staff info. Please log in again.');
      setLoading(false);
      return;
    }
    
    const parsedInfo = JSON.parse(storedInfo);
    setCampInfo(parsedInfo);
    
    // Fetch all camp details using the new endpoint
    const fetchCampDetails = async (campId) => {
      try {
        setLoading(true);
        const data = await campService.getCampDetailByCampId(campId);
        const sortedData = data.participants.sort((a, b) => new Date(a.slotDate) - new Date(b.slotDate));
        setAppointments(sortedData);
      } catch (err) {
        setError('Failed to fetch camp details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCampDetails(parsedInfo.campId);
  }, []); // Empty dependency array is correct

  
  // --- 2. Action Handlers (Optimistic UI Update) ---
  // This function is now called by the modal submit
  const handleUpdateStatus = (appId, newStatus) => {
    try {
      // For now, we'll just update the UI optimistically
      setAppointments(prevApps =>
        prevApps.map(app =>
          app._id === appId ? { ...app, status: newStatus } : app
        )
      );
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  // --- NEW: Functions to control the modal ---

  /**
   * Opens the remark modal and sets the current appointment details
   * @param {object} app - The full appointment object
   * @param {string} newStatus - The status to be set (e.g., 'completed', 'noShow')
   */
  const openRemarkModal = (app, newStatus) => {
    setCurrentAppointment({ id: app._id, status: newStatus, name: app.beneficiary?.name });
    setShowRemarkModal(true);
  };

  /**
   * Closes the modal and resets its state
   */
  const closeRemarkModal = () => {
    setShowRemarkModal(false);
    setCurrentAppointment(null);
    setRemarkText('');
  };

  /**
   * Handles the "Submit" click from the modal
   */
  const handleSubmitRemark = () => {
    if (!currentAppointment) return;

    // In a real app, you would send this to the API:
    // await appointmentService.updateAppointmentStatus(
    //   currentAppointment.id, 
    //   currentAppointment.status, 
    //   remarkText
    // );
    
    console.log('Submitting Remark for App ID:', currentAppointment.id);
    console.log('New Status:', currentAppointment.status);
    console.log('Remark:', remarkText);

    // Call the original optimistic UI update
    handleUpdateStatus(currentAppointment.id, currentAppointment.status);

    // Close the modal
    closeRemarkModal();
  };


  // --- 3. Render Helper ---
  const renderAppointmentRow = (app) => {
    const showActions = app.status === 'scheduled';
    
    return (
      <tr key={app._id} className="hover:bg-gray-50">
        
        {/* User Name */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <User size={18} className="text-gray-500 mr-3" />
            <div className="text-sm font-medium text-gray-900">{app.beneficiary?.name || 'N/A'}</div>
          </div>
        </td>
        
        {/* Phone Number */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <Phone size={18} className="text-gray-500 mr-3" />
            <div className="text-sm text-gray-700">{app.beneficiary?.phoneNumber || 'N/A'}</div>
          </div>
        </td>
        
        {/* Appointment Time */}
        <td className="px-6 py-4 whitespace-nowrap">
           <div className="flex items-center">
            <Clock size={18} className="text-gray-500 mr-3" />
            <div className="text-sm text-gray-700">
              {new Date(app.slotDate).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric'
              })}
              , 
              {new Date(app.slotDate).toLocaleTimeString('en-US', {
                hour: '2-digit', minute: '2-digit'
              })}
            </div>
          </div>
        </td>

        {/* Status / Remark */}
        <td className="px-6 py-4 whitespace-nowrap">
          <StatusBadge status={app.status} />
        </td>
        
        {/* Actions */}
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
          {showActions ? (
            <>
              {/* --- UPDATED: Call openRemarkModal --- */}
              <button
                onClick={() => openRemarkModal(app, 'completed')}
                className="flex-shrink-0 inline-flex items-center bg-green-100 text-green-700 py-1.5 px-3 rounded-lg hover:bg-green-200 transition"
              >
                <CheckCircle size={16} className="mr-2" />
                Done
              </button>
              {/* --- UPDATED: Call openRemarkModal --- */}
              <button
                onClick={() => openRemarkModal(app, 'noShow')}
                className="flex-shrink-0 inline-flex items-center bg-red-100 text-red-700 py-1.5 px-3 rounded-lg hover:bg-red-200 transition"
              >
                <XCircle size={16} className="mr-2" />
                No Show
              </button>
            </>
          ) : (
            <span className="text-gray-400 italic">N/A</span>
          )}
        </td>
      </tr>
    );
  };

  // --- 4. Main Render ---
  if (loading) {
    return <div className="text-center mt-20">Loading Dashboard...</div>;
  }
  
  return (
    <div className="container mx-auto p-4 md:p-8 max-w-7xl">
      
      {/* Header */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow-md border border-gray-100">
        <h1 className="text-3xl font-bold text-blue-800">
          {campInfo?.campName || 'Staff Dashboard'}
        </h1>
        <p className="text-lg text-gray-600 mt-1">
          Appointment Management
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Main Content: Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Beneficiary Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remark / Status
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.length > 0 ? (
                appointments.map(renderAppointmentRow)
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-gray-500 p-12">
                    <h3 className="text-xl font-medium">No participants found.</h3>
                    <p className="mt-1">There are no scheduled bookings for this camp yet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- NEW: Remark Modal --- */}
      {showRemarkModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={closeRemarkModal} // Close if clicking outside
        >
          <div 
            className="bg-white rounded-lg shadow-2xl w-full max-w-lg"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <FileText size={20} className="text-blue-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-800">
                  Add Remark for: <span className="text-blue-600">{currentAppointment?.name}</span>
                </h3>
              </div>
              
              <p className="text-sm text-gray-500 mb-2">
                You are marking this appointment as 
                <span className={`font-semibold mx-1.5 ${currentAppointment?.status === 'completed' ? 'text-green-600' : 'text-red-600'}`}>
                  {currentAppointment?.status === 'completed' ? 'Completed' : 'No Show'}
                </span>.
              </p>
              
              {/* Text Area */}
              <textarea
                id="remark"
                rows="4"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add an optional remark... (e.g., patient arrived late, vaccine administered, etc.)"
                value={remarkText}
                onChange={(e) => setRemarkText(e.target.value)}
              ></textarea>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={closeRemarkModal}
                  className="bg-gray-200 text-gray-800 py-2 px-5 rounded-lg hover:bg-gray-300 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitRemark}
                  className="bg-blue-600 text-white py-2 px-5 rounded-lg hover:bg-blue-700 font-semibold transition"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* --- End of Remark Modal --- */}

    </div>
  );
};

export default StaffDashboardPage;