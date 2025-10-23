const express = require('express');
const router = express.Router();

// Test route to check if backend is working
router.get('/health', (req, res) => {
  res.json({ 
    message: 'Backend is working!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = router;