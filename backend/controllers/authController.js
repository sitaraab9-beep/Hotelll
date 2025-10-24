const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Temporary in-memory storage for development
let tempUsers = [
  { id: '1', name: 'Hotel Manager', email: 'hman@gmail.com', password: '$2a$12$dummy', role: 'manager' },
  { id: '2', name: 'System Admin', email: 'admin@gmail.com', password: '$2a$12$dummy', role: 'admin' },
  { id: '3', name: 'Customer User', email: 'user@gmail.com', password: '$2a$12$dummy', role: 'customer' }
];

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists in temp storage
    const existingUser = tempUsers.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user in temp storage
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password: '$2a$12$dummy', // Mock hashed password
      role: role || 'customer'
    };
    
    tempUsers.push(newUser);
    const token = generateToken(newUser.id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists in temp storage
    const user = tempUsers.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // For development, accept any password
    const token = generateToken(user.id);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = tempUsers.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getProfile };