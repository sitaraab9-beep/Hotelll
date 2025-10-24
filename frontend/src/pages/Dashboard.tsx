import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockHotels, mockBookings } from '../utils/mockData';

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
    bookings: 0
  });
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
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
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    try {
      const allRooms = mockHotels.flatMap(hotel => hotel.rooms);
      
      setStats({
        hotels: mockHotels.length,
        rooms: allRooms.length,
        users: 25, // Mock user count
        bookings: mockBookings.length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchHotelsAndRooms = React.useCallback(async () => {
    if (user?.role !== 'customer' && user?.role !== 'admin') return;
    
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      // Set mock hotels with proper interface
      const mappedHotels = mockHotels.map(hotel => ({
        ...hotel,
        images: [],
        totalRooms: hotel.rooms.length
      }));
      setHotels(mappedHotels);
      
      // Flatten all rooms from hotels
      const allRooms = mockHotels.flatMap(hotel => 
        hotel.rooms.map(room => ({
          ...room,
          hotelId: hotel._id,
          availability: room.isAvailable,
          images: [],
          description: `${room.type} room in ${hotel.name}`
        }))
      );
      setRooms(allRooms);
      
      // Load favorites
      if (user?.role === 'customer') {
        const { getFavorites } = await import('../utils/mockData');
        const userFavorites = getFavorites(user.id);
        setFavorites(userFavorites.map((fav: any) => fav.hotelId));
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
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          hotelId: selectedHotel,
          roomId: selectedRoom,
          ...bookingData
        })
      });
      
      if (response.ok) {
        setShowBookingModal(false);
        setBookingData({ checkIn: '', checkOut: '', guests: 1 });
        alert('Booking request submitted! Waiting for manager approval.');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
    }
  };

  const toggleFavorite = async (hotelId: string) => {
    if (!user) return;
    
    try {
      const hotel = mockHotels.find(h => h._id === hotelId);
      const { toggleFavorite: toggleFav } = await import('../utils/mockData');
      const result = toggleFav(user.id, hotelId, hotel?.name || '', hotel?.location || '');
      
      if (result.isFavorite) {
        setFavorites([...favorites, hotelId]);
      } else {
        setFavorites(favorites.filter(id => id !== hotelId));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const renderDashboardContent = () => {
    switch (user?.role) {
      case 'admin':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-8 rounded-2xl shadow-2xl relative overflow-hidden animate-fade-in-up">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/5 rounded-full animate-bounce-slow"></div>
              <div className="relative">
                <h2 className="text-3xl font-bold mb-3 animate-slide-up">Admin Dashboard</h2>
                <p className="text-red-100 text-lg animate-fade-in" style={{animationDelay: '0.3s'}}>Complete control over your platform ecosystem</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition duration-500 transform hover:-translate-y-2 animate-fade-in-up opacity-0" style={{animationDelay: '0.2s', animationFillMode: 'forwards'}}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Total Users</h3>
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition duration-300">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">{stats.users}</p>
                <div className="flex items-center">
                  <span className="text-gray-500 text-sm">Registered users</span>
                </div>
              </div>

              <div className="group bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition duration-500 transform hover:-translate-y-2 animate-fade-in-up opacity-0" style={{animationDelay: '0.4s', animationFillMode: 'forwards'}}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Total Hotels</h3>
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition duration-300">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
                <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mb-2">{stats.hotels}</p>
                <div className="flex items-center">
                  <span className="text-gray-500 text-sm">Active properties</span>
                </div>
              </div>

              <div className="group bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition duration-500 transform hover:-translate-y-2 animate-fade-in-up opacity-0" style={{animationDelay: '0.6s', animationFillMode: 'forwards'}}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Total Bookings</h3>
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition duration-300">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-2">{stats.bookings}</p>
                <div className="flex items-center">
                  <span className="text-gray-500 text-sm">Total reservations</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-200">
                  <h4 className="font-medium text-gray-900">Manage Users</h4>
                  <p className="text-sm text-gray-500 mt-1">View and manage all user accounts</p>
                </button>
                <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-200">
                  <h4 className="font-medium text-gray-900">System Settings</h4>
                  <p className="text-sm text-gray-500 mt-1">Configure system-wide settings</p>
                </button>
              </div>
            </div>

            {/* Hotels Overview */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">All Hotels Overview</h3>
                <div className="text-sm text-gray-500">{hotels.length} total hotels</div>
              </div>
              
              {hotels.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p className="text-gray-500">No hotels registered yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {hotels.slice(0, 6).map((hotel) => {
                    const hotelRooms = rooms.filter(room => room.hotelId === hotel._id);
                    const availableRooms = hotelRooms.filter(room => room.availability);
                    
                    return (
                      <div key={hotel._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 truncate">{hotel.name}</h4>
                          <div className="flex items-center">
                            <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-sm text-gray-600">{hotel.rating}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{hotel.location}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">{availableRooms.length} rooms available</span>
                          <span className="text-green-600 font-medium">{hotelRooms.length} total rooms</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {hotels.length > 6 && (
                <div className="text-center mt-4">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View all {hotels.length} hotels →
                  </button>
                </div>
              )}
            </div>
          </div>
        );

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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
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
                <p className="text-3xl font-bold text-gray-900">{mockBookings.length}</p>
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
                                ${minPrice}/night
                              </div>
                            </div>
                          )}
                          
                          {hotel.amenities && hotel.amenities.length > 0 && (
                            <div className="mb-3">
                              <div className="flex flex-wrap gap-1">
                                {hotel.amenities.slice(0, 3).map((amenity, index) => (
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
                            <button 
                              onClick={() => toggleFavorite(hotel._id)}
                              className="bg-red-100 text-red-600 hover:bg-red-200 px-3 py-2 rounded-lg transition duration-200"
                            >
                              {favorites.includes(hotel._id) ? '❤️' : '🤍'}
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