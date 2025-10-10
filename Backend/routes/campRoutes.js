const express = require('express');
const router = express.Router();
const {
    createCamp,
    getAllCamps,
    getCampById,
    updateCamp,
    deleteCamp,
} = require('../controllers/campController');
const { protect } = require('../middleware/authMiddleware');

// Create a new camp (requires login)
router.post('/', protect, createCamp);

// Get all camps (public)
router.get('/', getAllCamps);

// Get a single camp by ID (public)
router.get('/:id', getCampById);

// Update a camp (requires login)
router.put('/:id', protect, updateCamp);

// Delete a camp (requires login)
router.delete('/:id', protect, deleteCamp);

module.exports = router;