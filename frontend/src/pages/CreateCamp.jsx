import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import campService from '../api/campService'; // Assuming you have this file

// --- NEW IMPORTS for marker icons (THE FIX) ---
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// --- Fix for default Leaflet marker icon ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
// ------------------------------------------

const XCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
  </svg>
);

const initialState = {
  name: '',
  address: '',
  startDate: '',
  endDate: '',
  campAccessCode: '',
  staffPin: '',
};

function CreateCamp() {
  const [formData, setFormData] = useState(initialState);
  const [staffList, setStaffList] = useState([]);
  const [currentStaffId, setCurrentStaffId] = useState('');
  const [position, setPosition] = useState([18.5204, 73.8567]);
  
  // --- NEW STATE for API calls ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      if (name === 'name') {
        const newAccessCode = value
          .toUpperCase()
          .replace(/\s+/g, '-') 
          .replace(/[^A-Z0-9-]/g, ''); 
        return { ...prev, name: value, campAccessCode: newAccessCode };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleAddStaff = (e) => {
    e.preventDefault(); 
    if (currentStaffId && !staffList.includes(currentStaffId)) {
      setStaffList(prev => [...prev, currentStaffId]);
      setCurrentStaffId(''); 
    }
  };

  const handleRemoveStaff = (staffIdToRemove) => {
    setStaffList(prev => prev.filter(id => id !== staffIdToRemove));
  };

  // --- UPDATED handleSubmit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const finalCampData = {
      ...formData,
      staff: staffList, 
      location: {
        type: 'Point',
        coordinates: [position[1], position[0]],
      }
    };

    try {
      const response = await campService.createCamp(finalCampData);
      
      console.log('Camp created:', response.data);
      setSuccess('Camp created successfully!');
      
      // Reset the form
      setFormData(initialState);
      setStaffList([]);
      setPosition([18.5204, 73.8567]); // Reset map
      
    } catch (err) {
      // Set a user-friendly error message
      const message = err.response?.data?.message || 'Failed to create camp. Please try again.';
      console.error('API Error:', err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
      },
    });

    return position === null ? null : (
      <Marker position={position}>
        <Popup>You selected this location</Popup>
      </Marker>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto bg-white shadow-2xl rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          
          <div className="w-full h-[400px] lg:h-full lg:order-last">
            <MapContainer 
              center={position} 
              zoom={13} 
              className="h-full w-full z-0"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <LocationMarker />
            </MapContainer>
          </div>
          
          <div className="p-6 md:p-10 space-y-6 lg:order-first">
            <h2 className="text-3xl font-bold text-gray-900">Create New Camp</h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* --- NEW: Error/Success Messages --- */}
              {error && (
                <div className="p-4 rounded-lg bg-red-100 text-red-700">
                  <strong>Error:</strong> {error}
                </div>
              )}
              {success && (
                <div className="p-4 rounded-lg bg-green-100 text-green-700">
                  <strong>Success:</strong> {success}
                </div>
              )}
              
              {/* ... (all your input fields for name, address, dates, etc. remain here) ... */}

               <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Camp Name</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                <textarea
                  name="address"
                  id="address"
                  rows="3"
                  value={formData.address}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                ></textarea>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    id="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    id="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="campAccessCode" className="block text-sm font-medium text-gray-700">Camp Access Code</label>
                  <input
                    type="text"
                    name="campAccessCode"
                    id="campAccessCode"
                    value={formData.campAccessCode}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="staffPin" className="block text-sm font-medium text-gray-700">Common Staff PIN</label>
                  <input
                    type="password"
                    name="staffPin"
                    id="staffPin"
                    value={formData.staffPin}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Staff Management Section */}
              <div>
                <label htmlFor="staff-add" className="block text-sm font-medium text-gray-700">Add Staff (by Email or ID)</label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="text"
                    id="staff-add"
                    value={currentStaffId}
                    onChange={(e) => setCurrentStaffId(e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., staff_member@gmail.com"
                  />
                  <button
                    type="button"
                    onClick={handleAddStaff}
                    className="px-4 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300"
                  >
                    Add
                  </button>
                </div>
                
                {staffList.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium text-gray-600">Staff List:</h4>
                    <ul className="max-h-32 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-200">
                      {staffList.map((staffId) => (
                        <li key={staffId} className="px-4 py-2 flex justify-between items-center text-sm">
                          <span>{staffId}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveStaff(staffId)}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <XCircleIcon />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              {/* Coordinates Display */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Selected Coordinates (Click map to change)</label>
                <input
                  type="text"
                  value={`Lat: ${position[0].toFixed(5)}, Lng: ${position[1].toFixed(5)}`}
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  readOnly
                />
              </div>

              {/* --- UPDATED Submit Button --- */}
              <button
                type="submit"
                disabled={loading} // Disable button when loading
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
              >
                {loading ? 'Creating...' : 'Create Camp'}
              </button>
              
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateCamp;