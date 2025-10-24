import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Hotel {
  _id: string;
  name: string;
  location: string;
  description: string;
  rating: number;
  images?: string[];
}

interface HotelCardProps {
  hotel: Hotel;
}

const HotelCard: React.FC<HotelCardProps> = ({ hotel }) => {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (user) {
      const { getFavorites } = require('../utils/mockData');
      const favorites = getFavorites(user.id);
      setIsFavorite(favorites.some((fav: any) => fav.hotelId === hotel._id));
    }
  }, [user, hotel._id]);

  const toggleFavorite = async () => {
    if (!user) return;
    
    const { toggleFavorite: toggleFav } = await import('../utils/mockData');
    const result = toggleFav(user.id, hotel._id, hotel.name, hotel.location);
    setIsFavorite(result.isFavorite);
    
    if (result.isFavorite) {
      alert('❤️ Added to favorites!');
    } else {
      alert('💔 Removed from favorites!');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-48 bg-gray-200 flex items-center justify-center relative">
        <span className="text-gray-500">Hotel Image</span>
        {user && (
          <button
            onClick={toggleFavorite}
            className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
              isFavorite ? 'text-red-500 bg-white' : 'text-gray-400 bg-white hover:text-red-500'
            }`}
          >
            <svg className="w-6 h-6" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{hotel.name}</h3>
        <p className="text-gray-600 mb-2">{hotel.location}</p>
        <p className="text-gray-700 text-sm mb-3 line-clamp-2">{hotel.description}</p>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-yellow-500">★</span>
            <span className="ml-1 text-sm">{hotel.rating || 'New'}</span>
          </div>
          <Link
            to={`/hotels/${hotel._id}`}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;