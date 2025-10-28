const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const Booking = require('../models/Booking');

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't allow deleting admin users
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin users' });
    }
    
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.role = role;
    await user.save();
    
    res.json({ success: true, user: { ...user.toObject(), password: undefined } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get admin analytics
const getAnalytics = async (req, res) => {
  try {
    // Get total counts
    const totalHotels = await Hotel.countDocuments();
    const totalRooms = await Room.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalUsers = await User.countDocuments();
    
    // Get revenue data
    const bookings = await Booking.find().populate('hotelId', 'name');
    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
    
    // Monthly revenue (current month)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = bookings
      .filter(booking => {
        const bookingDate = new Date(booking.createdAt);
        return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
      })
      .reduce((sum, booking) => sum + booking.totalPrice, 0);
    
    // Revenue by hotel
    const revenueByHotel = {};
    bookings.forEach(booking => {
      const hotelName = booking.hotelId?.name || 'Unknown Hotel';
      revenueByHotel[hotelName] = (revenueByHotel[hotelName] || 0) + booking.totalPrice;
    });
    
    const revenueByHotelArray = Object.entries(revenueByHotel)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue);
    
    // Most booked room types
    const rooms = await Room.find();
    const roomTypeCount = {};
    rooms.forEach(room => {
      roomTypeCount[room.type] = (roomTypeCount[room.type] || 0) + 1;
    });
    
    const roomTypes = Object.entries(roomTypeCount)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
    
    // Monthly bookings for the year
    const monthlyBookings = Array.from({ length: 12 }, (_, i) => {
      const month = new Date(2024, i).toLocaleString('default', { month: 'short' });
      const count = bookings.filter(booking => {
        const bookingDate = new Date(booking.createdAt);
        return bookingDate.getMonth() === i && bookingDate.getFullYear() === currentYear;
      }).length;
      return { month, count };
    });
    
    // Peak months
    const peakMonths = [...monthlyBookings]
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
    
    res.json({
      success: true,
      stats: {
        totalHotels,
        totalRooms,
        totalBookings,
        totalUsers,
        totalRevenue,
        monthlyRevenue
      },
      analytics: {
        revenueByHotel: revenueByHotelArray,
        roomTypes,
        monthlyBookings,
        peakMonths
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers,
  deleteUser,
  updateUserRole,
  getAnalytics
};