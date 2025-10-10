// src/pages/AdminDashboard.jsx

import React, { useState, useEffect } from 'react';
import userService from '../api/userService';
import campService from '../api/campService';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ userCount: 0, campCount: 0 });
  const [users, setUsers] = useState([]);
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      // Ensure the logged-in user is an admin before fetching
      if (user?.role !== 'admin') {
        setError('You are not authorized to view this page.');
        setLoading(false);
        return;
      }

      try {
        // Fetch users and camps at the same time
        const [usersData, campsData] = await Promise.all([
          userService.getAllUsers(),
          campService.getAllCamps(),
        ]);
        
        setUsers(usersData);
        setCamps(campsData);
        setStats({ userCount: usersData.length, campCount: campsData.length });
      } catch (err) {
        setError('Failed to load dashboard data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) return <div className="text-center mt-10">Loading Admin Dashboard...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold">Total Users</h3>
              <p className="text-3xl font-bold">{stats.userCount}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold">Total Camps</h3>
              <p className="text-3xl font-bold">{stats.campCount}</p>
            </div>
          </div>
        );
      case 'users':
        return <UserManagementTable users={users} />;
      case 'camps':
        return <CampManagementTable camps={camps} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <div className="flex border-b mb-6">
        <button onClick={() => setActiveTab('overview')} className={`py-2 px-4 ${activeTab === 'overview' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}>Overview</button>
        <button onClick={() => setActiveTab('users')} className={`py-2 px-4 ${activeTab === 'users' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}>Manage Users</button>
        <button onClick={() => setActiveTab('camps')} className={`py-2 px-4 ${activeTab === 'camps' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}>Manage Camps</button>
      </div>
      <div>{renderContent()}</div>
    </div>
  );
};

// Sub-component for User Management Table
const UserManagementTable = ({ users }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <table className="min-w-full">
      <thead className="bg-gray-50">
        <tr>
          <th className="text-left py-2 px-4">Name</th>
          <th className="text-left py-2 px-4">Email</th>
          <th className="text-left py-2 px-4">Role</th>
          <th className="text-left py-2 px-4">Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map(u => (
          <tr key={u._id} className="border-b">
            <td className="py-2 px-4">{u.name}</td>
            <td className="py-2 px-4">{u.email}</td>
            <td className="py-2 px-4 capitalize">{u.role}</td>
            <td className="py-2 px-4">
              <button className="text-blue-500 hover:underline">Edit</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Sub-component for Camp Management Table
const CampManagementTable = ({ camps }) => (
  <div className="bg-white p-4 rounded-lg shadow">
     <table className="min-w-full">
      <thead className="bg-gray-50">
        <tr>
          <th className="text-left py-2 px-4">Camp Name</th>
          <th className="text-left py-2 px-4">Status</th>
          <th className="text-left py-2 px-4">Actions</th>
        </tr>
      </thead>
      <tbody>
        {camps.map(c => (
          <tr key={c._id} className="border-b">
            <td className="py-2 px-4">{c.name}</td>
            <td className="py-2 px-4 capitalize">{c.status}</td>
            <td className="py-2 px-4">
              <button className="text-blue-500 hover:underline">Manage</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default AdminDashboard;