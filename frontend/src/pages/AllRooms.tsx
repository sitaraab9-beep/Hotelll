import React, { useState, useEffect } from 'react';

interface Room {
  _id: string;
  type: string;
  price: number;
  availability: boolean;
  roomNumber: string;
  capacity: number;
  amenities: string[];
  description: string;
  images: string[];
  hotelId: {
    _id: string;
    name: string;
  };
}

const AllRooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({
    type: 'Single',
    price: '',
    roomNumber: '',
    capacity: '',
    amenities: '',
    description: '',
    images: ''
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/rooms', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setRooms(data.rooms);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const amenitiesArray = formData.amenities.split(',').map(a => a.trim()).filter(a => a);
      
      const response = await fetch(`/api/rooms/${editingRoom?._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          capacity: Number(formData.capacity),
          amenities: amenitiesArray,
          images: formData.images.split(',').map(img => img.trim()).filter(img => img)
        })
      });

      if (response.ok) {
        fetchRooms();
        setShowForm(false);
        setEditingRoom(null);
        setFormData({
          type: 'Single',
          price: '',
          roomNumber: '',
          capacity: '',
          amenities: '',
          description: '',
          images: ''
        });
      }
    } catch (error) {
      console.error('Error saving room:', error);
    }
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      type: room.type,
      price: room.price.toString(),
      roomNumber: room.roomNumber,
      capacity: room.capacity.toString(),
      amenities: room.amenities.join(', '),
      description: room.description || '',
      images: room.images?.join(', ') || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/rooms/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          fetchRooms();
        }
      } catch (error) {
        console.error('Error deleting room:', error);
      }
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">All Rooms Management</h1>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full max-h-96 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Room</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                  required
                >
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                  <option value="Suite">Suite</option>
                  <option value="Deluxe">Deluxe</option>
                  <option value="Family">Family</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Number *</label>
                <input
                  type="text"
                  placeholder="e.g., 101, A-205"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price per Night ($) *</label>
                <input
                  type="number"
                  placeholder="Enter price in dollars"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Guest Capacity *</label>
                <input
                  type="number"
                  placeholder="Maximum number of guests"
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                  required
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Amenities</label>
                <input
                  type="text"
                  placeholder="AC, TV, Mini Bar, Balcony (comma separated)"
                  value={formData.amenities}
                  onChange={(e) => setFormData({...formData, amenities: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Description</label>
                <textarea
                  placeholder="Describe the room features and highlights"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-3 border rounded-lg h-20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Images</label>
                <input
                  type="text"
                  placeholder="https://example.com/room1.jpg, https://example.com/room2.jpg"
                  value={formData.images}
                  onChange={(e) => setFormData({...formData, images: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingRoom(null);
                    setFormData({
                      type: 'Single',
                      price: '',
                      roomNumber: '',
                      capacity: '',
                      amenities: '',
                      description: '',
                      images: ''
                    });
                  }}
                  className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div key={room._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="h-48 bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
              {room.images && room.images.length > 0 ? (
                <img src={room.images[0]} alt={`${room.type} room`} className="w-full h-full object-cover" />
              ) : (
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                </svg>
              )}
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold">{room.type} - {room.roomNumber}</h3>
                <span className={`px-2 py-1 rounded text-xs ${
                  room.availability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {room.availability ? 'Available' : 'Occupied'}
                </span>
              </div>
              <p className="text-gray-600 mb-2">🏨 {room.hotelId.name}</p>
              <p className="text-gray-700 mb-2">👥 Capacity: {room.capacity}</p>
              <p className="text-green-600 font-bold mb-4">${room.price}/night</p>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(room)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(room._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {rooms.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No rooms found.</p>
        </div>
      )}
    </div>
  );
};

export default AllRooms;