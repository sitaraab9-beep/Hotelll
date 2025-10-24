# HotelEase Backend

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup MongoDB
- Install MongoDB locally OR use MongoDB Atlas
- Update MONGODB_URI in .env file if needed

### 3. Environment Variables
Create `.env` file (already created):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hotelease
JWT_SECRET=your_jwt_secret_key_here_change_in_production
NODE_ENV=development
```

### 4. Start Server
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user  
- `GET /api/auth/profile` - Get user profile (protected)

### Test
- `GET /api/test` - Test backend connection

## Features Implemented

✅ **JWT Authentication**: Secure token-based auth
✅ **Password Hashing**: bcrypt for secure passwords  
✅ **Role-based Access**: Customer, Manager, Admin roles
✅ **MongoDB Integration**: Persistent data storage
✅ **CORS Enabled**: Frontend-backend communication
✅ **Error Handling**: Proper error responses

## Usage

1. Start MongoDB service
2. Run `npm run dev` 
3. Backend runs on http://localhost:5000
4. Frontend can now connect to real API