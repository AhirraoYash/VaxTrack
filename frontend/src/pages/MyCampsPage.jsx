import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import campService from '../api/campService'; // Make sure this path is correct
// --- CORRECTED ICON IMPORT ---
import { ClockIcon, MapPinIcon, UsersIcon } from '@heroicons/react/20/solid';

function MyCampsPage() {
  const [camps, setCamps] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCamps = async () => {
      try {
        setLoading(true);
        // Assuming your service is named getMyCampsAndUser
        const response = await campService.getCampsByUserId(); 
        setCamps(response.camps);
        setUser(response.user);
      } catch (err) {
        setError('Failed to fetch camps');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCamps();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading your camps...</div>;
  }
  
  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {user ? `${user.firstName} ${user.lastName}'s Camps` : 'My Camps'}
          </h1>
          <Link
            to="/create-camp" // Link to your create camp page
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            + Create New Camp
          </Link>
        </div>

        {camps.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-700">No camps found.</h3>
            <p className="text-gray-500">Get started by creating a new one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {camps.map((camp) => (
              <CampCard key={camp._id} camp={camp} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- CampCard Component (with corrected MapPinIcon) ---
function CampCard({ camp }) {
  const startDate = new Date(camp.startDate).toLocaleDateString();

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{camp.name}</h3>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
            camp.status === 'active' ? 'bg-green-100 text-green-800' :
            camp.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {camp.status}
          </span>
        </div>
        
        <div className="space-y-3 mt-4 text-gray-600">
          <div className="flex items-center gap-2">
            {/* --- CORRECTED ICON --- */}
            <MapPinIcon className="w-5 h-5 text-gray-400" />
            <span>{camp.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-gray-400" />
            <span>Starts: {startDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-gray-400" />
            <span>{camp.staff.length} staff</span>
          </div>
        </div>
      </div>
      <Link
        to={`/camp/${camp._id}`}
        className="block w-full text-center p-4 bg-gray-50 hover:bg-gray-100 text-blue-600 font-medium"
      >
        Manage Camp
      </Link>
    </div>
  );
}

export default MyCampsPage;