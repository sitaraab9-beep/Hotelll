import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const renderDashboardContent = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminDashboard />;

      case 'manager':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-8 rounded-2xl shadow-2xl">
              <h2 className="text-3xl font-bold mb-3">Manager Dashboard</h2>
              <p className="text-green-100 text-lg">Your property management command center</p>
            </div>
          </div>
        );

      case 'customer':
      default:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-8 rounded-2xl shadow-2xl">
              <h2 className="text-3xl font-bold mb-3">Customer Dashboard</h2>
              <p className="text-blue-100 text-lg">Your gateway to extraordinary experiences</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {user?.role === 'admin' ? 'Manage your entire platform from here' : 
             user?.role === 'manager' ? 'Oversee your properties and bookings' : 
             'Discover amazing hotels and manage your trips'}
          </p>
        </div>
        
        {renderDashboardContent()}
      </div>
    </div>
  );
};

export default Dashboard;