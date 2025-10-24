import React, { useState, useEffect } from 'react';
import SearchFilters from '../components/SearchFilters';
import HotelCard from '../components/HotelCard';
import { mockHotels } from '../utils/mockData';

interface Hotel {
  _id: string;
  name: string;
  location: string;
  description: string;
  rating: number;
  images?: string[];
}

const HotelSearch: React.FC = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchHotels = async (filters: any = {}) => {
    setLoading(true);
    setError('');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      let filteredHotels = [...mockHotels];
      
      // Apply filters
      if (filters.search) {
        filteredHotels = filteredHotels.filter(hotel => 
          hotel.name.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      
      if (filters.location) {
        filteredHotels = filteredHotels.filter(hotel => 
          hotel.location.toLowerCase().includes(filters.location.toLowerCase())
        );
      }
      
      if (filters.minPrice || filters.maxPrice) {
        filteredHotels = filteredHotels.filter(hotel => {
          const minRoomPrice = Math.min(...hotel.rooms.map((room: any) => room.price));
          const maxRoomPrice = Math.max(...hotel.rooms.map((room: any) => room.price));
          
          if (filters.minPrice && minRoomPrice < parseInt(filters.minPrice)) return false;
          if (filters.maxPrice && maxRoomPrice > parseInt(filters.maxPrice)) return false;
          
          return true;
        });
      }
      
      if (filters.roomType) {
        filteredHotels = filteredHotels.filter(hotel => 
          hotel.rooms.some((room: any) => room.type === filters.roomType)
        );
      }
      
      setHotels(filteredHotels);
    } catch (err) {
      setError('Error fetching hotels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Search Hotels</h1>
        
        <SearchFilters onSearch={fetchHotels} />
        
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map(hotel => (
            <HotelCard key={hotel._id} hotel={hotel} />
          ))}
        </div>
        
        {!loading && hotels.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hotels found. Try adjusting your search criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelSearch;