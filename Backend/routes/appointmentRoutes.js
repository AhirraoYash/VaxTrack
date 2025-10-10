const express = require('express');
const router = express.Router();
const {
    bookAppointment,
    getMyAppointments,
    updateAppointmentStatus,
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

// Book a new appointment (requires login)
router.post('/', protect, bookAppointment);

// Get all appointments for the logged-in user (requires login)
router.get('/myappointments', protect, getMyAppointments);

// Update an appointment's status (requires login, typically for vaccinators/admins)
router.put('/:id/status', protect, updateAppointmentStatus);

module.exports = router;