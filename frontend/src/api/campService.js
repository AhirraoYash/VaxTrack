// src/api/campService.js

import api from './api';

// Get all camps (Public)
const getAllCamps = async () => {
  const response = await api.get('/camps');
  return response.data;
};

// Get a single camp by its ID (Public)
const getCampById = async (campId) => {
  const response = await api.get(`/camps/${campId}`);
  return response.data;
};

// Create a new camp (Protected Route)
const createCamp = async (campData) => {
  const response = await api.post('/camps', campData);
  return response.data;
};

// NOTE: Add updateCamp and deleteCamp functions here as needed.
// They will follow the same pattern, e.g.:
// const updateCamp = async (campId, campData) => { ... }

const campService = {
  getAllCamps,
  getCampById,
  createCamp,
};

export default campService;