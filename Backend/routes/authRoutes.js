const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

// http://localhost:5000/api/auth/register
router.post('/register', registerUser);

// http://localhost:5000/api/auth/login
router.post('/login', loginUser);

module.exports = router;

//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZmUwOWNiNzI1M2Y4OTc5NmRjN2MxMiIsImlhdCI6MTc2MjMxODI1MiwiZXhwIjoxNzY0OTEwMjUyfQ.rbIIorvdNOicg6IqNcxZ6RRHJDzl3hEuH1EARimmLsI
//68fe203babe009969ed105f5