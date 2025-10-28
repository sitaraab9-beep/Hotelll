import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';

const HotelsList: React.FC = () => {
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const response = await fetch('/api/hotels');
      if (response.ok) {
        const data = await response.json();
        setHotels(data);
      }
    } catch (error) {
      console.error('Error fetching hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading hotels...</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Available Hotels</h3>
      {hotels.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No hotels available</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map((hotel) => (
            <div key={hotel._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <h4 className="font-semibold text-lg mb-2">{hotel.name}</h4>
              <p className="text-gray-600 mb-2">📍 {hotel.location}</p>
              <p className="text-sm text-gray-500 mb-3">{hotel.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-yellow-500">⭐ {hotel.rating || 4.0}</span>
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const renderDashboardContent = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminDashboard />;

      case 'manager':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-8 rounded-2xl shadow-2xl">
              <h2 className="text-3xl font-bold mb-3">Manager Dashboard</h2>
              <p className="text-green-100 text-lg">Your property management command center</p>
            </div>
            <HotelsList />
          </div>
        );

      case 'customer':
      default:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-8 rounded-2xl shadow-2xl">
              <h2 className="text-3xl font-bold mb-3">Customer Dashboard</h2>
              <p className="text-blue-100 text-lg">Your gateway to extraordinary experiences</p>
            </div>
            <HotelsList />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {user?.role === 'admin' ? 'Manage your entire platform from here' : 
             user?.role === 'manager' ? 'Oversee your properties and bookings' : 
             'Discover amazing hotels and manage your trips'}
          </p>
        </div>
        
        {renderDashboardContent()}
      </div>
    </div>
  );
};

export default Dashboard;