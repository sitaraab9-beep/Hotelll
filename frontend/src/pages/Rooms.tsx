import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

interface Room {
  _id: string;
  hotelId: string;
  hotelName: string;
  roomNumber: string;
  type: string;
  price: number;
  capacity: number;
  amenities: string[];
  isAvailable: boolean;
  imageUrl?: string;
}

const Rooms: React.FC = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({
    hotelId: '',
    roomNumber: '',
    type: 'single',
    price: '',
    capacity: '1',
    amenities: '',
    imageUrl: ''
  });

  const fetchRooms = useCallback(async () => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Fetch hotels first
      const hotelsResponse = await fetch('/api/hotels', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (hotelsResponse.ok) {
        const hotelsData = await hotelsResponse.json();
        setHotels(hotelsData);
      }

      // Fetch rooms
      const roomsResponse = await fetch('/api/rooms', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (roomsResponse.ok) {
        const roomsData = await roomsResponse.json();
        setRooms(roomsData);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    const hotel = hotels.find(h => h._id === formData.hotelId);
    const roomData = {
      ...formData,
      price: parseFloat(formData.price),
      capacity: parseInt(formData.capacity),
      amenities: formData.amenities.split(',').map((a: string) => a.trim()).filter((a: string) => a),
      isAvailable: true,
      hotelName: hotel?.name || ''
    };

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      if (editingRoom) {
        const response = await fetch(`/api/rooms/${editingRoom._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(roomData)
        });
        
        if (response.ok) {
          alert('Room updated successfully!');
        } else {
          throw new Error('Failed to update room');
        }
      } else {
        const response = await fetch('/api/rooms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(roomData)
        });
        
        if (response.ok) {
          alert('Room added successfully!');
        } else {
          throw new Error('Failed to add room');
        }
      }
      
      fetchRooms();
      setShowModal(false);
      setEditingRoom(null);
      setFormData({ hotelId: '', roomNumber: '', type: 'single', price: '', capacity: '1', amenities: '', imageUrl: '' });
    } catch (error) {
      console.error('Error saving room:', error);
      alert('Error saving room');
    }
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      hotelId: room.hotelId,
      roomNumber: room.roomNumber,
      type: room.type,
      price: room.price.toString(),
      capacity: room.capacity.toString(),
      amenities: room.amenities.join(', '),
      imageUrl: room.imageUrl || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`/api/rooms/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          fetchRooms();
          alert('Room deleted successfully!');
        } else {
          throw new Error('Failed to delete room');
        }
      } catch (error) {
        console.error('Error deleting room:', error);
        alert('Error deleting room');
      }
    }
  };

  const toggleAvailability = async (id: string) => {
    try {
      const room = rooms.find(r => r._id === id);
      if (room) {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`/api/rooms/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ isAvailable: !room.isAvailable })
        });
        
        if (response.ok) {
          fetchRooms();
        }
      }
    } catch (error) {
      console.error('Error updating room availability:', error);
    }
  };

  const openAddModal = () => {
    setEditingRoom(null);
    setFormData({ hotelId: '', roomNumber: '', type: 'single', price: '', capacity: '1', amenities: '', imageUrl: '' });
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Rooms</h1>
          <button
            onClick={openAddModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add New Room
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map(room => (
            <div key={room._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center overflow-hidden">
                {room.imageUrl ? (
                  <img 
                    src={room.imageUrl} 
                    alt={`Room ${room.roomNumber}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <span className={`text-white text-lg font-semibold ${room.imageUrl ? 'hidden' : ''}`}>Room {room.roomNumber}</span>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold">{room.type.charAt(0).toUpperCase() + room.type.slice(1)} Room</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    room.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {room.isAvailable ? 'Available' : 'Occupied'}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-2">🏨 {room.hotelName}</p>
                <p className="text-gray-600 mb-2">🚪 Room {room.roomNumber}</p>
                <p className="text-gray-600 mb-2">👥 Capacity: {room.capacity} guests</p>
                <p className="text-green-600 font-bold mb-3">₹{room.price}/night</p>
                
                {room.amenities.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-1">Amenities:</p>
                    <div className="flex flex-wrap gap-1">
                      {room.amenities.slice(0, 3).map((amenity: string, index: number) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {amenity}
                        </span>
                      ))}
                      {room.amenities.length > 3 && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                          +{room.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => handleEdit(room)}
                    className="flex-1 bg-yellow-600 text-white py-2 px-3 rounded hover:bg-yellow-700 transition-colors text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(room._id)}
                    className="flex-1 bg-red-600 text-white py-2 px-3 rounded hover:bg-red-700 transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>
                
                <button
                  onClick={() => toggleAvailability(room._id)}
                  className={`w-full py-2 px-3 rounded transition-colors text-sm ${
                    room.isAvailable 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  Mark as {room.isAvailable ? 'Occupied' : 'Available'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {rooms.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No rooms found. Add your first room!</p>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4">
                {editingRoom ? 'Edit Room' : 'Add New Room'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Hotel</label>
                  <select
                    value={formData.hotelId}
                    onChange={(e) => setFormData({...formData, hotelId: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Hotel</option>
                    {hotels.map((hotel: any) => (
                      <option key={hotel._id} value={hotel._id}>{hotel.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Room Number</label>
                  <input
                    type="text"
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Room Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="single">Single</option>
                    <option value="double">Double</option>
                    <option value="suite">Suite</option>
                    <option value="deluxe">Deluxe</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Price per Night (₹)</label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter price in rupees"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Capacity (guests)</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="10"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Amenities (comma separated)</label>
                  <input
                    type="text"
                    value={formData.amenities}
                    onChange={(e) => setFormData({...formData, amenities: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    placeholder="WiFi, TV, AC, Mini Bar"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Room Image URL</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/room-image.jpg"
                  />
                  {formData.imageUrl && (
                    <div className="mt-2">
                      <img 
                        src={formData.imageUrl} 
                        alt="Preview" 
                        className="w-full h-24 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    {editingRoom ? 'Update Room' : 'Add Room'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rooms;