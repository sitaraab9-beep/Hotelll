const Hotel = require('../models/Hotel');
const Room = require('../models/Room');

// Get all hotels with search and filters
exports.getHotels = async (req, res) => {
  try {
    const { location, minPrice, maxPrice, search } = req.query;
    let query = {};
    
    if (location) query.location = { $regex: location, $options: 'i' };
    if (search) query.name = { $regex: search, $options: 'i' };
    
    const hotels = await Hotel.find(query).populate('managerId', 'name email');
    
    // Filter by price if specified
    let filteredHotels = hotels;
    if (minPrice || maxPrice) {
      const hotelIds = hotels.map(h => h._id);
      const rooms = await Room.find({ hotelId: { $in: hotelIds } });
      
      const priceFilteredHotelIds = rooms
        .filter(room => {
          if (minPrice && room.price < minPrice) return false;
          if (maxPrice && room.price > maxPrice) return false;
          return true;
        })
        .map(room => room.hotelId.toString());
      
      filteredHotels = hotels.filter(hotel => 
        priceFilteredHotelIds.includes(hotel._id.toString())
      );
    }
    
    res.json(filteredHotels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get hotel by ID with rooms
exports.getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id).populate('managerId', 'name email');
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
    
    const rooms = await Room.find({ hotelId: hotel._id });
    res.json({ ...hotel.toObject(), rooms });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create hotel (Manager only)
exports.createHotel = async (req, res) => {
  try {
    const hotel = new Hotel({
      ...req.body,
      managerId: req.user.id
    });
    await hotel.save();
    res.status(201).json(hotel);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};