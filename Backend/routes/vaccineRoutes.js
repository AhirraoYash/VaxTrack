const express = require('express');
const router = express.Router();
const {
    createVaccine,
    getAllVaccines,
    getVaccineById,
    updateVaccine,
    deleteVaccine,
} = require('../controllers/vaccineController');

// Assuming you have your auth middleware like before
const { protect } = require('../middleware/authMiddleware'); 
// If you have an admin middleware, you should use it for create, update, delete
// const { protect, admin } = require('../middleware/authMiddleware');

// Get all vaccines (public) & create a new one (admin)
router.route('/')
    .get(getAllVaccines)
    .post(protect, createVaccine); // Use .post(protect, admin, createVaccine) if you have it

// Get, update, and delete a single vaccine
router.route('/:id')
    .get(getVaccineById)
    .put(protect, updateVaccine) // Use .put(protect, admin, updateVaccine)
    .delete(protect, deleteVaccine); // Use .delete(protect, admin, deleteVaccine)

module.exports = router;