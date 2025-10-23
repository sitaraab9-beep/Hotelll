const Booking = require('../models/Booking');
const Room = require('../models/Room');

// Create booking
exports.createBooking = async (req, res) => {
  try {
    const { roomId, checkIn, checkOut, guests, specialRequests } = req.body;
    
    // Check room availability
    const room = await Room.findById(roomId).populate('hotelId');
    if (!room) return res.status(404).json({ message: 'Room not found' });
    
    const existingBooking = await Booking.findOne({
      roomId,
      $or: [
        { checkIn: { $lte: new Date(checkOut) }, checkOut: { $gte: new Date(checkIn) } }
      ],
      status: { $in: ['pending', 'confirmed'] }
    });
    
    if (existingBooking) {
      return res.status(400).json({ message: 'Room not available for selected dates' });
    }
    
    // Calculate total price
    const days = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    const totalPrice = room.price * days;
    
    const booking = new Booking({
      customerId: req.user.id,
      roomId,
      hotelId: room.hotelId._id,
      checkIn,
      checkOut,
      totalPrice,
      guests,
      specialRequests,
      status: 'confirmed'
    });
    
    await booking.save();
    await booking.populate(['roomId', 'hotelId', 'customerId']);
    
    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get user bookings
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customerId: req.user.id })
      .populate('roomId', 'roomNumber type price')
      .populate('hotelId', 'name location')
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      customerId: req.user.id
    });
    
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking already cancelled' });
    }
    
    booking.status = 'cancelled';
    await booking.save();
    
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all bookings (Manager/Admin)
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('customerId', 'name email')
      .populate('roomId', 'roomNumber type')
      .populate('hotelId', 'name location')
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};