# HotelEase - Online Hotel Booking & Management System

## Week 1 - Setup & Authentication ✅

A full-stack hotel booking platform with role-based authentication system.

### Tech Stack
- **Frontend**: React.js + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **Authentication**: JWT + bcrypt

### Features Implemented (Week 1)
- ✅ JWT authentication system
- ✅ Role-based access (Customer, Manager, Admin)
- ✅ Password hashing with bcrypt
- ✅ Login/Register pages
- ✅ Role-based dashboards
- ✅ Protected routes
- ✅ Responsive navigation
- ✅ MongoDB connection

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Backend Setup
1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file (already created) and update MongoDB URI if needed:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/hotelease
   JWT_SECRET=your_jwt_secret_key_here_change_in_production
   NODE_ENV=development
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies (already done):
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm start
   ```

### Testing the Application

1. **Start MongoDB** (if using local installation)

2. **Start Backend** (runs on http://localhost:5000)
   ```bash
   cd backend && npm run dev
   ```

3. **Start Frontend** (runs on http://localhost:3000)
   ```bash
   cd frontend && npm start
   ```

4. **Test Authentication**:
   - Visit http://localhost:3000
   - Register with different roles (customer, manager, admin)
   - Login and see role-based dashboards
   - Test protected routes

### API Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)

### User Roles
- **Customer**: Can search and book hotels
- **Manager**: Can manage hotels and rooms
- **Admin**: Can view analytics and manage all users/hotels

### Project Structure
```
HotelEase/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   ├── utils/
    │   └── App.tsx
    └── public/
```

## Next Steps (Week 2)
- Hotel & Room Management
- CRUD operations for hotels and rooms
- Hotel management dashboard
- Room listing and forms