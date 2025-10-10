// src/pages/FindCampsPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import useCamps from '../hooks/useCamps'; // Import our new hook

const FindCampsPage = () => {
  // All the fetching logic is now inside our custom hook!
  const { camps, loading, error } = useCamps();

  if (loading) {
    return <div className="text-center mt-10">Loading camps...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Available Vaccination Camps</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {camps.map((camp) => (
          <div key={camp._id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-blue-600 mb-2">{camp.name}</h2>
            <p className="text-gray-600 mb-4">{camp.address}</p>
            <div className="text-sm text-gray-800">
              <p>
                <strong>Date:</strong> {new Date(camp.startDate).toLocaleDateString()} - {new Date(camp.endDate).toLocaleDateString()}
              </p>
            </div>
            <Link to={`/camps/${camp._id}`}>
              <button className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
                View Details
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FindCampsPage;