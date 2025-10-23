const Room = require('../models/Room');
const Hotel = require('../models/Hotel');

// Get all rooms
const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate('hotelId', 'name location');
    res.json({ success: true, rooms });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get rooms by hotel
const getHotelRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ hotelId: req.params.hotelId });
    res.json({ success: true, rooms });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single room
const getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('hotelId', 'name location');
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json({ success: true, room });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create room
const createRoom = async (req, res) => {
  try {
    const { type, price, roomNumber, capacity, hotelId, amenities, description, images } = req.body;
    
    // Check if hotel exists and user has permission
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    if (hotel.managerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const room = await Room.create({
      type,
      price,
      roomNumber,
      capacity,
      hotelId,
      amenities: amenities || [],
      description,
      images: images || []
    });

    // Update hotel's total rooms count
    await Hotel.findByIdAndUpdate(hotelId, { $inc: { totalRooms: 1 } });

    res.status(201).json({ success: true, room });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update room
const updateRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('hotelId');
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if user owns this hotel or is admin
    if (room.hotelId.managerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({ success: true, room: updatedRoom });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete room
const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('hotelId');
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if user owns this hotel or is admin
    if (room.hotelId.managerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Room.findByIdAndDelete(req.params.id);
    
    // Update hotel's total rooms count
    await Hotel.findByIdAndUpdate(room.hotelId._id, { $inc: { totalRooms: -1 } });

    res.json({ success: true, message: 'Room deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getRooms,
  getHotelRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom
};