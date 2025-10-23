import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

interface Hotel {
  _id: string;
  name: string;
  location: string;
  description: string;
  images: string[];
}

interface Room {
  _id: string;
  type: string;
  price: number;
  roomNumber: string;
  capacity: number;
  amenities: string[];
  images: string[];
  description: string;
}

const BookingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [bookingData, setBookingData] = useState({
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    guests: 1
  });

  useEffect(() => {
    const hotelId = searchParams.get('hotel');
    const roomId = searchParams.get('room');
    
    if (hotelId && roomId) {
      fetchHotelAndRoom(hotelId, roomId);
    }
  }, [searchParams]);

  const fetchHotelAndRoom = async (hotelId: string, roomId: string) => {
    try {
      const [hotelRes, roomRes] = await Promise.all([
        fetch(`/api/hotels/${hotelId}`),
        fetch(`/api/rooms/${roomId}`)
      ]);
      
      const hotelData = await hotelRes.json();
      const roomData = await roomRes.json();
      
      if (hotelData.success) setHotel(hotelData.hotel);
      if (roomData.success) setRoom(roomData.room);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!room || !bookingData.checkIn || !bookingData.checkOut) return 0;
    
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    
    return room.price * nights;
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBooking(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          hotelId: hotel?._id,
          roomId: room?._id,
          ...bookingData
        })
      });
      
      if (response.ok) {
        alert('Booking request submitted successfully! Waiting for manager approval.');
        navigate('/bookings');
      } else {
        const errorData = await response.json();
        alert(`Booking failed: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Booking failed. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!hotel || !room) return <div className="p-8">Hotel or room not found.</div>;

  const nights = bookingData.checkIn && bookingData.checkOut ? 
    Math.ceil((new Date(bookingData.checkOut).getTime() - new Date(bookingData.checkIn).getTime()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Complete Your Booking</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Hotel & Room Details */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Hotel Details</h2>
            <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg mb-4 flex items-center justify-center">
              {hotel.images && hotel.images.length > 0 ? (
                <img src={hotel.images[0]} alt={hotel.name} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              )}
            </div>
            <h3 className="text-lg font-semibold">{hotel.name}</h3>
            <p className="text-gray-600">📍 {hotel.location}</p>
            <p className="text-gray-500 mt-2">{hotel.description}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Room Details</h2>
            <div className="h-48 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg mb-4 flex items-center justify-center">
              {room.images && room.images.length > 0 ? (
                <img src={room.images[0]} alt={`${room.type} room`} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                </svg>
              )}
            </div>
            <h3 className="text-lg font-semibold">{room.type} - Room {room.roomNumber}</h3>
            <p className="text-gray-600">👥 Capacity: {room.capacity} guests</p>
            <p className="text-green-600 font-bold text-xl">${room.price}/night</p>
            
            {room.amenities.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Room Amenities:</p>
                <div className="flex flex-wrap gap-1">
                  {room.amenities.map((amenity, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Booking Form */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Booking Details</h2>
          
          <form onSubmit={handleBooking} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date *</label>
              <input
                type="date"
                value={bookingData.checkIn}
                onChange={(e) => setBookingData({...bookingData, checkIn: e.target.value})}
                className="w-full p-3 border rounded-lg"
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date *</label>
              <input
                type="date"
                value={bookingData.checkOut}
                onChange={(e) => setBookingData({...bookingData, checkOut: e.target.value})}
                className="w-full p-3 border rounded-lg"
                required
                min={bookingData.checkIn || new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Guests *</label>
              <input
                type="number"
                value={bookingData.guests}
                onChange={(e) => setBookingData({...bookingData, guests: Number(e.target.value)})}
                className="w-full p-3 border rounded-lg"
                required
                min="1"
                max={room.capacity}
              />
            </div>

            {/* Booking Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Booking Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Room Rate:</span>
                  <span>${room.price}/night</span>
                </div>
                <div className="flex justify-between">
                  <span>Number of Nights:</span>
                  <span>{nights}</span>
                </div>
                <div className="flex justify-between">
                  <span>Guests:</span>
                  <span>{bookingData.guests}</span>
                </div>
                <hr />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Amount:</span>
                  <span className="text-green-600">${calculateTotal()}</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={booking || !bookingData.checkIn || !bookingData.checkOut}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {booking ? 'Processing...' : 'Confirm Booking'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;