import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            <div className="w-32 h-32 bg-white rounded-full p-4 shadow-2xl mx-auto mb-8 animate-bounce">
              <img 
                src="/logo.png.png" 
                alt="HotelEase Logo" 
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                HotelEase
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-4xl mx-auto leading-relaxed animate-slide-up">
              Discover extraordinary stays around the world. From luxury resorts to cozy boutique hotels, 
              find your perfect escape with just a few clicks.
            </p>
            
            {!user ? (
              <div className="flex flex-col sm:flex-row gap-6 justify-center animate-pulse">
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-10 py-5 rounded-full text-xl font-bold hover:from-yellow-300 hover:to-orange-400 transform hover:scale-105 transition duration-300 shadow-2xl"
                >
                  Start Your Journey
                </Link>
                <Link
                  to="/login"
                  className="bg-white/10 backdrop-blur-sm text-white px-10 py-5 rounded-full text-xl font-semibold hover:bg-white/20 border-2 border-white/30 hover:border-white/50 transform hover:scale-105 transition duration-300 shadow-2xl"
                >
                  Sign In
                </Link>
              </div>
            ) : (
              <Link
                to="/dashboard"
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-10 py-5 rounded-full text-xl font-bold hover:from-yellow-300 hover:to-orange-400 transform hover:scale-105 transition duration-300 shadow-2xl inline-block"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose HotelEase?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Experience the difference with our premium booking platform</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="group bg-white p-10 rounded-2xl shadow-xl hover:shadow-2xl transition duration-500 transform hover:-translate-y-3 animate-fade-in-up opacity-0" style={{animationDelay: '0.2s', animationFillMode: 'forwards'}}>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition duration-300">Smart Search</h3>
              <p className="text-gray-600 text-lg leading-relaxed">AI-powered search finds your ideal hotel based on preferences, budget, and location with lightning speed.</p>
            </div>

            <div className="group bg-white p-10 rounded-2xl shadow-xl hover:shadow-2xl transition duration-500 transform hover:-translate-y-3 animate-fade-in-up opacity-0" style={{animationDelay: '0.4s', animationFillMode: 'forwards'}}>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition duration-300">Bank-Level Security</h3>
              <p className="text-gray-600 text-lg leading-relaxed">Your data and payments are protected with enterprise-grade encryption and fraud detection.</p>
            </div>

            <div className="group bg-white p-10 rounded-2xl shadow-xl hover:shadow-2xl transition duration-500 transform hover:-translate-y-3 animate-fade-in-up opacity-0" style={{animationDelay: '0.6s', animationFillMode: 'forwards'}}>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition duration-300">VIP Support</h3>
              <p className="text-gray-600 text-lg leading-relaxed">Dedicated concierge service available 24/7 to ensure your travel experience is flawless.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="animate-fade-in-up opacity-0" style={{animationDelay: '0.1s', animationFillMode: 'forwards'}}>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2 hover:scale-110 transition duration-300 cursor-default">10M+</div>
              <div className="text-blue-100 text-lg">Happy Travelers</div>
            </div>
            <div className="animate-fade-in-up opacity-0" style={{animationDelay: '0.2s', animationFillMode: 'forwards'}}>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2 hover:scale-110 transition duration-300 cursor-default">50K+</div>
              <div className="text-blue-100 text-lg">Premium Hotels</div>
            </div>
            <div className="animate-fade-in-up opacity-0" style={{animationDelay: '0.3s', animationFillMode: 'forwards'}}>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2 hover:scale-110 transition duration-300 cursor-default">200+</div>
              <div className="text-blue-100 text-lg">Countries</div>
            </div>
            <div className="animate-fade-in-up opacity-0" style={{animationDelay: '0.4s', animationFillMode: 'forwards'}}>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2 hover:scale-110 transition duration-300 cursor-default">99.9%</div>
              <div className="text-blue-100 text-lg">Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready for Your Next Adventure?</h2>
          <p className="text-xl text-gray-300 mb-10">Join millions of travelers who trust HotelEase for their perfect stays</p>
          {!user && (
            <Link
              to="/register"
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-12 py-6 rounded-full text-xl font-bold hover:from-yellow-300 hover:to-orange-400 transform hover:scale-105 transition duration-300 shadow-2xl inline-block"
            >
              Get Started Today
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;