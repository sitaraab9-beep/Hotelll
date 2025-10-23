const Room = require('../models/Room');
const Booking = require('../models/Booking');

// Get available rooms with filters
exports.getAvailableRooms = async (req, res) => {
  try {
    const { hotelId, checkIn, checkOut, type, minPrice, maxPrice } = req.query;
    
    let query = { isAvailable: true };
    if (hotelId) query.hotelId = hotelId;
    if (type) query.type = type;
    if (minPrice) query.price = { ...query.price, $gte: minPrice };
    if (maxPrice) query.price = { ...query.price, $lte: maxPrice };
    
    let rooms = await Room.find(query).populate('hotelId', 'name location');
    
    // Check availability for specific dates
    if (checkIn && checkOut) {
      const bookedRoomIds = await Booking.find({
        $or: [
          { checkIn: { $lte: new Date(checkOut) }, checkOut: { $gte: new Date(checkIn) } }
        ],
        status: { $in: ['pending', 'confirmed'] }
      }).distinct('roomId');
      
      rooms = rooms.filter(room => !bookedRoomIds.includes(room._id));
    }
    
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create room (Manager only)
exports.createRoom = async (req, res) => {
  try {
    const room = new Room(req.body);
    await room.save();
    res.status(201).json(room);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};