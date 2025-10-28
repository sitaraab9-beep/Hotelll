import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';

const CustomerBookings: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'customer') {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/bookings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadTicket = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/ticket`);
      if (response.ok) {
        const data = await response.json();
        const ticket = data.ticket;
        
        const ticketContent = `
=== HOTEL BOOKING TICKET ===

Booking ID: ${ticket.bookingId}
Customer: ${ticket.customerName}
Hotel: ${ticket.hotelName}
Room: ${ticket.roomNumber}
Check-in: ${ticket.checkIn}
Check-out: ${ticket.checkOut}
Total Amount: ₹${ticket.totalPrice}
Status: ${ticket.status.toUpperCase()}
Booked on: ${new Date(ticket.bookingDate).toLocaleDateString()}

=== Thank you for choosing us! ===
        `;
        
        const blob = new Blob([ticketContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ticket-${bookingId}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Ticket not available. Booking must be confirmed first.');
      }
    } catch (error) {
      console.error('Error downloading ticket:', error);
    }
  };

  if (user?.role !== 'customer') return null;
  if (loading) return <div className="text-center py-4">Loading bookings...</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">My Bookings</h3>
      {bookings.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No bookings yet</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking._id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{booking.hotelName}</h4>
                  <p className="text-sm text-gray-600">Room {booking.roomNumber}</p>
                  <p className="text-sm text-gray-500">{booking.checkIn} to {booking.checkOut}</p>
                  <p className="text-sm font-medium text-green-600">₹{booking.totalPrice}</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {booking.status.toUpperCase()}
                  </span>
                </div>
                {booking.status === 'confirmed' && (
                  <button
                    onClick={() => downloadTicket(booking._id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Download Ticket
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const HotelsList: React.FC = () => {
  const { user } = useAuth();
  const [hotels, setHotels] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [hotelsRes, roomsRes] = await Promise.all([
        fetch('/api/hotels'),
        fetch('/api/rooms')
      ]);
      
      if (hotelsRes.ok) {
        const hotelsData = await hotelsRes.json();
        setHotels(hotelsData);
      }
      
      if (roomsRes.ok) {
        const roomsData = await roomsRes.json();
        setRooms(roomsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const bookRoom = (hotelId: string) => {
    const hotelRooms = rooms.filter(room => room.hotelId === hotelId && room.isAvailable);
    if (hotelRooms.length > 0) {
      setSelectedHotel(hotelId);
      setSelectedRoom(hotelRooms[0]._id);
      setShowBookingModal(true);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      const hotel = hotels.find(h => h._id === selectedHotel);
      const room = rooms.find(r => r._id === selectedRoom);
      
      if (!room || !hotel) {
        alert('Room or hotel not found');
        return;
      }
      
      const checkInDate = new Date(bookingData.checkIn);
      const checkOutDate = new Date(bookingData.checkOut);
      const days = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      const totalPrice = room.price * days;
      
      const bookingPayload = {
        customerName: user.name,
        customerEmail: user.email,
        roomId: room._id,
        hotelId: hotel._id,
        hotelName: hotel.name,
        roomNumber: room.roomNumber,
        roomType: room.type,
        roomPrice: room.price,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        totalPrice,
        guests: bookingData.guests,
        specialRequests: ''
      };

      const token = localStorage.getItem('token');
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingPayload)
      });

      if (response.ok) {
        setShowBookingModal(false);
        setBookingData({ checkIn: '', checkOut: '', guests: 1 });
        alert(`🎉 Booking submitted successfully!\n\nHotel: ${hotel.name}\nRoom: ${room.roomNumber}\nTotal: ₹${totalPrice} for ${days} days\n\n⏳ Status: PENDING\nWaiting for manager approval.\nYou can download your ticket once approved.`);
      } else {
        throw new Error('Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Error creating booking');
    }
  };

  if (loading) return <div className="text-center py-8">Loading hotels...</div>;

  return (
    <>
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Available Hotels</h3>
        {hotels.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hotels available</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => {
              const hotelRooms = rooms.filter(room => room.hotelId === hotel._id);
              const availableRooms = hotelRooms.filter(room => room.isAvailable);
              const minPrice = hotelRooms.length > 0 ? Math.min(...hotelRooms.map(room => room.price)) : 0;
              
              return (
                <div key={hotel._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition duration-300">
                  <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                    {hotel.imageUrl ? (
                      <img src={hotel.imageUrl} alt={hotel.name} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{hotel.name}</h4>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm text-gray-600">{hotel.rating || 4.0}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">📍 {hotel.location}</p>
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{hotel.description}</p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">{availableRooms.length}</span> rooms available
                      </div>
                      {minPrice > 0 && (
                        <div className="text-lg font-bold text-green-600">
                          ₹{minPrice}/night
                        </div>
                      )}
                    </div>
                    
                    {user?.role === 'customer' && (
                      <button 
                        onClick={() => bookRoom(hotel._id)}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
                        disabled={availableRooms.length === 0}
                      >
                        {availableRooms.length > 0 ? 'Book Now' : 'No Rooms Available'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Book Room</h2>
            <form onSubmit={handleBooking} className="space-y-4">
              <input
                type="date"
                placeholder="Check-in Date"
                value={bookingData.checkIn}
                onChange={(e) => setBookingData({...bookingData, checkIn: e.target.value})}
                className="w-full p-3 border rounded-lg"
                required
              />
              <input
                type="date"
                placeholder="Check-out Date"
                value={bookingData.checkOut}
                onChange={(e) => setBookingData({...bookingData, checkOut: e.target.value})}
                className="w-full p-3 border rounded-lg"
                required
              />
              <input
                type="number"
                placeholder="Number of Guests"
                value={bookingData.guests}
                onChange={(e) => setBookingData({...bookingData, guests: Number(e.target.value)})}
                className="w-full p-3 border rounded-lg"
                min="1"
                required
              />
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Book Now
                </button>
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
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
            <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-8 rounded-2xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative">
                <h2 className="text-3xl font-bold mb-3">Manager Dashboard</h2>
                <p className="text-green-100 text-lg">Your property management command center</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">My Hotels</h3>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-500 mt-2">Active properties</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Total Rooms</h3>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-500 mt-2">Across all properties</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Manager Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-200">
                  <h4 className="font-medium text-gray-900">Add New Hotel</h4>
                  <p className="text-sm text-gray-500 mt-1">Register a new property</p>
                </button>
                <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-200">
                  <h4 className="font-medium text-gray-900">Manage Rooms</h4>
                  <p className="text-sm text-gray-500 mt-1">Add or edit room details</p>
                </button>
                <button 
                  onClick={() => window.location.href = '/manager-bookings'}
                  className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-200"
                >
                  <h4 className="font-medium text-gray-900">View Bookings</h4>
                  <p className="text-sm text-gray-500 mt-1">Check recent reservations</p>
                </button>
              </div>
            </div>
          </div>
        );

      case 'customer':
      default:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-8 rounded-2xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative">
                <h2 className="text-3xl font-bold mb-3">Customer Dashboard</h2>
                <p className="text-blue-100 text-lg">Your gateway to extraordinary experiences</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Available Hotels</h3>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-500 mt-2">Properties to explore</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Available Rooms</h3>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-500 mt-2">Ready for booking</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">My Bookings</h3>
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-500 mt-2">Active reservations</p>
              </div>
            </div>

            <CustomerBookings />
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