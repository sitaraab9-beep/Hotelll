import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';

const Favorites: React.FC = () => {
  const { user } = useAuth();
  const { favorites, removeFavorite } = useFavorites();
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavoriteHotels();
  }, [favorites, user]);

  const fetchFavoriteHotels = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    if (favorites.length === 0) {
      setHotels([]);
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/api/hotels');
      if (response.ok) {
        const allHotels = await response.json();
        const favoriteHotels = allHotels.filter((hotel: any) => favorites.includes(hotel._id));
        setHotels(favoriteHotels);
      }
    } catch (error) {
      console.error('Error fetching favorite hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (hotelId: string) => {
    if (!user) return;
    
    try {
      removeFavorite(hotelId);
      alert('💔 Removed from favorites!');
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">My Favorite Hotels</h1>
      
      {hotels.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No favorite hotels yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map((hotel) => (
            <div key={hotel._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                {hotel.imageUrl ? (
                  <img src={hotel.imageUrl} alt={hotel.name} className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold">{hotel.name}</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm text-gray-600">{hotel.rating || 4.0}</span>
                    </div>
                    <svg className="w-6 h-6 text-red-500" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-gray-600 mb-2">📍 {hotel.location}</p>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{hotel.description}</p>
                
                <button
                  onClick={() => handleRemoveFavorite(hotel._id)}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition duration-200"
                >
                  Remove from Favorites
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;