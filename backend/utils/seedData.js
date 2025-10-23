const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const User = require('../models/User');

const seedData = async () => {
  try {
    // Check if data already exists
    const existingHotels = await Hotel.countDocuments();
    if (existingHotels > 0) {
      console.log('Sample data already exists');
      return;
    }

    // Find a manager user
    let manager = await User.findOne({ role: 'manager' });
    if (!manager) {
      // Create a sample manager
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('manager123', 10);
      manager = new User({
        name: 'Hotel Manager',
        email: 'manager@hotelease.com',
        password: hashedPassword,
        role: 'manager'
      });
      await manager.save();
    }

    // Create sample hotels
    const hotels = [
      {
        name: 'Grand Plaza Hotel',
        location: 'New York, USA',
        description: 'Luxury hotel in the heart of Manhattan with stunning city views.',
        amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Spa'],
        rating: 4.5,
        managerId: manager._id
      },
      {
        name: 'Ocean View Resort',
        location: 'Miami, USA',
        description: 'Beautiful beachfront resort with ocean views and tropical gardens.',
        amenities: ['WiFi', 'Beach Access', 'Pool', 'Restaurant', 'Bar'],
        rating: 4.3,
        managerId: manager._id
      },
      {
        name: 'Mountain Lodge',
        location: 'Denver, USA',
        description: 'Cozy mountain lodge perfect for outdoor enthusiasts.',
        amenities: ['WiFi', 'Fireplace', 'Hiking Trails', 'Restaurant'],
        rating: 4.1,
        managerId: manager._id
      }
    ];

    const createdHotels = await Hotel.insertMany(hotels);
    console.log('✅ Sample hotels created');

    // Create sample rooms for each hotel
    const rooms = [];
    createdHotels.forEach(hotel => {
      // Add different room types for each hotel
      const roomTypes = [
        { type: 'single', price: 100, capacity: 1 },
        { type: 'double', price: 150, capacity: 2 },
        { type: 'suite', price: 250, capacity: 4 },
        { type: 'deluxe', price: 300, capacity: 2 }
      ];

      roomTypes.forEach((roomType, index) => {
        for (let i = 1; i <= 3; i++) {
          rooms.push({
            hotelId: hotel._id,
            roomNumber: `${index + 1}0${i}`,
            type: roomType.type,
            price: roomType.price,
            capacity: roomType.capacity,
            amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar'],
            isAvailable: true
          });
        }
      });
    });

    await Room.insertMany(rooms);
    console.log('✅ Sample rooms created');
    console.log('✅ Sample data seeded successfully');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
};

module.exports = seedData;