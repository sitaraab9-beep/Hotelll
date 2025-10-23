const Hotel = require('../models/Hotel');
const Room = require('../models/Room');

const updateAllRoomCounts = async () => {
  try {
    const hotels = await Hotel.find();
    
    for (const hotel of hotels) {
      const roomCount = await Room.countDocuments({ hotelId: hotel._id });
      await Hotel.findByIdAndUpdate(hotel._id, { totalRooms: roomCount });
    }
    
    console.log('Room counts updated successfully');
  } catch (error) {
    console.error('Error updating room counts:', error);
  }
};

module.exports = { updateAllRoomCounts };