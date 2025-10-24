export let mockHotels: any[] = [
  {
    _id: 'hotel1',
    name: 'Sample Hotel',
    location: 'New York',
    description: 'A sample hotel for testing',
    amenities: ['WiFi', 'Pool'],
    rating: 4.5,
    managerId: 'sample',
    rooms: []
  }
];

export let mockBookings: any[] = [];

export let mockFavorites: any[] = [];

export const addHotel = (hotel: any) => {
  mockHotels.push(hotel);
};

export const getHotelsByManager = (managerId: string) => {
  return mockHotels.filter(hotel => hotel.managerId === managerId);
};

export const addBooking = (booking: any) => {
  mockBookings.push(booking);
};

export const getBookingsByCustomer = (customerId: string) => {
  return mockBookings.filter(booking => booking.customerId === customerId);
};

export const getBookingsByManager = (managerId: string) => {
  const managerHotels = getHotelsByManager(managerId);
  const hotelIds = managerHotels.map(hotel => hotel._id);
  return mockBookings.filter(booking => hotelIds.includes(booking.hotelId._id));
};

export const updateBookingStatus = (bookingId: string, status: string) => {
  const index = mockBookings.findIndex(b => b._id === bookingId);
  if (index !== -1) {
    mockBookings[index].status = status;
  }
};

export const getFavorites = (userId: string) => {
  return mockFavorites.filter(fav => fav.userId === userId);
};

export const toggleFavorite = (userId: string, hotelId: string, hotelName: string, hotelLocation: string) => {
  const existingIndex = mockFavorites.findIndex(fav => fav.userId === userId && fav.hotelId === hotelId);
  
  if (existingIndex > -1) {
    mockFavorites.splice(existingIndex, 1);
    return { isFavorite: false };
  } else {
    mockFavorites.push({
      _id: 'fav' + Date.now(),
      userId,
      hotelId,
      hotelName,
      hotelLocation,
      createdAt: new Date().toISOString()
    });
    return { isFavorite: true };
  }
};

export const addRoom = (room: any) => {
  const hotel = mockHotels.find(h => h._id === room.hotelId);
  if (hotel) {
    if (!hotel.rooms) hotel.rooms = [];
    hotel.rooms.push(room);
  }
};

export const updateRoom = (roomId: string, roomData: any) => {
  for (const hotel of mockHotels) {
    if (hotel.rooms) {
      const roomIndex = hotel.rooms.findIndex((r: any) => r._id === roomId);
      if (roomIndex !== -1) {
        hotel.rooms[roomIndex] = { ...hotel.rooms[roomIndex], ...roomData };
        return;
      }
    }
  }
};

export const deleteRoom = (roomId: string) => {
  for (const hotel of mockHotels) {
    if (hotel.rooms) {
      const roomIndex = hotel.rooms.findIndex((r: any) => r._id === roomId);
      if (roomIndex !== -1) {
        hotel.rooms.splice(roomIndex, 1);
        return;
      }
    }
  }
};

export const getRoomsByManager = (managerId: string) => {
  const managerHotels = getHotelsByManager(managerId);
  const allRooms: any[] = [];
  
  managerHotels.forEach(hotel => {
    if (hotel.rooms) {
      hotel.rooms.forEach((room: any) => {
        allRooms.push({
          ...room,
          hotelId: hotel._id,
          hotelName: hotel.name
        });
      });
    }
  });
  
  return allRooms;
};