import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';

interface Hotel {
  _id: string;
  name: string;
  location: string;
  description: string;
  amenities: string[];
  images: string[];
  rating: number;
  totalRooms: number;
}

interface Room {
  _id: string;
  type: string;
  price: number;
  availability: boolean;
  hotelId: string;
  hotelName: string;
  roomNumber: string;
  capacity: number;
  amenities: string[];
  images: string[];
  description: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    hotels: 0,
    rooms: 0,
    users: 0,
    bookings: 0,
    totalRevenue: 0,
    monthlyRevenue: 0
  });
  const [analytics, setAnalytics] = useState<{
    roomTypes: any[];
    monthlyBookings: any[];
    revenueByHotel: any[];
    peakMonths: any[];
  }>({
    roomTypes: [],
    monthlyBookings: [],
    revenueByHotel: [],
    peakMonths: []
  });
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users] = useState<any[]>([]);
  const [bookings] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1
  });

  const fetchStats = React.useCallback(async () => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Fetch hotels
      const hotelsResponse = await fetch('/api/hotels', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const hotelsData = hotelsResponse.ok ? await hotelsResponse.json() : [];

      // Fetch rooms
      const roomsResponse = await fetch('/api/rooms', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const roomsData = roomsResponse.ok ? await roomsResponse.json() : [];

      // Fetch bookings and users for admin
      let bookingsData: any[] = [];
      let usersData: any[] = [];
      
      if (user.role === 'admin') {
        try {
          const bookingsResponse = await fetch('/api/bookings');
          if (bookingsResponse.ok) {
            bookingsData = await bookingsResponse.json();
          }
          
          const usersResponse = await fetch('/api/users');
          if (usersResponse.ok) {
            usersData = await usersResponse.json();
          }
        } catch (error) {
          console.log('Admin data not available');
        }
      }
      
      // Calculate analytics
      const totalRevenue = bookingsData.reduce((sum: number, booking: any) => 
        sum + (booking.totalPrice || 0), 0);
      
      const currentMonth = new Date().getMonth();
      const monthlyRevenue = bookingsData
        .filter((booking: any) => new Date(booking.createdAt).getMonth() === currentMonth)
        .reduce((sum: number, booking: any) => sum + (booking.totalPrice || 0), 0);
      
      // Room type analytics
      const roomTypeCount = roomsData.reduce((acc: any, room: any) => {
        acc[room.type] = (acc[room.type] || 0) + 1;
        return acc;
      }, {});
      
      const roomTypes = Object.entries(roomTypeCount).map(([type, count]) => ({ type, count }));
      
      // Monthly bookings
      const monthlyBookings = Array.from({ length: 12 }, (_, i) => {
        const month = new Date(2024, i).toLocaleString('default', { month: 'short' });
        const count = bookingsData.filter((booking: any) => 
          new Date(booking.createdAt).getMonth() === i).length;
        return { month, count };
      });
      
      // Revenue by hotel
      const revenueByHotel = hotelsData.map((hotel: any) => {
        const hotelBookings = bookingsData.filter((booking: any) => booking.hotelId === hotel._id);
        const revenue = hotelBookings.reduce((sum: number, booking: any) => sum + (booking.totalPrice || 0), 0);
        return { name: hotel.name, revenue };
      }).sort((a: any, b: any) => b.revenue - a.revenue);
      
      setAnalytics({
        roomTypes,
        monthlyBookings,
        revenueByHotel,
        peakMonths: monthlyBookings.sort((a: any, b: any) => b.count - a.count).slice(0, 3)
      });

      setStats({
        hotels: hotelsData.length,
        rooms: roomsData.length,
        users: usersData.length || 1,
        bookings: bookingsData.length,
        totalRevenue,
        monthlyRevenue
      });
      
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [user]);

  const fetchHotelsAndRooms = React.useCallback(async () => {
    if (!user || (user.role !== 'customer' && user.role !== 'admin')) return;
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // For customers and admins, fetch all hotels
      const hotelsResponse = await fetch('/api/hotels');
      const hotelsData = hotelsResponse.ok ? await hotelsResponse.json() : [];
      
      const mappedHotels = hotelsData.map((hotel: any) => ({
        ...hotel,
        images: hotel.imageUrl ? [hotel.imageUrl] : [],
        totalRooms: 0 // Will be calculated from rooms
      }));
      setHotels(mappedHotels);
      
      // For admin, fetch all rooms without auth (since admin tokens don't work with API)
      const roomsResponse = user.role === 'admin' 
        ? await fetch('/api/rooms')
        : await fetch('/api/rooms', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
      const roomsData = roomsResponse.ok ? await roomsResponse.json() : [];
      
      const mappedRooms = roomsData.map((room: any) => ({
        ...room,
        availability: room.isAvailable,
        images: room.imageUrl ? [room.imageUrl] : [],
        description: `${room.type} room in ${room.hotelName}`
      }));
      setRooms(mappedRooms);
      
      // Mock favorites for now
      setFavorites([]);
      
      // Set users data for admin
      if (user.role === 'admin') {
        const adminUser = {
          id: 'admin-001',
          name: 'System Administrator',
          email: 'admin@hotelease.com',
          role: 'admin',
          createdAt: new Date().toISOString()
        };
        setUsers([adminUser]);
      }
    } catch (error) {
      console.error('Error fetching hotels and rooms:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
    fetchHotelsAndRooms();
  }, [fetchStats, fetchHotelsAndRooms]);

  const bookRoom = (hotelId: string, roomId: string) => {
    setSelectedHotel(hotelId);
    setSelectedRoom(roomId);
    setShowBookingModal(true);
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
        alert(`🎉 Booking submitted successfully!\n\nHotel: ${hotel.name}\nRoom: ${room.roomNumber}\nTotal: ₹${totalPrice} for ${days} days\n\n⏳ Your booking is now PENDING and waiting for manager approval.`);
      } else {
        throw new Error('Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Error creating booking');
    }
  };



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
                <p className="text-3xl font-bold text-gray-900">{stats.hotels}</p>
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
                <p className="text-3xl font-bold text-gray-900">{stats.rooms}</p>
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
                <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-200">
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
                <p className="text-3xl font-bold text-gray-900">{hotels.length}</p>
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
                <p className="text-3xl font-bold text-gray-900">{rooms.filter(room => room.availability).length}</p>
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
                <p className="text-3xl font-bold text-gray-900">{stats.bookings}</p>
                <p className="text-sm text-gray-500 mt-2">Active reservations</p>
              </div>
            </div>

            {/* Hotels Section */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Available Hotels</h3>
                {loading && <div className="text-sm text-gray-500">Loading...</div>}
              </div>
              
              {hotels.length === 0 && !loading ? (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p className="text-gray-500">No hotels available yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {hotels.map((hotel) => {
                    const hotelRooms = rooms.filter(room => room.hotelId === hotel._id);
                    const availableRooms = hotelRooms.filter(room => room.availability);
                    const minPrice = hotelRooms.length > 0 ? Math.min(...hotelRooms.map(room => room.price)) : 0;
                    
                    return (
                      <div key={hotel._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition duration-300">
                        <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                          {hotel.images && hotel.images.length > 0 ? (
                            <img src={hotel.images[0]} alt={hotel.name} className="w-full h-full object-cover" />
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
                              <span className="text-sm text-gray-600">{hotel.rating}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{hotel.location}</p>
                          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{hotel.description}</p>
                          
                          <div className="flex items-center justify-between mb-3">
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">{availableRooms.length}</span> rooms available
                            </div>
                            <div className="text-sm text-gray-500">
                              <span className="font-medium">{hotelRooms.length}</span> total rooms
                            </div>
                          </div>
                          {minPrice > 0 && (
                            <div className="text-center mb-3">
                              <div className="text-lg font-bold text-green-600">
                                ₹{minPrice}/night
                              </div>
                            </div>
                          )}
                          
                          {hotel.amenities && hotel.amenities.length > 0 && (
                            <div className="mb-3">
                              <div className="flex flex-wrap gap-1">
                                {hotel.amenities.slice(0, 3).map((amenity: string, index: number) => (
                                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                    {amenity}
                                  </span>
                                ))}
                                {hotel.amenities.length > 3 && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                    +{hotel.amenities.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex gap-2">
                            <button 
                              onClick={() => bookRoom(hotel._id, hotelRooms[0]?._id)}
                              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
                              disabled={availableRooms.length === 0}
                            >
                              {availableRooms.length > 0 ? 'Book Now' : 'No Rooms'}
                            </button>
                          </div>
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
                <div className="bg-white p-8 rounded-lg max-w-md w-full">
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
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-12 text-center">
          <div className="w-24 h-24 bg-white rounded-full p-3 shadow-2xl mx-auto mb-6 animate-spin-slow">
            <img 
              src="/logo.png.png" 
              alt="HotelEase Logo" 
              className="w-full h-full object-contain rounded-full"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4 animate-fade-in-up">
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