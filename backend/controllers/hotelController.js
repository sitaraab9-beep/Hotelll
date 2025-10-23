const Hotel = require('../models/Hotel');
const Room = require('../models/Room');

// Get all hotels
const getHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find().populate('managerId', 'name email');
    res.json({ success: true, hotels });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get hotels by manager
const getManagerHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find({ managerId: req.user._id });
    res.json({ success: true, hotels });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single hotel
const getHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id).populate('managerId', 'name email');
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    res.json({ success: true, hotel });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create hotel
const createHotel = async (req, res) => {
  try {
    const { name, location, description, amenities, images } = req.body;
    
    const hotel = await Hotel.create({
      name,
      location,
      description,
      amenities: amenities || [],
      images: images || [],
      managerId: req.user._id
    });

    res.status(201).json({ success: true, hotel });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update hotel
const updateHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    // Check if user owns this hotel or is admin
    if (hotel.managerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedHotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({ success: true, hotel: updatedHotel });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete hotel
const deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    // Check if user owns this hotel or is admin
    if (hotel.managerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete all rooms associated with this hotel
    await Room.deleteMany({ hotelId: req.params.id });
    
    await Hotel.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Hotel and associated rooms deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getHotels,
  getManagerHotels,
  getHotel,
  createHotel,
  updateHotel,
  deleteHotel
};