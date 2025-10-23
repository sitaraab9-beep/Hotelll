const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'customer' }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect('mongodb+srv://hotelease:hotelease123@cluster0.mongodb.net/hotelease');
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default async function handler(req, res) {
  await connectDB();
  
  const { method, body } = req;
  const { action } = req.query;

  if (method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (action === 'register') {
      const { name, email, password, role } = body;
      
      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: role || 'customer'
      });

      const token = jwt.sign({ id: user._id }, 'secret123', { expiresIn: '7d' });
      
      return res.json({
        success: true,
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
      });
    }

    if (action === 'login') {
      const { email, password } = body;
      
      const user = await User.findOne({ email });
      if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user._id }, 'secret123', { expiresIn: '7d' });
      
      return res.json({
        success: true,
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
      });
    }

    return res.status(400).json({ message: 'Invalid action' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}