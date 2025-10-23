const Favorite = require('../models/Favorite');

// Add to favorites
const addFavorite = async (req, res) => {
  try {
    const { hotelId } = req.body;
    const favorite = await Favorite.create({
      customerId: req.user._id,
      hotelId
    });
    await favorite.populate('hotelId', 'name location images rating');
    res.status(201).json({ success: true, favorite });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Hotel already in favorites' });
    }
    res.status(400).json({ message: error.message });
  }
};

// Remove from favorites
const removeFavorite = async (req, res) => {
  try {
    await Favorite.findOneAndDelete({
      customerId: req.user._id,
      hotelId: req.params.hotelId
    });
    res.json({ success: true, message: 'Removed from favorites' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get customer favorites
const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ customerId: req.user._id })
      .populate('hotelId', 'name location description images rating amenities');
    res.json({ success: true, favorites });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addFavorite,
  removeFavorite,
  getFavorites
};