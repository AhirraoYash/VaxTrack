// src/api/userService.js

import api from './api';

// Get all users (Admin only route)
const getAllUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

const userService = {
  getAllUsers,
};

export default userService;