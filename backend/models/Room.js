const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  roomNumber: { type: String, required: true },
  type: { type: String, required: true, enum: ['single', 'double', 'suite', 'deluxe'] },
  price: { type: Number, required: true },
  capacity: { type: Number, required: true },
  amenities: [String],
  images: [String],
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);