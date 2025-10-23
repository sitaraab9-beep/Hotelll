const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Hotel = require('../models/Hotel');

// Create booking
const createBooking = async (req, res) => {
  try {
    const { hotelId, roomId, checkIn, checkOut, guests } = req.body;
    
    const room = await Room.findById(roomId);
    if (!room || !room.availability) {
      return res.status(400).json({ message: 'Room not available' });
    }

    // Check for conflicting bookings
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    const conflictingBooking = await Booking.findOne({
      roomId,
      status: { $in: ['pending', 'approved'] },
      $or: [
        { checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } }
      ]
    });
    
    if (conflictingBooking) {
      return res.status(400).json({ message: 'Room not available for selected dates' });
    }

    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = room.price * nights;

    const booking = await Booking.create({
      customerId: req.user._id,
      hotelId,
      roomId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      totalPrice
    });

    await booking.populate(['hotelId', 'roomId', 'customerId']);
    res.status(201).json({ success: true, booking });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get customer bookings
const getCustomerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customerId: req.user._id })
      .populate('hotelId', 'name location')
      .populate('roomId', 'type roomNumber')
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get manager bookings
const getManagerBookings = async (req, res) => {
  try {
    const hotels = await Hotel.find({ managerId: req.user._id });
    const hotelIds = hotels.map(hotel => hotel._id);
    
    const bookings = await Booking.find({ hotelId: { $in: hotelIds } })
      .populate('hotelId', 'name location')
      .populate('roomId', 'type roomNumber')
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update booking status
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id).populate('hotelId');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.hotelId.managerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    booking.status = status;
    await booking.save();

    res.json({ success: true, booking });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cancel booking
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking already cancelled' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Check room availability
const checkAvailability = async (req, res) => {
  try {
    const { roomId, checkIn, checkOut } = req.query;
    
    const conflictingBooking = await Booking.findOne({
      roomId,
      status: { $in: ['pending', 'approved'] },
      $or: [
        { checkIn: { $lt: new Date(checkOut) }, checkOut: { $gt: new Date(checkIn) } }
      ]
    });
    
    res.json({ success: true, available: !conflictingBooking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  getCustomerBookings,
  getManagerBookings,
  updateBookingStatus,
  cancelBooking,
  checkAvailability
};