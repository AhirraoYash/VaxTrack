// src/pages/ManageCampPage.jsx

import React, { useState, useEffect } from 'react';
// --- NEW ---
// We need useParams to get the camp ID from the URL
import { useParams } from 'react-router-dom';
import { Download, Plus, Trash2, X, Eye, EyeOff } from 'lucide-react';
// --- NEW ---
// Import the real service
import campService from '../api/campService';
// You'll need this to check if the user is the organizer
// import { useAuth } from '../context/AuthContext'; 

// --- Reusable Modal Component (No Change) ---
const Modal = ({ children, onClose, title }) => (
  <div 
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    onClick={onClose}
  >
    <div
      className="bg-white rounded-lg shadow-2xl w-full max-w-lg"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center p-6 border-b">
        <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
        <button 
          onClick={onClose} 
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={28} />
        </button>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  </div>
);

// --- REMOVED ALL DUMMY DATA ---

// --- Main Page Component ---
const ManageCampPage = () => {
  // --- NEW --- Get camp ID from the URL (e.g., /manage-camp/:id)
  const { id: campId } = useParams(); 
  // const { user } = useAuth(); // Get the logged-in organizer

  // --- NEW --- Real data states
  const [camp, setCamp] = useState(null);
  const [staff, setStaff] = useState([]);
  const [participants, setParticipants] = useState([]);
  
  // --- NEW --- Loading and Error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal States
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showDeleteStaff, setShowDeleteStaff] = useState(null); 
  
  // PIN State
  const [showPin, setShowPin] = useState(false);
  // --- REMOVED showChangePin state ---

  // --- NEW --- Fetch all data on page load
  useEffect(() => {
    // Make sure we have a campId and user
    // if (!campId || !user) {
    //   setError('Access Denied');
    //   setLoading(false);
    //   return;
    // }

    const fetchCampData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // We will run all 3 API calls at the same time for speed
        const [campData, staffData, participantData] = await Promise.all([
          campService.getCampById(campId),
          campService.getCampStaff(campId),
          campService.getCampParticipants(campId),
        ]);

        // Set all our states with the real data
        setCamp(campData.data); // Assuming data is in a .data property
        setStaff(staffData.data); // Assuming data is in a .data property
        setParticipants(participantData.data); // Assuming data is in a .data property

      } catch (err) {
        console.error("Failed to fetch camp details:", err);
        setError("Could not load camp details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCampData();
  }, [campId]); // Re-run if the campId in the URL changes

  
  // --- MODIFIED --- This now calls the REAL API
  const handleAddStaff = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    // In a real app, you might want a name field too
    const staffData = { email: email, name: 'New Staff' }; 

    try {
      // Call the real API
      const newStaffMember = await campService.addStaffToCamp(campId, staffData);
      
      // Add the new staff member to our local state to update the UI
      setStaff([newStaffMember.data, ...staff]);
      setShowAddStaff(false);
    } catch (err) {
      console.error("Failed to add staff:", err);
      // You could show an error inside the modal
      alert(err.response?.data?.message || "Failed to add staff");
    }
  };

  // --- MODIFIED --- This is now a UI-only demo, as requested
  const handleDeleteStaff = async () => {
    // In a real app, you would uncomment this:
    /*
    try {
      // 1. You need to create this API function in campService.js
      // await campService.deleteStaffFromCamp(campId, showDeleteStaff.email);
      
      // 2. Then, update the UI
      setStaff(staff.filter(s => s.email !== showDeleteStaff.email));
      setShowDeleteStaff(null);
      
    } catch (err) {
      console.error("Failed to delete staff:", err);
      alert(err.response?.data?.message || "Failed to delete staff");
    }
    */
    
    // --- For now, we just do the UI part (as you asked) ---
    alert(`(Demo) Deleting ${showDeleteStaff.name}. You need to build the API for this.`);
    setStaff(staff.filter(s => s.email !== showDeleteStaff.email));
    setShowDeleteStaff(null);
    // --- End of demo ---
  };

  const handleDownloadReport = () => {
    alert('Downloading report...\n(This is a demo)');
  };

  // --- Render Status Badge (No Change) ---
  const StatusBadge = ({ status }) => {
    let colorClasses = 'bg-yellow-100 text-yellow-800'; // scheduled
    if (status === 'completed') {
      colorClasses = 'bg-green-100 text-green-800';
    } else if (status === 'cancelled') {
      colorClasses = 'bg-red-100 text-red-800';
    }
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${colorClasses}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // --- NEW --- Render Loading and Error states
  if (loading) {
    return <div className="text-center mt-20">Loading camp details...</div>;
  }
  
  if (error) {
    return <div className="text-center mt-20 text-red-600">{error}</div>;
  }
  
  if (!camp) {
    return <div className="text-center mt-20">Camp not found.</div>;
  }

  // --- Main Page Render ---
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      
      {/* --- 1. Header Section --- */}
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">{camp.name}</h1>
          <p className="text-lg text-gray-500 mt-1">{camp.address}</p>
        </div>
        <button
          onClick={handleDownloadReport}
          className="flex-shrink-0 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-300 font-semibold"
        >
          <Download size={20} />
          Download Report
        </button>
      </div>

      {/* --- 2. Main Grid (Staff & Participants) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* --- Column 1: Staff Management --- */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg border border-gray-100">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Manage Staff</h2>
              <button
                onClick={() => setShowAddStaff(true)}
                className="flex items-center gap-2 bg-green-100 text-green-700 py-2 px-4 rounded-lg hover:bg-green-200 transition duration-300 font-semibold text-sm"
              >
                <Plus size={16} />
                Add Staff
              </button>
            </div>

            {/* --- Staff PIN Section (No "Change" button) --- */}
            <div className="p-6 border-b">
              <h3 className="text-lg font-bold text-gray-700 mb-2">Staff Access PIN</h3>
              <p className="text-sm text-gray-500 mb-3">
                Staff use this PIN to log in to the camp dashboard.
              </p>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={camp.staffPin || '****'} // Show the real PIN
                  readOnly
                  className="text-2xl font-bold tracking-widest bg-transparent border-none p-0 focus:ring-0 w-full"
                />
                <button 
                  onClick={() => setShowPin(!showPin)} 
                  className="text-gray-500 hover:text-gray-700"
                >
                  {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                {/* --- REMOVED "Change" button --- */}
              </div>
            </div>
            {/* --- END OF PIN SECTION --- */}

            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              {staff.length === 0 && (
                <p className="text-gray-500">No staff members added yet.</p>
              )}
              {/* --- Map over REAL staff data --- */}
              {staff.map((s) => (
                <div key={s.email} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-700">{s.name || s.email}</p>
                    <p className="text-sm text-gray-500">{s.email}</p>
                  </div>
                  <button
                    onClick={() => setShowDeleteStaff(s)} // Show modal
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- Column 2: Participant List --- */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg border border-gray-100">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">Camp Participants ({participants.length})</h2>
            </div>
            
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="p-4 font-semibold text-gray-600">Name</th>
                    <th className="p-4 font-semibold text-gray-600">Contact</th>
                    <th className="p-4 font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {/* --- Map over REAL participant data --- */}
                  {participants.map((p) => (
                    // Note: You might need to populate 'beneficiary' in your API
                    <tr key={p._id} className="hover:bg-gray-50">
                      <td className="p-4">{p.beneficiary?.name || 'N/A'}</td>
                      <td className="p-4 text-gray-600">{p.beneficiary?.phone || 'N/A'}</td>
                      <td className="p-4">
                        <StatusBadge status={p.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>

      </div>

      {/* --- 3. Modals --- */}
      
      {/* Add Staff Modal */}
      {showAddStaff && (
        <Modal onClose={() => setShowAddStaff(false)} title="Add New Staff">
          <form onSubmit={handleAddStaff}>
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2" htmlFor="email">
                Staff Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter email of the staff member"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 font-semibold"
            >
              Add Staff Member
            </button>
          </form>
        </Modal>
      )}

      {/* Delete Staff Confirmation Modal */}
      {showDeleteStaff && (
        <Modal onClose={() => setShowDeleteStaff(null)} title="Confirm Deletion">
          <p className="text-gray-600 mb-6">
            Are you sure you want to remove 
            <strong className="text-gray-800"> {showDeleteStaff.name || showDeleteStaff.email} </strong> 
            from the staff list?
          </p>
          <div className="flex justify-end gap-4">
            <button
              onClick={() => setShowDeleteStaff(null)}
              className="bg-gray-200 text-gray-800 py-2 px-6 rounded-lg hover:bg-gray-300 font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteStaff} // This calls the demo function
              className="bg-red-600 text-white py-2 px-6 rounded-lg hover:bg-red-700 font-semibold"
            >
              Yes, Delete
            </button>
          </div>
        </Modal>
      )}

      {/* --- REMOVED Change PIN Modal --- */}

    </div>
  );
};

export default ManageCampPage;