import React, { useState, useEffect } from 'react';

const AllRooms: React.FC = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [modalType, setModalType] = useState<'view' | 'edit'>('view');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/rooms', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (response.ok) {
        const data = await response.json();
        setRooms(data);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
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

  const handleDelete = async (roomId: string, roomNumber: string, hotelName: string) => {
    if (window.confirm(`Delete Room ${roomNumber} from ${hotelName}?`)) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/rooms/${roomId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          alert('Room deleted successfully');
          fetchRooms();
        } else {
          alert('Error deleting room');
        }
      } catch (error) {
        console.error('Error deleting room:', error);
        alert('Error deleting room');
      }
    }
  };

  const handleView = (room: any) => {
    setSelectedRoom(room);
    setModalType('view');
    setShowModal(true);
  };

  const handleEdit = (room: any) => {
    setSelectedRoom(room);
    setModalType('edit');
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/rooms/${selectedRoom._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(selectedRoom)
      });
      
      if (response.ok) {
        alert('Room updated successfully');
        setShowModal(false);
        fetchRooms();
      }
    } catch (error) {
      console.error('Error updating room:', error);
    }
  };

  const handleRestore = async (roomId: string) => {
    if (window.confirm('Restore this room? It will be available for booking again.')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/rooms/${roomId}/restore`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          alert('Room restored successfully');
          fetchRooms();
        } else {
          alert('Error restoring room');
        }
      } catch (error) {
        console.error('Error restoring room:', error);
        alert('Error restoring room');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">All Rooms Management</h1>
          <div className="text-sm text-gray-500">{rooms.length} total rooms</div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hotel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rooms.map((room) => (
                  <tr key={room._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <span className="text-green-600 font-semibold">🛏️</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">Room {room.roomNumber}</div>
                          <div className="text-sm text-gray-500">Capacity: {room.capacity} guests</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {room.hotelName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {room.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{room.price}/night
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        room.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {room.isAvailable ? 'Available' : 'Occupied'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleView(room)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => handleEdit(room)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Edit
                        </button>
                        {room.isDeleted ? (
                          <button 
                            onClick={() => handleRestore(room._id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Restore
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleDelete(room._id, room.roomNumber, room.hotelName)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {rooms.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No rooms found.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">
              {modalType === 'view' ? 'Room Details' : 'Edit Room'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Room Number</label>
                <input
                  type="text"
                  value={selectedRoom.roomNumber}
                  onChange={(e) => setSelectedRoom({...selectedRoom, roomNumber: e.target.value})}
                  disabled={modalType === 'view'}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <input
                  type="text"
                  value={selectedRoom.type}
                  onChange={(e) => setSelectedRoom({...selectedRoom, type: e.target.value})}
                  disabled={modalType === 'view'}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <input
                  type="number"
                  value={selectedRoom.price}
                  onChange={(e) => setSelectedRoom({...selectedRoom, price: Number(e.target.value)})}
                  disabled={modalType === 'view'}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Capacity</label>
                <input
                  type="number"
                  value={selectedRoom.capacity}
                  onChange={(e) => setSelectedRoom({...selectedRoom, capacity: Number(e.target.value)})}
                  disabled={modalType === 'view'}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Hotel</label>
                <input
                  type="text"
                  value={selectedRoom.hotelName}
                  disabled
                  className="w-full p-2 border rounded bg-gray-100"
                />
              </div>
            </div>
            
            <div className="flex gap-4 mt-6">
              {modalType === 'edit' && (
                <button
                  onClick={handleSave}
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  Save
                </button>
              )}
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
              >
                {modalType === 'view' ? 'Close' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllRooms;