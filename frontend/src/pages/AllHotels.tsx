import React, { useState, useEffect } from 'react';

interface Hotel {
  _id: string;
  name: string;
  location: string;
  description: string;
  amenities: string[];
  images: string[];
  totalRooms: number;
  rating: number;
  managerId: { name: string; email: string };
}

const AllHotels: React.FC = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    amenities: '',
    images: ''
  });

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/hotels', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setHotels(data.hotels);
      }
    } catch (error) {
      console.error('Error fetching hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const amenitiesArray = formData.amenities.split(',').map(a => a.trim()).filter(a => a);
      
      const response = await fetch(`/api/hotels/${editingHotel?._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          amenities: amenitiesArray,
          images: formData.images.split(',').map(img => img.trim()).filter(img => img)
        })
      });

      if (response.ok) {
        fetchHotels();
        setShowForm(false);
        setEditingHotel(null);
        setFormData({ name: '', location: '', description: '', amenities: '', images: '' });
      }
    } catch (error) {
      console.error('Error saving hotel:', error);
    }
  };

  const handleEdit = (hotel: Hotel) => {
    setEditingHotel(hotel);
    setFormData({
      name: hotel.name,
      location: hotel.location,
      description: hotel.description,
      amenities: hotel.amenities.join(', '),
      images: hotel.images?.join(', ') || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this hotel? This will also delete all associated rooms.')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/hotels/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          fetchHotels();
        }
      } catch (error) {
        console.error('Error deleting hotel:', error);
      }
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">All Hotels Management</h1>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Edit Hotel</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Name *</label>
                <input
                  type="text"
                  placeholder="Enter hotel name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                <input
                  type="text"
                  placeholder="Enter hotel location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  placeholder="Enter hotel description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-3 border rounded-lg h-24"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amenities</label>
                <input
                  type="text"
                  placeholder="WiFi, Pool, Gym, Spa (comma separated)"
                  value={formData.amenities}
                  onChange={(e) => setFormData({...formData, amenities: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Images</label>
                <input
                  type="text"
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
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
                    setEditingHotel(null);
                    setFormData({ name: '', location: '', description: '', amenities: '', images: '' });
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
        {hotels.map((hotel) => (
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
              <h3 className="text-xl font-bold mb-2">{hotel.name}</h3>
              <p className="text-gray-600 mb-2">📍 {hotel.location}</p>
              <p className="text-gray-700 mb-2">👤 Manager: {hotel.managerId.name}</p>
              <p className="text-gray-500 text-sm mb-4">{hotel.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Rooms: {hotel.totalRooms}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(hotel)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(hotel._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hotels.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No hotels found.</p>
        </div>
      )}
    </div>
  );
};

export default AllHotels;