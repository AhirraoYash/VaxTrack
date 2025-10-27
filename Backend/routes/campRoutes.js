const express = require('express');
const router = express.Router();
const {
    createCamp,
    getAllCamps,
    getCampById,
    updateCamp,
    deleteCamp,
    getCampsByUserId,
    staffLogin,       // <-- 1. IMPORTED
    addStaffToCamp,   // <-- 2. IMPORTED
    getStaffByCampId, // <-- 3. IMPORTED
} = require('../controllers/campController');
const { protect } = require('../middleware/authMiddleware');

// === PUBLIC ROUTES ===

// Get all camps (public)
router.get('/', getAllCamps);

// Staff login (public)
router.post('/staff-login', staffLogin); // <-- 3. ADDED THIS ROUTE

// === ROUTES THAT MUST COME BEFORE /:id ===

// Get specific camps for the logged-in user
// THIS MUST BE DEFINED *BEFORE* /:id
router.get('/mycamps', protect, getCampsByUserId); // <-- 4. MOVED & RENAMED (was /user)
// Get staff by camp id
router.get('/:id/staff', protect, getStaffByCampId);
// === DYNAMIC /:id ROUTES ===

// Get a single camp by ID (public)
router.get('/:id', getCampById);

// Update a camp (requires login)
router.put('/:id', protect, updateCamp);

// Delete a camp (requires login)
router.delete('/:id', protect, deleteCamp);

// Add a staff member to a camp (requires login)
router.put('/:id/addstaff', protect, addStaffToCamp); // <-- 5. ADDED THIS ROUTE

// === OTHER PROTECTED ROUTES ===

// Create a new camp (requires login)
router.post('/', protect, createCamp);

module.exports = router;