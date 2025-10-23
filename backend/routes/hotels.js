const express = require('express');
const router = express.Router();
const { getHotels, getHotelById, createHotel } = require('../controllers/hotelController');
const auth = require('../middleware/auth');

router.get('/', getHotels);
router.get('/:id', getHotelById);
router.post('/', auth, createHotel);

module.exports = router;