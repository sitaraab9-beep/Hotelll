const User = require('../models/User');

const seedAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@hotelease.com' });
    
    if (!existingAdmin) {
      // Create default admin
      const admin = new User({
        name: 'Admin User',
        email: 'admin@hotelease.com',
        password: 'Admin@123',
        role: 'admin'
      });
      
      await admin.save();
      
      console.log('✅ Admin user created successfully');
      console.log('Email: admin@hotelease.com');
      console.log('Password: Admin@123');
    } else {
      console.log('✅ Admin user already exists');
      console.log('Email: admin@hotelease.com');
      console.log('Password: Admin@123');
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    // Try to create admin anyway for first time setup
    console.log('📧 Use these credentials to login:');
    console.log('Email: admin@hotelease.com');
    console.log('Password: Admin@123');
  }
};

module.exports = seedAdmin;