# MongoDB Setup Instructions

## Option 1: MongoDB Atlas (Cloud - Recommended)

1. **Create MongoDB Atlas Account:**
   - Go to https://www.mongodb.com/atlas
   - Sign up for free account

2. **Create Cluster:**
   - Click "Build a Database"
   - Choose "Free" tier
   - Select region closest to you
   - Click "Create Cluster"

3. **Setup Database Access:**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Create username/password
   - Set permissions to "Read and write to any database"

4. **Setup Network Access:**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)

5. **Get Connection String:**
   - Go to "Databases"
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

6. **Update .env file:**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/hotelease?retryWrites=true&w=majority
   ```

## Option 2: Local MongoDB

1. **Install MongoDB:**
   - Download from https://www.mongodb.com/try/download/community
   - Install MongoDB Community Server

2. **Start MongoDB Service:**
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```

3. **Use Local Connection:**
   ```
   MONGODB_URI=mongodb://localhost:27017/hotelease
   ```

## Test Connection

1. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Check Console:**
   - Should see "✅ Connected to MongoDB"
   - Should see "🚀 Server running on port 5000"

3. **Test API:**
   - Visit http://localhost:5000/api/test
   - Should return: {"message": "Backend is working!"}

## Troubleshooting

- **Connection timeout:** Check network access settings
- **Authentication failed:** Verify username/password
- **Server not starting:** Check if port 5000 is available