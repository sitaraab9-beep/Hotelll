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
    if (method === 'GET' && path.startsWith('/hotels')) {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const hotels = await Hotel.find({ managerId: decoded.id });
      return res.json({ success: true, hotels });
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

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      await Hotel.findOneAndDelete({ _id: hotelId, managerId: decoded.id });
      return res.json({ success: true, message: 'Hotel deleted' });
    }

    if (method === 'GET' && path === '/test') {
      return res.json({ message: 'Backend API is working!' });
    }

    return res.status(404).json({ message: 'API route not found' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: error.message });
  }
}