// src/api/appointmentService.js

import api from './api';

// Get all appointments for the logged-in user (Protected)
const getMyAppointments = async () => {
  const response = await api.get('/appointments/myappointments');
  return response.data;
};

// Book a new appointment (Protected)
const bookAppointment = async (appointmentData) => {
  // appointmentData should be an object like { camp, vaccine, slotDate }
  const response = await api.post('/appointments', appointmentData);
  return response.data;
};

// Update an appointment's status (Protected)
const updateAppointmentStatus = async (appointmentId, status) => {
  // status should be an object like { status: 'completed' }
  const response = await api.put(`/appointments/${appointmentId}/status`, { status });
  return response.data;
};

const appointmentService = {
  getMyAppointments,
  bookAppointment,
  updateAppointmentStatus,
};

export default appointmentService;