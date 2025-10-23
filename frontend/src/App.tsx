import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SidebarProvider } from './context/SidebarContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import Hotels from './pages/Hotels';
import Rooms from './pages/Rooms';
import Bookings from './pages/Bookings';
import Favorites from './pages/Favorites';
import ManagerBookings from './pages/ManagerBookings';
import Users from './pages/Users';
import AllHotels from './pages/AllHotels';
import AllRooms from './pages/AllRooms';
import HotelSearch from './pages/HotelSearch';
import HotelDetails from './pages/HotelDetails';
import BookingPage from './pages/BookingPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Sidebar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <div className="pt-16">
                      <Dashboard />
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <div className="pt-16">
                      <Profile />
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/hotels" 
                element={
                  <ProtectedRoute>
                    <div className="pt-16">
                      <Hotels />
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/rooms" 
                element={
                  <ProtectedRoute>
                    <div className="pt-16">
                      <Rooms />
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/bookings" 
                element={
                  <ProtectedRoute>
                    <div className="pt-16">
                      <Bookings />
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/favorites" 
                element={
                  <ProtectedRoute>
                    <div className="pt-16">
                      <Favorites />
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/manager-bookings" 
                element={
                  <ProtectedRoute>
                    <div className="pt-16">
                      <ManagerBookings />
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/users" 
                element={
                  <ProtectedRoute>
                    <div className="pt-16">
                      <Users />
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/all-hotels" 
                element={
                  <ProtectedRoute>
                    <div className="pt-16">
                      <AllHotels />
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/all-rooms" 
                element={
                  <ProtectedRoute>
                    <div className="pt-16">
                      <AllRooms />
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/search" 
                element={
                  <ProtectedRoute>
                    <div className="pt-16">
                      <HotelSearch />
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route path="/hotels/:id" element={<HotelDetails />} />
              <Route 
                path="/book" 
                element={
                  <ProtectedRoute>
                    <div className="pt-16">
                      <BookingPage />
                    </div>
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
        </Router>
      </SidebarProvider>
    </AuthProvider>
  );
}

export default App;