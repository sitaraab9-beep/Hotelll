import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateBookingStatus } from '../utils/mockData';

const ManagerBookings: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user && user.role === 'manager') {
      fetchManagerBookings();
    }
  }, [user]);

  const fetchManagerBookings = async () => {
    if (!user) return;
    
    try {
      const { getBookingsByManager } = await import('../utils/mockData');
      const managerBookings = getBookingsByManager(user.id);
      setBookings(managerBookings);
    } catch (error) {
      console.error('Error fetching manager bookings:', error);
    }
  };

  const handleApprove = (bookingId: string) => {
    updateBookingStatus(bookingId, 'approved');
    fetchManagerBookings();
    alert('✅ Booking approved! Customer has been notified and can now download their ticket.');
  };

  const handleReject = (bookingId: string) => {
    if (window.confirm('Are you sure you want to reject this booking?')) {
      updateBookingStatus(bookingId, 'cancelled');
      fetchManagerBookings();
      alert('❌ Booking rejected. Customer has been notified.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'pending') return booking.status === 'pending';
    if (filter === 'approved') return booking.status === 'approved';
    if (filter === 'cancelled') return booking.status === 'cancelled';
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Booking Requests</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
            >
              All ({bookings.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded ${filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-white text-gray-700'}`}
            >
              Pending ({bookings.filter(b => b.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded ${filter === 'approved' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'}`}
            >
              Approved ({bookings.filter(b => b.status === 'approved').length})
            </button>
          </div>
        </div>
        
        {filteredBookings.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-gray-600 text-lg">No {filter === 'all' ? '' : filter} bookings found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map(booking => (
              <div key={booking._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">{booking.hotelId.name}</h3>
                      <p className="text-gray-600">📍 {booking.hotelId.location}</p>
                      <p className="text-sm text-gray-500 mt-1">Booking ID: {booking._id}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Customer</p>
                      <p className="font-medium">{booking.customerName}</p>
                      <p className="text-sm text-gray-500">{booking.customerEmail}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Room</p>
                      <p className="font-medium">{booking.roomId.type} - {booking.roomId.roomNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Dates</p>
                      <p className="font-medium">{new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Guests</p>
                      <p className="font-medium">{booking.guests}</p>
                    </div>
                  </div>
                  
                  {booking.specialRequests && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Special Requests</p>
                      <p className="text-gray-700">{booking.specialRequests}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div>
                      <p className="text-sm text-gray-500">Total Price</p>
                      <p className="text-2xl font-bold text-green-600">${booking.totalPrice}</p>
                    </div>
                    
                    {booking.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(booking._id)}
                          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                        >
                          ✅ Approve
                        </button>
                        <button
                          onClick={() => handleReject(booking._id)}
                          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                        >
                          ❌ Reject
                        </button>
                      </div>
                    )}
                    
                    {booking.status === 'approved' && (
                      <div className="text-green-600 font-medium">
                        ✅ Approved on {new Date().toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">
                      Requested on {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerBookings;