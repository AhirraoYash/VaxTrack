const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserProfile,
  getUserById,
  getUsersByRole,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

// Get the profile of the currently logged-in user
// http://localhost:5000/api/users/profile
router.get('/profile', protect, getUserProfile);

// Get all users (Admin only)
// http://localhost:5000/api/users/
router.get('/', protect, admin, getUsers);

// Get a single user by their ID (Admin only)
// http://localhost:5000/api/users/:id
router.get('/:id', protect, admin, getUserById);

// Get all users of a specific role (Admin only)
// http://localhost:5000/api/users/role/vaccinator
router.get('/role/:role', protect, admin, getUsersByRole);


module.exports = router;