import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

interface Hotel {
  _id: string;
  name: string;
  location: string;
  description: string;
  amenities: string[];
  rating: number;
  imageUrl?: string;
  managerId?: string;
  rooms?: any[];
}

const Hotels: React.FC = () => {
  const { user } = useAuth();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    amenities: '',
    imageUrl: ''
  });

  const fetchHotels = useCallback(async () => {
    if (!user) return;
    
    try {
      const { mockHotels, getHotelsByManager } = await import('../utils/mockData');
      
      if (user.role === 'manager') {
        const managerHotels = getHotelsByManager(user.id);
        setHotels(managerHotels);
      } else {
        setHotels(mockHotels);
      }
    } catch (error) {
      console.error('Error fetching hotels:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    const hotelData = {
      ...formData,
      amenities: formData.amenities.split(',').map((a: string) => a.trim()).filter((a: string) => a),
      rating: 4.0,
      managerId: user.id,
      rooms: []
    };

    try {
      const { addHotel } = await import('../utils/mockData');
      
      if (editingHotel) {
        // Update hotel in mock data
        const { mockHotels } = await import('../utils/mockData');
        const index = mockHotels.findIndex((h: any) => h._id === editingHotel._id);
        if (index !== -1) {
          mockHotels[index] = { ...mockHotels[index], ...hotelData };
        }
      } else {
        // Add new hotel to mock data
        const newHotel = {
          _id: Date.now().toString(),
          ...hotelData
        };
        addHotel(newHotel);
      }
      
      // Refresh hotels list
      fetchHotels();
      
      setShowModal(false);
      setEditingHotel(null);
      setFormData({ name: '', location: '', description: '', amenities: '', imageUrl: '' });
      
      alert(editingHotel ? 'Hotel updated successfully!' : 'Hotel added successfully!');
    } catch (error) {
      console.error('Error saving hotel:', error);
      alert('Error saving hotel');
    }
  };

  const handleEdit = (hotel: Hotel) => {
    setEditingHotel(hotel);
    setFormData({
      name: hotel.name,
      location: hotel.location,
      description: hotel.description,
      amenities: hotel.amenities.join(', '),
      imageUrl: hotel.imageUrl || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this hotel?')) {
      try {
        const { mockHotels } = await import('../utils/mockData');
        const index = mockHotels.findIndex((h: any) => h._id === id);
        if (index !== -1) {
          mockHotels.splice(index, 1);
        }
        
        // Refresh hotels list
        fetchHotels();
        alert('Hotel deleted successfully!');
      } catch (error) {
        console.error('Error deleting hotel:', error);
        alert('Error deleting hotel');
      }
    }
  };

  const openAddModal = () => {
    setEditingHotel(null);
    setFormData({ name: '', location: '', description: '', amenities: '', imageUrl: '' });
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Hotels</h1>
          <button
            onClick={openAddModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add New Hotel
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map(hotel => (
            <div key={hotel._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center overflow-hidden">
                {hotel.imageUrl ? (
                  <img 
                    src={hotel.imageUrl} 
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <span className={`text-white text-lg font-semibold ${hotel.imageUrl ? 'hidden' : ''}`}>Hotel Image</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{hotel.name}</h3>
                <p className="text-gray-600 mb-2">📍 {hotel.location}</p>
                <p className="text-gray-700 text-sm mb-3 line-clamp-2">{hotel.description}</p>
                
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <span className="text-yellow-500">⭐</span>
                    <span className="ml-1 text-sm">{hotel.rating}</span>
                  </div>
                  
                  {hotel.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {hotel.amenities.slice(0, 3).map((amenity: string, index: number) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {amenity}
                        </span>
                      ))}
                      {hotel.amenities.length > 3 && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                          +{hotel.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(hotel)}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(hotel._id)}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {hotels.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No hotels found. Add your first hotel!</p>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4">
                {editingHotel ? 'Edit Hotel' : 'Add New Hotel'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Hotel Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    rows={3}
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
                    placeholder="WiFi, Pool, Gym, Restaurant"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Hotel Image URL</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/hotel-image.jpg"
                  />
                  {formData.imageUrl && (
                    <div className="mt-2">
                      <img 
                        src={formData.imageUrl} 
                        alt="Preview" 
                        className="w-full h-32 object-cover rounded"
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
                    {editingHotel ? 'Update Hotel' : 'Add Hotel'}
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

export default Hotels;