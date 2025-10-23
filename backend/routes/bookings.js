const express = require('express');
const { createBooking, getCustomerBookings, getManagerBookings, updateBookingStatus, cancelBooking, checkAvailability } = require('../controllers/bookingController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, createBooking);
router.get('/customer', auth, getCustomerBookings);
router.get('/manager', auth, getManagerBookings);
router.put('/:id/status', auth, updateBookingStatus);
router.put('/:id/cancel', auth, cancelBooking);
router.get('/check-availability', checkAvailability);

module.exports = router;