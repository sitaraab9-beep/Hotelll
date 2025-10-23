const express = require('express');
const { getHotels, getManagerHotels, getHotel, createHotel, updateHotel, deleteHotel } = require('../controllers/hotelController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Protected routes (must come before parameterized routes)
router.get('/manager/my-hotels', auth, getManagerHotels);

// Public routes
router.get('/', getHotels);
router.get('/:id', getHotel);
router.post('/', auth, createHotel);
router.put('/:id', auth, updateHotel);
router.delete('/:id', auth, deleteHotel);

module.exports = router;