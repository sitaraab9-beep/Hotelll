import React from 'react';
import { Link } from 'react-router-dom';

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
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-48 bg-gray-200 flex items-center justify-center">
        <span className="text-gray-500">Hotel Image</span>
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