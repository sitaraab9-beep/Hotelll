import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiCall } from '../utils/api';
import { useAuth } from '../context/AuthContext';

interface Room {
  _id: string;
  roomNumber: string;
  type: string;
  price: number;
  capacity: number;
  amenities: string[];
  isAvailable: boolean;
}

interface Hotel {
  _id: string;
  name: string;
  location: string;
  description: string;
  amenities: string[];
  rating: number;
  rooms: Room[];
}

const HotelDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    specialRequests: ''
  });

  useEffect(() => {
    fetchHotel();
  }, [id]);

  const fetchHotel = async () => {
    try {
      const response = await apiCall(`/hotels/${id}`);
      if (response.ok) {
        const data = await response.json();
        setHotel(data);
      } else {
        setError('Hotel not found');
      }
    } catch (err) {
      setError('Error fetching hotel details');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (roomId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!bookingData.checkIn || !bookingData.checkOut) {
      alert('Please select check-in and check-out dates');
      return;
    }

    try {
      const response = await apiCall('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          roomId,
          checkIn: bookingData.checkIn,
          checkOut: bookingData.checkOut,
          guests: bookingData.guests,
          specialRequests: bookingData.specialRequests
        })
      });

      if (response.ok) {
        alert('Booking confirmed successfully!');
        navigate('/dashboard');
      } else {
        const error = await response.json();
        alert(error.message || 'Booking failed');
      }
    } catch (err) {
      alert('Error creating booking');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
      <div className="text-red-600">{error}</div>
    </div>
  );

  if (!hotel) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="h-64 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500 text-lg">Hotel Image</span>
          </div>
          
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{hotel.name}</h1>
                <p className="text-gray-600 mb-2">📍 {hotel.location}</p>
                <div className="flex items-center mb-4">
                  <span className="text-yellow-500">★</span>
                  <span className="ml-1">{hotel.rating || 'New'}</span>
                </div>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">{hotel.description}</p>
            
            {hotel.amenities && hotel.amenities.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {hotel.amenities.map((amenity, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Booking Form */}
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold mb-4">Book Your Stay</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Check-in</label>
                  <input
                    type="date"
                    value={bookingData.checkIn}
                    onChange={(e) => setBookingData({...bookingData, checkIn: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Check-out</label>
                  <input
                    type="date"
                    value={bookingData.checkOut}
                    onChange={(e) => setBookingData({...bookingData, checkOut: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Guests</label>
                  <select
                    value={bookingData.guests}
                    onChange={(e) => setBookingData({...bookingData, guests: parseInt(e.target.value)})}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  >
                    {[1,2,3,4,5,6].map(num => (
                      <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Special Requests</label>
                  <input
                    type="text"
                    value={bookingData.specialRequests}
                    onChange={(e) => setBookingData({...bookingData, specialRequests: e.target.value})}
                    placeholder="Optional"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            
            {/* Available Rooms */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Available Rooms</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hotel.rooms && hotel.rooms.map(room => (
                  <div key={room._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{room.type} - Room {room.roomNumber}</h4>
                        <p className="text-sm text-gray-600">Capacity: {room.capacity} guests</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">${room.price}/night</div>
                        <div className={`text-sm ${room.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                          {room.isAvailable ? 'Available' : 'Booked'}
                        </div>
                      </div>
                    </div>
                    
                    {room.amenities && room.amenities.length > 0 && (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {room.amenities.map((amenity, index) => (
                            <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <button
                      onClick={() => handleBooking(room._id)}
                      disabled={!room.isAvailable}
                      className={`w-full py-2 px-4 rounded transition-colors ${
                        room.isAvailable 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {room.isAvailable ? 'Book Now' : 'Not Available'}
                    </button>
                  </div>
                ))}
              </div>
              
              {(!hotel.rooms || hotel.rooms.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  No rooms available at this hotel.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetails;