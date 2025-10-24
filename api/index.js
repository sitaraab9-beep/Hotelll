// Vercel serverless function for backend API
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('../backend/routes/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
if (!mongoose.connection.readyState) {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

// Routes
app.use('/auth', authRoutes);

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Backend API is working!' });
});

// Export for Vercel
module.exports = app;