const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  }
}, {
  timestamps: true
});

favoriteSchema.index({ customerId: 1, hotelId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);