// src/pages/CampDetailsPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import campService from '../api/campService';

const CampDetailsPage = () => {
  const [camp, setCamp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams(); // Get camp ID from the URL

  useEffect(() => {
    const fetchCamp = async () => {
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

  if (loading) {
    return <div className="text-center mt-10">Loading camp details...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  if (!camp) {
    return <div className="text-center mt-10">Camp not found.</div>;
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg">
      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
          camp.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
        Status: {camp.status}
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
              {camp.vaccineInventory.map((item) => (
                <tr key={item._id} className="text-center">
                  <td className="py-2 px-4 border-b">{item.vaccine?.name || 'N/A'}</td>
                  <td className="py-2 px-4 border-b">{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <button className="w-full bg-green-500 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-green-600">
        Book Appointment
      </button>
    </div>
  );
};

export default CampDetailsPage;