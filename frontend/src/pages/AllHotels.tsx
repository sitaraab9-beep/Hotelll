import React, { useState, useEffect } from 'react';

const AllHotels: React.FC = () => {
  const [hotels, setHotels] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  const [editingHotel, setEditingHotel] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    amenities: '',
    imageUrl: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (hotel: any) => {
    setEditingHotel(hotel);
    setFormData({
      name: hotel.name,
      location: hotel.location,
      description: hotel.description,
      amenities: hotel.amenities.join(', '),
      imageUrl: hotel.imageUrl || ''
    });
    setShowEditModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const hotelData = {
      ...formData,
      amenities: formData.amenities.split(',').map((a: string) => a.trim()).filter((a: string) => a)
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/hotels/${editingHotel._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(hotelData)
      });
      
      if (response.ok) {
        fetchData();
        setShowEditModal(false);
        setEditingHotel(null);
        setFormData({ name: '', location: '', description: '', amenities: '', imageUrl: '' });
        alert('Hotel updated successfully!');
      } else {
        alert('Error updating hotel');
      }
    } catch (error) {
      console.error('Error updating hotel:', error);
      alert('Error updating hotel');
    }
  };

  const handleDelete = async (hotelId: string, hotelName: string) => {
    if (window.confirm(`Delete hotel ${hotelName}? This will hide it from managers and customers.`)) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/hotels/${hotelId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          alert('Hotel deleted successfully');
          fetchData();
        } else {
          alert('Error deleting hotel');
        }
      } catch (error) {
        console.error('Error deleting hotel:', error);
        alert('Error deleting hotel');
      }
    }
  };

  const handleRestore = async (hotelId: string) => {
    if (window.confirm('Restore this hotel? It will be visible to managers and customers again.')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/hotels/${hotelId}/restore`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          alert('Hotel restored successfully');
          fetchData();
        } else {
          alert('Error restoring hotel');
        }
      } catch (error) {
        console.error('Error restoring hotel:', error);
        alert('Error restoring hotel');
      }
    }
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch hotels with admin token to see all hotels including deleted
      const hotelsResponse = await fetch('/api/hotels', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (hotelsResponse.ok) {
        const hotelsData = await hotelsResponse.json();
        setHotels(hotelsData);
      }

      // Fetch rooms
      const roomsResponse = await fetch('/api/rooms');
      if (roomsResponse.ok) {
        const roomsData = await roomsResponse.json();
        setRooms(roomsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">All Hotels Management</h1>
          <div className="text-sm text-gray-500">{hotels.length} total hotels</div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hotel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rooms
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {hotels.map((hotel) => {
                  const hotelRooms = rooms.filter(room => room.hotelId === hotel._id);
                  return (
                    <tr key={hotel._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-semibold">🏨</span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{hotel.name}</div>
                            <div className="text-sm text-gray-500">{hotel.description?.substring(0, 50)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {hotel.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm text-gray-600">{hotel.rating || 4.0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {hotelRooms.length} rooms
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => {
                              setSelectedHotel(hotel);
                              setShowModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </button>
                          <button 
                            onClick={() => handleEdit(hotel)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Edit
                          </button>
                          {hotel.isDeleted ? (
                            <button 
                              onClick={() => handleRestore(hotel._id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Restore
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleDelete(hotel._id, hotel.name)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {hotels.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No hotels found.</p>
          </div>
        )}
      </div>

      {/* Hotel Details Modal */}
      {showModal && selectedHotel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{selectedHotel.name}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            {selectedHotel.imageUrl && (
              <img 
                src={selectedHotel.imageUrl} 
                alt={selectedHotel.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            
            <div className="space-y-3">
              <p><strong>Location:</strong> {selectedHotel.location}</p>
              <p><strong>Description:</strong> {selectedHotel.description}</p>
              <p><strong>Rating:</strong> ⭐ {selectedHotel.rating || 4.0}</p>
              <p><strong>Total Rooms:</strong> {rooms.filter(r => r.hotelId === selectedHotel._id).length}</p>
              <p><strong>Status:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-sm ${
                  selectedHotel.isDeleted ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {selectedHotel.isDeleted ? 'Deleted' : 'Active'}
                </span>
              </p>
              {selectedHotel.amenities && selectedHotel.amenities.length > 0 && (
                <div>
                  <strong>Amenities:</strong>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedHotel.amenities.map((amenity: string, index: number) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Hotel Modal */}
      {showEditModal && editingHotel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Edit Hotel</h2>
            
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
              </div>
              
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Update Hotel
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
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
  );
};

export default AllHotels;