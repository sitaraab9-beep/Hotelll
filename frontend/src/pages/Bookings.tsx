import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockBookings } from '../utils/mockData';

interface Booking {
  _id: string;
  roomId: {
    roomNumber: string;
    type: string;
    price: number;
  };
  hotelId: {
    name: string;
    location: string;
  };
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: string;
  guests: number;
  specialRequests?: string;
  createdAt: string;
}

const Bookings: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      const { getBookingsByCustomer } = await import('../utils/mockData');
      const userBookings = getBookingsByCustomer(user.id);
      setBookings(userBookings);
    } catch (err) {
      setError('Error fetching bookings');
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      // Simulate cancellation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update booking status to cancelled
      setBookings(prev => prev.map(booking => 
        booking._id === bookingId 
          ? { ...booking, status: 'cancelled' }
          : booking
      ));
      
      alert('Booking cancelled successfully');
    } catch (err) {
      alert('Error cancelling booking');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const generateQRCode = (bookingId: string) => {
    // Simple QR code placeholder - in real app would use QR library
    return `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=Booking-${bookingId}`;
  };

  const downloadTicket = (booking: any) => {
    const qrCodeUrl = generateQRCode(booking._id);
    const ticketContent = `
===========================================
           HOTELEASE BOOKING TICKET
===========================================

Booking ID: ${booking._id}
Customer: ${booking.customerName || 'N/A'}
Email: ${booking.customerEmail || 'N/A'}

HOTEL DETAILS:
Name: ${booking.hotelId.name}
Location: ${booking.hotelId.location}

ROOM DETAILS:
Room Number: ${booking.roomId.roomNumber}
Room Type: ${booking.roomId.type}
Price per Night: $${booking.roomId.price}

BOOKING DETAILS:
Check-in: ${new Date(booking.checkIn).toLocaleDateString()}
Check-out: ${new Date(booking.checkOut).toLocaleDateString()}
Guests: ${booking.guests}
Total Price: $${booking.totalPrice}
Status: ${booking.status.toUpperCase()}

Special Requests: ${booking.specialRequests || 'None'}

Booked on: ${new Date(booking.createdAt).toLocaleDateString()}

QR Code: ${qrCodeUrl}

Thank you for choosing HotelEase!
For support: support@hotelease.com

===========================================
    `;

    const blob = new Blob([ticketContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HotelEase-Ticket-${booking._id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {bookings.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-gray-600 text-lg">No bookings found.</p>
            <p className="text-gray-500 mt-2">Start exploring hotels to make your first booking!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map(booking => (
              <div key={booking._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">{booking.hotelId.name}</h3>
                      <p className="text-gray-600">📍 {booking.hotelId.location}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Room</p>
                      <p className="font-medium">{booking.roomId.type} - {booking.roomId.roomNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Check-in</p>
                      <p className="font-medium">{new Date(booking.checkIn).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Check-out</p>
                      <p className="font-medium">{new Date(booking.checkOut).toLocaleDateString()}</p>
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
                    
                    <div className="flex gap-2">
                      {booking.status === 'approved' && (
                        <button
                          onClick={() => downloadTicket(booking)}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                        >
                          🎟️ Download Ticket
                        </button>
                      )}
                      {(booking.status === 'pending' || booking.status === 'approved') && (
                        <button
                          onClick={() => cancelBooking(booking._id)}
                          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">
                      Booked on {new Date(booking.createdAt).toLocaleDateString()}
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

export default Bookings;