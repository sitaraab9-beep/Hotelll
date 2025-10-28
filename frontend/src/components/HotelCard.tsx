import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';

interface Hotel {
  _id: string;
  name: string;
  location: string;
  description: string;
  rating: number;
  imageUrl?: string;
  images?: string[];
}

interface HotelCardProps {
  hotel: Hotel;
}

const HotelCard: React.FC<HotelCardProps> = ({ hotel }) => {
  const { user } = useAuth();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) return;
    
    if (isFavorite(hotel._id)) {
      removeFavorite(hotel._id);
      alert('💔 Removed from favorites!');
    } else {
      addFavorite(hotel._id);
      alert('❤️ Added to favorites!');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-48 bg-gray-200 flex items-center justify-center relative overflow-hidden">
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
        <span className={`text-gray-500 ${hotel.imageUrl ? 'hidden' : ''}`}>Hotel Image</span>
        {user && (
          <button
            onClick={toggleFavorite}
            className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
              isFavorite(hotel._id) ? 'text-red-500 bg-white' : 'text-gray-400 bg-white hover:text-red-500'
            }`}
          >
            <svg className="w-6 h-6" fill={isFavorite(hotel._id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
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