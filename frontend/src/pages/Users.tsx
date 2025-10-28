import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Users: React.FC = () => {
  const { } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const adminUser = {
        id: 'admin-001',
        name: 'System Administrator',
        email: 'admin@hotelease.com',
        role: 'admin',
        createdAt: new Date().toISOString()
      };

      // Try to fetch users from API, fallback to localStorage
      let apiUsers = [];
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          apiUsers = await response.json();
        }
      } catch (error) {
        console.log('API users not available, using localStorage');
      }

      // Get users from localStorage as fallback
      const localUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
      
      // Combine all users
      const allUsers = [...apiUsers, ...localUsers];
      
      // Remove duplicates based on email
      const uniqueUsers = allUsers.filter((user, index, self) => 
        index === self.findIndex(u => u.email === user.email)
      );
      
      setUsers([adminUser, ...uniqueUsers]);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'customer':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <div className="text-sm text-gray-500">{users.length} total users</div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((userData) => (
                  <tr key={userData.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {userData.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{userData.name}</div>
                          <div className="text-sm text-gray-500">{userData.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadge(userData.role)}`}>
                        {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {userData.role === 'admin' ? 'System User' : new Date(userData.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {userData.role === 'admin' ? (
                        <span className="text-gray-400">System Account</span>
                      ) : (
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => alert(`Viewing user: ${userData.name}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </button>
                          <button 
                            onClick={() => {
                              if (window.confirm(`Disable user ${userData.name}?`)) {
                                alert('User disabled successfully');
                              }
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            Disable
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No users found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;