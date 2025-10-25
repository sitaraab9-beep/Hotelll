import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchHotel = async () => {
    try {
      const response = await fetch(`/api/hotels`);
      if (response.ok) {
        const hotels = await response.json();
        const foundHotel = hotels.find((hotel: any) => hotel._id === id);
        if (foundHotel) {
          setHotel(foundHotel);
        } else {
          setError('Hotel not found');
        }
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
    console.log('Booking started for room:', roomId);
    console.log('User:', user);
    console.log('Booking data:', bookingData);
    
    if (!user) {
      navigate('/login');
      return;
    }

    if (!bookingData.checkIn || !bookingData.checkOut) {
      alert('Please select check-in and check-out dates');
      return;
    }

    try {
      const { addBooking } = await import('../utils/mockData');
      const room = hotel?.rooms.find(r => r._id === roomId);
      
      if (!room) {
        alert('Room not found');
        return;
      }
      
      const checkInDate = new Date(bookingData.checkIn);
      const checkOutDate = new Date(bookingData.checkOut);
      
      if (checkOutDate <= checkInDate) {
        alert('Check-out date must be after check-in date');
        return;
      }
      
      const days = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      const totalPrice = room.price * days;
      
      const newBooking = {
        _id: 'b' + Date.now(),
        customerId: user.id,
        customerName: user.name,
        customerEmail: user.email,
        roomId: {
          _id: roomId,
          roomNumber: room.roomNumber,
          type: room.type,
          price: room.price
        },
        hotelId: {
          _id: hotel?._id || '',
          name: hotel?.name || '',
          location: hotel?.location || ''
        },
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        totalPrice,
        status: 'pending',
        guests: bookingData.guests,
        specialRequests: bookingData.specialRequests,
        createdAt: new Date().toISOString()
      };
      
      console.log('Creating booking:', newBooking);
      addBooking(newBooking);
      
      alert('🎉 Booking submitted successfully! \n\n⏳ Your booking is now PENDING and waiting for manager approval. \n\n📧 You will be notified once the manager reviews your request. \n\n📋 You can check the status in "My Bookings" section.');
      navigate('/bookings');
    } catch (err) {
      console.error('Booking error:', err);
      alert('Error creating booking: ' + (err as Error).message);
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
                        <div className="text-lg font-bold text-green-600">₹{room.price}/night</div>
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