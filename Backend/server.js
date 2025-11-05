require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect to Database
connectDB();

// Route files
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const campRoutes = require('./routes/campRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const vaccineRoutes = require('./routes/vaccineRoutes');

const chatRoutes = require('./routes/chatRoutes');

const app = express();

// Middlewares
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // To parse JSON bodies

// Mount Routers
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/camps', campRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/vaccines', vaccineRoutes);


app.use('/api/chat', chatRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});