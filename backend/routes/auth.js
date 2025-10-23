const express = require('express');
const { register, login, getProfile, forgotPassword, resetPassword, updateProfile, changePassword, googleAuth } = require('../controllers/authController');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', auth, getProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/update-profile', auth, updateProfile);
router.put('/change-password', auth, changePassword);
router.post('/google-auth', googleAuth);
router.post('/create-admin', async (req, res) => {
  try {
    const existingAdmin = await User.findOne({ email: 'admin@hotelease.com' });
    if (existingAdmin) {
      return res.json({ message: 'Admin already exists', email: 'admin@hotelease.com' });
    }
    
    const admin = new User({
      name: 'Admin User',
      email: 'admin@hotelease.com',
      password: 'Admin@123',
      role: 'admin'
    });
    
    await admin.save();
    res.json({ message: 'Admin created successfully', email: 'admin@hotelease.com' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating admin', error: error.message });
  }
});

module.exports = router;