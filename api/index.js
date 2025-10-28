const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'manager', 'admin'], default: 'customer' }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

// Hotel Schema
const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  amenities: [String],
  rating: { type: Number, default: 4.0 },
  imageUrl: String,
  managerId: { type: String, required: true },
  isDeleted: { type: Boolean, default: false },
  rooms: [{
    _id: String,
    roomNumber: String,
    type: String,
    price: Number,
    capacity: Number,
    amenities: [String],
    isAvailable: { type: Boolean, default: true },
    imageUrl: String
  }]
}, { timestamps: true });

const Hotel = mongoose.models.Hotel || mongoose.model('Hotel', hotelSchema);

// Room Schema
const roomSchema = new mongoose.Schema({
  hotelId: { type: String, required: true },
  hotelName: { type: String, required: true },
  roomNumber: { type: String, required: true },
  type: { type: String, required: true },
  price: { type: Number, required: true },
  capacity: { type: Number, required: true },
  amenities: [String],
  isAvailable: { type: Boolean, default: true },
  imageUrl: String,
  managerId: { type: String, required: true },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const Room = mongoose.models.Room || mongoose.model('Room', roomSchema);

// Booking Schema
const bookingSchema = new mongoose.Schema({
  customerId: { type: String, required: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  roomId: { type: String, required: true },
  hotelId: { type: String, required: true },
  hotelName: { type: String, required: true },
  roomNumber: { type: String, required: true },
  roomType: { type: String, required: true },
  roomPrice: { type: Number, required: true },
  checkIn: { type: String, required: true },
  checkOut: { type: String, required: true },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  guests: { type: Number, required: true },
  specialRequests: String
}, { timestamps: true });

const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

// Connect to MongoDB
if (!mongoose.connection.readyState) {
  mongoose.connect(process.env.MONGODB_URI);
}

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, url } = req;
  const path = url.replace('/api', '');
  
  console.log(`${method} ${path}`, req.body);

  try {
    if (method === 'POST' && path === '/auth/register') {
      const { name, email, password, role } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const user = await User.create({ name, email, password, role: role || 'customer' });
      const token = generateToken(user._id);

      return res.status(201).json({
        success: true,
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
      });
    }

    if (method === 'POST' && path === '/auth/login') {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = generateToken(user._id);
      return res.json({
        success: true,
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
      });
    }

    if (method === 'GET' && path === '/auth/profile') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      return res.json({
        success: true,
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
      });
    }

    // Hotel Management Routes
    if (method === 'GET' && path === '/hotels') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        // Allow unauthenticated access to view active hotels only
        const hotels = await Hotel.find({ isDeleted: false });
        return res.json(hotels);
      }

      // Check if it's an admin token
      if (token.startsWith('admin-token-')) {
        // Admin sees all hotels including deleted
        const hotels = await Hotel.find({});
        return res.json(hotels);
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      // Managers see only their active hotels, customers see active hotels
      let hotels;
      if (user.role === 'manager') {
        hotels = await Hotel.find({ managerId: decoded.id, isDeleted: false });
      } else {
        hotels = await Hotel.find({ isDeleted: false }); // Customers see only active
      }
      return res.json(hotels);
    }

    if (method === 'GET' && path === '/hotels/all') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }

      // Return all hotels for customers/admins
      const hotels = await Hotel.find({});
      return res.json(hotels);
    }

    if (method === 'POST' && path === '/hotels') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const hotelData = { ...req.body, managerId: decoded.id };
      const hotel = await Hotel.create(hotelData);
      return res.status(201).json({ success: true, hotel });
    }

    if (method === 'PUT' && path.startsWith('/hotels/')) {
      const hotelId = path.split('/')[2];
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }

      // Check if it's an admin token
      if (token.startsWith('admin-token-')) {
        // Admin can edit any hotel
        const hotel = await Hotel.findByIdAndUpdate(
          hotelId,
          req.body,
          { new: true }
        );
        return res.json({ success: true, hotel });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const hotel = await Hotel.findOneAndUpdate(
        { _id: hotelId, managerId: decoded.id },
        req.body,
        { new: true }
      );
      return res.json({ success: true, hotel });
    }

    if (method === 'DELETE' && path.startsWith('/hotels/')) {
      const hotelId = path.split('/')[2];
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }

      // Check if it's an admin token
      if (token.startsWith('admin-token-')) {
        // Admin can delete any hotel
        const hotel = await Hotel.findByIdAndUpdate(
          hotelId,
          { isDeleted: true },
          { new: true }
        );
        await Room.updateMany({ hotelId }, { isDeleted: true });
        return res.json({ success: true, message: 'Hotel deleted' });
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      // Soft delete hotel
      const hotel = await Hotel.findOneAndUpdate(
        { _id: hotelId, managerId: decoded.id },
        { isDeleted: true },
        { new: true }
      );
      
      // Also soft delete associated rooms
      await Room.updateMany({ hotelId }, { isDeleted: true });
      
      return res.json({ success: true, message: 'Hotel deleted' });
    }

    if (method === 'POST' && path.startsWith('/hotels/') && path.endsWith('/restore')) {
      const hotelId = path.split('/')[2];
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }

      // Check if it's an admin token
      if (!token.startsWith('admin-token-')) {
        return res.status(403).json({ message: 'Only admin can restore hotels' });
      }
      
      // Restore hotel
      await Hotel.findByIdAndUpdate(hotelId, { isDeleted: false });
      await Room.updateMany({ hotelId }, { isDeleted: false });
      
      return res.json({ success: true, message: 'Hotel restored' });
    }

    // Room Management Routes
    if (method === 'GET' && path === '/rooms') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        // Allow unauthenticated access to view active rooms only
        const rooms = await Room.find({ isDeleted: false });
        return res.json(rooms);
      }

      // Check if it's an admin token
      if (token.startsWith('admin-token-')) {
        // Admin sees all rooms including deleted
        const rooms = await Room.find({});
        return res.json(rooms);
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      // Managers see only their active rooms, customers see active rooms
      const rooms = user.role === 'manager' 
        ? await Room.find({ managerId: decoded.id, isDeleted: false })
        : await Room.find({ isDeleted: false });
      return res.json(rooms);
    }

    if (method === 'POST' && path === '/rooms') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const roomData = { ...req.body, managerId: decoded.id };
      const room = await Room.create(roomData);
      return res.status(201).json(room);
    }

    if (method === 'PUT' && path.startsWith('/rooms/')) {
      const roomId = path.split('/')[2];
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const room = await Room.findOneAndUpdate(
        { _id: roomId, managerId: decoded.id },
        req.body,
        { new: true }
      );
      return res.json(room);
    }

    if (method === 'DELETE' && path.startsWith('/rooms/')) {
      const roomId = path.split('/')[2];
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }

      // Check if it's an admin token
      if (token.startsWith('admin-token-')) {
        // Admin can delete any room
        await Room.findByIdAndUpdate(roomId, { isDeleted: true });
        return res.json({ success: true, message: 'Room deleted' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      await Room.findOneAndUpdate(
        { _id: roomId, managerId: decoded.id },
        { isDeleted: true }
      );
      return res.json({ success: true, message: 'Room deleted' });
    }

    if (method === 'POST' && path.startsWith('/rooms/') && path.endsWith('/restore')) {
      const roomId = path.split('/')[2];
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }

      // Check if it's an admin token
      if (!token.startsWith('admin-token-')) {
        return res.status(403).json({ message: 'Only admin can restore rooms' });
      }
      
      // Restore room
      await Room.findByIdAndUpdate(roomId, { isDeleted: false });
      return res.json({ success: true, message: 'Room restored' });
    }

    // Booking Management Routes
    if (method === 'GET' && path === '/bookings') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        // Allow unauthenticated access to view all bookings (for admin)
        const bookings = await Booking.find({});
        return res.json(bookings);
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      let bookings;
      if (user.role === 'customer') {
        bookings = await Booking.find({ customerId: decoded.id });
      } else if (user.role === 'manager') {
        // Get bookings for manager's hotels
        const managerHotels = await Hotel.find({ managerId: decoded.id });
        const hotelIds = managerHotels.map(h => h._id.toString());
        bookings = await Booking.find({ hotelId: { $in: hotelIds } });
      } else {
        bookings = await Booking.find({});
      }
      return res.json(bookings);
    }

    if (method === 'POST' && path === '/bookings') {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const bookingData = { ...req.body, customerId: decoded.id };
      const booking = await Booking.create(bookingData);
      return res.status(201).json(booking);
    }

    // Approve booking
    if (method === 'PUT' && path.startsWith('/bookings/') && path.endsWith('/approve')) {
      const bookingId = path.split('/')[2];
      
      if (!bookingId) {
        return res.status(400).json({ message: 'Booking ID is required' });
      }
      
      const booking = await Booking.findByIdAndUpdate(
        bookingId, 
        { status: 'confirmed' }, 
        { new: true }
      );
      
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      
      return res.json({ success: true, booking });
    }

    // Reject booking
    if (method === 'PUT' && path.startsWith('/bookings/') && path.endsWith('/reject')) {
      const bookingId = path.split('/')[2];
      
      const booking = await Booking.findByIdAndUpdate(
        bookingId, 
        { status: 'cancelled' }, 
        { new: true }
      );
      
      return res.json({ success: true, booking });
    }

    if (method === 'PUT' && path.startsWith('/bookings/')) {
      const bookingId = path.split('/')[2];
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const booking = await Booking.findByIdAndUpdate(bookingId, req.body, { new: true });
      return res.json(booking);
    }

    // Download ticket
    if (method === 'GET' && path.startsWith('/bookings/') && path.endsWith('/ticket')) {
      const bookingId = path.split('/')[2];
      const booking = await Booking.findById(bookingId);
      
      if (!booking || booking.status !== 'confirmed') {
        return res.status(400).json({ message: 'Booking not confirmed' });
      }
      
      const ticket = {
        bookingId: booking._id,
        customerName: booking.customerName,
        hotelName: booking.hotelName,
        roomNumber: booking.roomNumber,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        totalPrice: booking.totalPrice,
        status: booking.status,
        bookingDate: booking.createdAt
      };
      
      return res.json({ success: true, ticket });
    }

    // Users Management Route
    if (method === 'GET' && path === '/users') {
      // Return all users for admin
      const users = await User.find({}).select('-password');
      return res.json(users);
    }

    // Admin Analytics Route
    if (method === 'GET' && path === '/admin/analytics') {
      const totalHotels = await Hotel.countDocuments({ isDeleted: false });
      const totalRooms = await Room.countDocuments({ isDeleted: false });
      const totalBookings = await Booking.countDocuments();
      const totalUsers = await User.countDocuments();
      
      const bookings = await Booking.find({});
      const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
      
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = bookings
        .filter(booking => {
          const bookingDate = new Date(booking.createdAt);
          return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
        })
        .reduce((sum, booking) => sum + booking.totalPrice, 0);
      
      const rooms = await Room.find({ isDeleted: false });
      const roomTypeCount = {};
      rooms.forEach(room => {
        roomTypeCount[room.type] = (roomTypeCount[room.type] || 0) + 1;
      });
      
      const roomTypes = Object.entries(roomTypeCount)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count);
      
      const monthlyBookings = Array.from({ length: 12 }, (_, i) => {
        const month = new Date(2024, i).toLocaleString('default', { month: 'short' });
        const count = bookings.filter(booking => {
          const bookingDate = new Date(booking.createdAt);
          return bookingDate.getMonth() === i && bookingDate.getFullYear() === currentYear;
        }).length;
        return { month, count };
      });
      
      const peakMonths = [...monthlyBookings]
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
      
      const hotels = await Hotel.find({ isDeleted: false });
      const revenueByHotel = hotels.map(hotel => {
        const hotelBookings = bookings.filter(booking => booking.hotelId === hotel._id.toString());
        const revenue = hotelBookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
        return { name: hotel.name, revenue };
      }).sort((a, b) => b.revenue - a.revenue);
      
      return res.json({
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
          revenueByHotel,
          roomTypes,
          monthlyBookings,
          peakMonths
        }
      });
    }

    if (method === 'GET' && path === '/test') {
      return res.json({ message: 'Backend API is working!' });
    }

    if (method === 'GET' && path === '/health') {
      return res.json({ 
        message: 'HotelEase API is running!',
        timestamp: new Date().toISOString(),
        environment: 'production'
      });
    }

    // Catch all route
    if (method === 'GET' && path === '/') {
      return res.json({ message: 'HotelEase API - All endpoints working' });
    }

    return res.status(404).json({ message: 'API route not found' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: error.message });
  }
}