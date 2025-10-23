const express = require('express');
const router = express.Router();
const { getAvailableRooms, createRoom } = require('../controllers/roomController');
const auth = require('../middleware/auth');

router.get('/available', getAvailableRooms);
router.post('/', auth, createRoom);

module.exports = router;