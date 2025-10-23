import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const location = useLocation();

  if (!user) return null;

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '🏠' },
    { name: 'Profile', path: '/profile', icon: '👤' },
    ...(user.role === 'admin' ? [
      { name: 'Users', path: '/users', icon: '👥' },
      { name: 'Analytics', path: '/analytics', icon: '📊' },
      { name: 'All Hotels', path: '/all-hotels', icon: '🏨' },
      { name: 'All Rooms', path: '/all-rooms', icon: '🛏️' }
    ] : []),
    ...(user.role === 'manager' ? [
      { name: 'My Hotels', path: '/hotels', icon: '🏨' },
      { name: 'My Rooms', path: '/rooms', icon: '🛏️' },
      { name: 'Booking Requests', path: '/manager-bookings', icon: '📋' }
    ] : []),
    ...(user.role === 'customer' ? [
      { name: 'Search Hotels', path: '/search', icon: '🔍' },
      { name: 'My Bookings', path: '/bookings', icon: '📅' },
      { name: 'Favorites', path: '/favorites', icon: '❤️' }
    ] : [])
  ];

  return (
    <>
      {/* Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={closeSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div className={`w-64 bg-white shadow-lg h-screen fixed left-0 top-16 z-40 transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Menu</h3>
            <button
              onClick={closeSidebar}
              className="text-gray-500 hover:text-gray-700 lg:hidden"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition duration-200 ${
                  location.pathname === item.path
                    ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;