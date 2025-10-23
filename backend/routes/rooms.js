const express = require('express');
const { getRooms, getHotelRooms, getRoom, createRoom, updateRoom, deleteRoom } = require('../controllers/roomController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getRooms);
router.get('/hotel/:hotelId', getHotelRooms);
router.get('/:id', getRoom);

// Protected routes
router.post('/', auth, createRoom);
router.put('/:id', auth, updateRoom);
router.delete('/:id', auth, deleteRoom);

module.exports = router;