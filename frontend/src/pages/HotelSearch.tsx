import React, { useState, useEffect } from 'react';

interface Hotel {
  _id: string;
  name: string;
  location: string;
  description: string;
  amenities: string[];
  images: string[];
  rating: number;
}

interface Room {
  _id: string;
  type: string;
  price: number;
  availability: boolean;
  roomNumber: string;
  capacity: number;
  amenities: string[];
  images: string[];
  description: string;
  hotelId: string;
}

const HotelSearch: React.FC = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: '',
    minPrice: '',
    maxPrice: '',
    roomType: '',
    checkIn: '',
    checkOut: ''
  });

  useEffect(() => {
    fetchHotelsAndRooms();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [hotels, rooms, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchHotelsAndRooms = async () => {
    try {
      const [hotelsRes, roomsRes] = await Promise.all([
        fetch('/api/hotels'),
        fetch('/api/rooms')
      ]);
      
      const hotelsData = await hotelsRes.json();
      const roomsData = await roomsRes.json();
      
      if (hotelsData.success) setHotels(hotelsData.hotels);
      if (roomsData.success) setRooms(roomsData.rooms);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = hotels;

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(hotel => 
        hotel.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Price filter
    if (filters.minPrice || filters.maxPrice) {
      filtered = filtered.filter(hotel => {
        const hotelRooms = rooms.filter(room => room.hotelId === hotel._id);
        if (hotelRooms.length === 0) return false;
        
        const minRoomPrice = Math.min(...hotelRooms.map(room => room.price));
        const maxRoomPrice = Math.max(...hotelRooms.map(room => room.price));
        
        const minFilter = filters.minPrice ? Number(filters.minPrice) : 0;
        const maxFilter = filters.maxPrice ? Number(filters.maxPrice) : Infinity;
        
        return minRoomPrice >= minFilter && maxRoomPrice <= maxFilter;
      });
    }

    // Room type filter
    if (filters.roomType) {
      const hotelsWithRoomType = rooms
        .filter(room => room.type === filters.roomType)
        .map(room => room.hotelId);
      
      filtered = filtered.filter(hotel => hotelsWithRoomType.includes(hotel._id));
    }

    setFilteredHotels(filtered);
  };

  const bookRoom = (hotelId: string, roomId: string) => {
    if (!filters.checkIn || !filters.checkOut) {
      alert('Please select check-in and check-out dates');
      return;
    }
    
    // Navigate to booking page or open booking modal
    window.location.href = `/book?hotel=${hotelId}&room=${roomId}&checkIn=${filters.checkIn}&checkOut=${filters.checkOut}`;
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Search Hotels</h1>
      
      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <input
            type="text"
            placeholder="Location"
            value={filters.location}
            onChange={(e) => setFilters({...filters, location: e.target.value})}
            className="p-3 border rounded-lg"
          />
          <input
            type="number"
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
            className="p-3 border rounded-lg"
          />
          <input
            type="number"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
            className="p-3 border rounded-lg"
          />
          <select
            value={filters.roomType}
            onChange={(e) => setFilters({...filters, roomType: e.target.value})}
            className="p-3 border rounded-lg"
          >
            <option value="">All Room Types</option>
            <option value="Single">Single</option>
            <option value="Double">Double</option>
            <option value="Suite">Suite</option>
            <option value="Deluxe">Deluxe</option>
            <option value="Family">Family</option>
          </select>
          <input
            type="date"
            placeholder="Check-in"
            value={filters.checkIn}
            onChange={(e) => setFilters({...filters, checkIn: e.target.value})}
            className="p-3 border rounded-lg"
          />
          <input
            type="date"
            placeholder="Check-out"
            value={filters.checkOut}
            onChange={(e) => setFilters({...filters, checkOut: e.target.value})}
            className="p-3 border rounded-lg"
          />
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHotels.map((hotel) => {
          const hotelRooms = rooms.filter(room => room.hotelId === hotel._id && room.availability);
          const minPrice = hotelRooms.length > 0 ? Math.min(...hotelRooms.map(room => room.price)) : 0;
          
          return (
            <div key={hotel._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                {hotel.images && hotel.images.length > 0 ? (
                  <img src={hotel.images[0]} alt={hotel.name} className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold">{hotel.name}</h3>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm text-gray-600">{hotel.rating}</span>
                  </div>
                </div>
                <p className="text-gray-600 mb-2">📍 {hotel.location}</p>
                <p className="text-gray-500 text-sm mb-4">{hotel.description}</p>
                
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Available Rooms:</p>
                  {hotelRooms.slice(0, 3).map((room) => (
                    <div key={room._id} className="flex justify-between items-center mb-2 p-2 bg-gray-50 rounded">
                      <span className="text-sm">{room.type} - {room.roomNumber}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-green-600">${room.price}/night</span>
                        <button
                          onClick={() => bookRoom(hotel._id, room._id)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                        >
                          Book
                        </button>
                      </div>
                    </div>
                  ))}
                  {hotelRooms.length > 3 && (
                    <p className="text-xs text-gray-500">+{hotelRooms.length - 3} more rooms</p>
                  )}
                </div>
                
                {minPrice > 0 && (
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">From ${minPrice}/night</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredHotels.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No hotels found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default HotelSearch;