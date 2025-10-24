export const mockHotels = [
  {
    _id: '1',
    name: 'Grand Plaza Hotel',
    location: 'New York, USA',
    description: 'Luxury hotel in the heart of Manhattan with stunning city views.',
    rating: 4.5,
    amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Spa'],
    rooms: [
      {
        _id: '101',
        roomNumber: '101',
        type: 'single',
        price: 150,
        capacity: 1,
        amenities: ['WiFi', 'TV', 'AC'],
        isAvailable: true
      },
      {
        _id: '102',
        roomNumber: '102',
        type: 'double',
        price: 200,
        capacity: 2,
        amenities: ['WiFi', 'TV', 'AC', 'Mini Bar'],
        isAvailable: true
      },
      {
        _id: '103',
        roomNumber: '103',
        type: 'suite',
        price: 350,
        capacity: 4,
        amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony'],
        isAvailable: true
      }
    ]
  },
  {
    _id: '2',
    name: 'Ocean View Resort',
    location: 'Miami, USA',
    description: 'Beautiful beachfront resort with ocean views and tropical gardens.',
    rating: 4.3,
    amenities: ['WiFi', 'Beach Access', 'Pool', 'Restaurant', 'Bar'],
    rooms: [
      {
        _id: '201',
        roomNumber: '201',
        type: 'double',
        price: 180,
        capacity: 2,
        amenities: ['WiFi', 'TV', 'AC', 'Ocean View'],
        isAvailable: true
      },
      {
        _id: '202',
        roomNumber: '202',
        type: 'suite',
        price: 400,
        capacity: 4,
        amenities: ['WiFi', 'TV', 'AC', 'Ocean View', 'Balcony'],
        isAvailable: true
      }
    ]
  },
  {
    _id: '3',
    name: 'Mountain Lodge',
    location: 'Denver, USA',
    description: 'Cozy mountain lodge perfect for outdoor enthusiasts.',
    rating: 4.1,
    amenities: ['WiFi', 'Fireplace', 'Hiking Trails', 'Restaurant'],
    rooms: [
      {
        _id: '301',
        roomNumber: '301',
        type: 'single',
        price: 120,
        capacity: 1,
        amenities: ['WiFi', 'TV', 'Fireplace'],
        isAvailable: true
      },
      {
        _id: '302',
        roomNumber: '302',
        type: 'deluxe',
        price: 280,
        capacity: 2,
        amenities: ['WiFi', 'TV', 'Fireplace', 'Mountain View'],
        isAvailable: true
      }
    ]
  }
];

export let mockBookings = [
  {
    _id: 'b1',
    customerId: '1',
    customerName: 'Demo User',
    customerEmail: 'demo@example.com',
    roomId: {
      _id: '101',
      roomNumber: '101',
      type: 'single',
      price: 150
    },
    hotelId: {
      _id: '1',
      name: 'Grand Plaza Hotel',
      location: 'New York, USA'
    },
    checkIn: '2024-01-15',
    checkOut: '2024-01-18',
    totalPrice: 450,
    status: 'approved',
    guests: 1,
    specialRequests: 'Late check-in',
    createdAt: '2024-01-10'
  },
  {
    _id: 'b2',
    customerId: '1',
    customerName: 'Demo User',
    customerEmail: 'demo@example.com',
    roomId: {
      _id: '201',
      roomNumber: '201',
      type: 'double',
      price: 180
    },
    hotelId: {
      _id: '2',
      name: 'Ocean View Resort',
      location: 'Miami, USA'
    },
    checkIn: '2024-02-10',
    checkOut: '2024-02-14',
    totalPrice: 720,
    status: 'pending',
    guests: 2,
    createdAt: '2024-02-05'
  }
];

export let mockFavorites = ['1'];

export const addBooking = (booking: any) => {
  mockBookings.push(booking);
};

export const updateBookingStatus = (bookingId: string, status: string) => {
  const index = mockBookings.findIndex(b => b._id === bookingId);
  if (index !== -1) {
    mockBookings[index].status = status;
  }
};

export const toggleFavorite = (hotelId: string) => {
  const index = mockFavorites.indexOf(hotelId);
  if (index > -1) {
    mockFavorites.splice(index, 1);
  } else {
    mockFavorites.push(hotelId);
  }
  return mockFavorites.includes(hotelId);
};