import api from './api';

/**
 * @desc    Create a new camp (Protected)
 * @route   POST /api/camps
 */
const createCamp = async (campData) => {
  const response = await api.post('/camps', campData);
  return response.data;
};

/**
 * @desc    Get all camps (Public)
 * @route   GET /api/camps
 */
const getAllCamps = async () => {
  const response = await api.get('/camps');
  return response.data;
};

/**
 * @desc    Get a single camp by its ID (Public)
 * @route   GET /api/camps/:id
 */
const getCampById = async (campId) => {
  const response = await api.get(`/camps/${campId}`);
  return response.data;
};

/**
 * @desc    Get all camps & user info for the logged-in organizer (Protected)
 * @route   GET /api/camps/mycamps
 */
const getMyCamps = async () => {
  const response = await api.get(`/camps/mycamps`); 
  return response.data;
};

/**
 * @desc    Delete a camp by its ID (Protected)
 * @route   DELETE /api/camps/:id
 */ 

const deleteCamp = async (campId) => {
  const response = await api.delete(`/camps/${campId}`);
  return response.data;
};

/**
 * @desc    Get all participants for a specific camp (Protected)
 * @route   GET /api/camps/:id/participants
 */
const getCampParticipants = async (campId) => {
  // We'll assume you have a /:id/participants route now
  const response = await api.get(`/camps/${campId}/participants`);
  return response.data;
};

// --- STAFF FUNCTIONS ---

/**
 * @desc    Login for camp staff (Public)
 * @route   POST /api/camps/staff-login
 */
const staffLogin = async (loginData) => {
  console.log(loginData);
  const response = await api.post('/camps/staff-login', loginData);
  return response.data;
};

/**
 * @desc    Add a staff member to a camp (Protected)
 * @route   PUT /api/camps/:id/addstaff
 */
const addStaffToCamp = async (campId, staffData) => {
  // staffData should be an object like { staffIdentifier: "new@staff.com" }
  const response = await api.put(`/camps/${campId}/addstaff`, staffData);
  return response.data;
};

/**
 * @desc    Get the staff list for a specific camp (Protected)
 * @route   GET /api/camps/:id/staff
 */
const getCampStaff = async (campId) => {
  const response = await api.get(`/camps/${campId}/staff`);
  return response.data;
};

/*all information about camp, stafff, participant*/

const getCampDetailByCampId = async (campId) => {
  const response = await api.get(`/camps/${campId}/detail`);
  return response.data;
};

// --- EXPORT ALL FUNCTIONS ---
const campService = {
  createCamp,
  getAllCamps,
  getCampById,
  getMyCamps,
  deleteCamp,
  getCampParticipants,
  staffLogin,
  addStaffToCamp,
  getCampStaff, // <-- Your new function
  getCampDetailByCampId, // <-- Your new function
};

export default campService;