import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import campService from '../api/campService.js'; 
import { 
  ClockIcon, 
  MapPinIcon, 
  UsersIcon,
  Squares2X2Icon, // For Grid View
  Bars3Icon,      // For List View
  MagnifyingGlassIcon // --- NEW: For Search Bar
} from '@heroicons/react/20/solid';

function MyCampsPage() {
  const [camps, setCamps] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  // --- NEW: State for search ---
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCamps = async () => {
      try {
        setLoading(true);
        const response = await campService.getMyCamps(); 
        setCamps(response.camps);
        setUser(response.user);
      } catch (err)
 {
        setError('Failed to fetch camps');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCamps();
  }, []);

  // --- NEW: Memoized filter logic ---
  const filteredCamps = useMemo(() => {
    if (!Array.isArray(camps)) {
      return [];
    }
    if (!searchQuery) {
      return camps;
    }
    // Filter by camp name, matching "bloo", "donation", "blood", etc.
    return camps.filter(camp =>
      camp.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [camps, searchQuery]); // Re-run only if camps or searchQuery change

  if (loading) {
    return <div className="p-8 text-center">Loading your camps...</div>;
  }
  
  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* --- Header section (No Change) --- */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Camps</h1>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${
                viewMode === 'grid' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              aria-label="Grid View"
            >
              <Squares2X2Icon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${
                viewMode === 'list' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              aria-label="List View"
            >
              <Bars3Icon className="w-5 h-5" />
            </button>
            
            <Link
              to="/create-camp"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              + Create New Camp
            </Link>
          </div>
        </div>
        
        {/* --- NEW: Search Bar --- */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search your camps by name..."
              className="w-full p-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>
          
        {/* --- MODIFIED: Check filteredCamps.length --- */}
        {filteredCamps.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-lg shadow">
            {/* --- MODIFIED: Show contextual message --- */}
            {searchQuery ? (
              <>
                <h3 className="text-lg font-medium text-gray-700">No Camps Found</h3>
                <p className="text-gray-500">No camps matched your search for "{searchQuery}".</p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium text-gray-700">No camps found.</h3>
                <p className="text-gray-500">Get started by creating a new one!</p>
              </>
            )}
          </div>
        ) : (
          <div className="transition-all duration-300">
            {viewMode === 'grid' ? (
              // --- MODIFIED: Map filteredCamps ---
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCamps.map((camp) => (
                  <CampCard key={camp._id} camp={camp} />
                ))}
              </div>
            ) : (
              // --- MODIFIED: Map filteredCamps ---
              <div className="space-y-4">
                {filteredCamps.map((camp) => (
                  <CampRow key={camp._id} camp={camp} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// --- CampCard Component (No changes) ---
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
        to={`/manage-camp/${camp._id}`}
        className="block w-full text-center p-4 bg-gray-50 hover:bg-gray-100 text-blue-600 font-medium"
      >
        Manage Camp
      </Link>
    </div>
  );
}

// --- CampRow Component (No changes) ---
function CampRow({ camp }) {
  const startDate = new Date(camp.startDate).toLocaleDateString();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col sm:flex-row items-center justify-between p-4 transition-shadow hover:shadow-lg">
      <div className="flex items-center space-x-4 mb-4 sm:mb-0">
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
            camp.status === 'active' ? 'bg-green-100 text-green-800' :
            camp.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {camp.status}
        </span>
        <div>
          <h3 className="text-lg font-bold text-gray-900">{camp.name}</h3>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-gray-500 mt-1">
            <div className="flex items-center gap-1">
              <MapPinIcon className="w-4 h-4" />
              <span>{camp.address}</span>
            </div>
            <div className="flex items-center gap-1">
              <ClockIcon className="w-4 h-4" />
              <span>Starts: {startDate}</span>
            </div>
            <div className="flex items-center gap-1">
              <UsersIcon className="w-4 h-4" />
              <span>{camp.staff.length} staff</span>
            </div>
          </div>
        </div>
      </div>
      <Link
        to={`/manage-camp/${camp._id}`}
        className="flex-shrink-0 w-full sm:w-auto px-4 py-2 bg-gray-100 text-blue-600 rounded-lg font-medium hover:bg-gray-200"
      >
        Manage
      </Link>
    </div>
  );
}

export default MyCampsPage;