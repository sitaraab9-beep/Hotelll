import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface Booking {
  _id: string;
  roomId: string;
  hotelId: string;
  hotelName: string;
  roomNumber: string;
  roomType: string;
  roomPrice: number;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: string;
  guests: number;
  specialRequests?: string;
  createdAt: string;
  customerName?: string;
  customerEmail?: string;
}

const Bookings: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchBookings = async () => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (err) {
      setError('Error fetching bookings');
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'cancelled' })
      });
      
      if (response.ok) {
        setBookings(prev => prev.map(booking => 
          booking._id === bookingId 
            ? { ...booking, status: 'cancelled' }
            : booking
        ));
        alert('Booking cancelled successfully');
      }
    } catch (err) {
      alert('Error cancelling booking');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const generateQRCode = (bookingId: string) => {
    // Simple QR code placeholder - in real app would use QR library
    return `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=Booking-${bookingId}`;
  };

  const downloadTicket = (booking: any) => {
    const qrCodeUrl = generateQRCode(booking._id);
    
    const ticketHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>HotelEase Booking Ticket</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
            .ticket { background: white; border: 2px solid #2563eb; border-radius: 10px; padding: 30px; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { text-align: center; border-bottom: 2px dashed #2563eb; padding-bottom: 20px; margin-bottom: 20px; }
            .title { color: #2563eb; font-size: 28px; font-weight: bold; margin: 0; }
            .subtitle { color: #059669; font-size: 18px; margin: 5px 0; }
            .confirmed { background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold; }
            .section { margin: 20px 0; }
            .section-title { color: #1f2937; font-size: 16px; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
            .detail { margin: 8px 0; display: flex; justify-content: space-between; }
            .label { font-weight: bold; color: #374151; }
            .value { color: #1f2937; }
            .price { color: #059669; font-size: 20px; font-weight: bold; }
            .qr-section { text-align: center; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; }
            .booking-id { background: #eff6ff; padding: 10px; border-radius: 5px; font-family: monospace; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="ticket">
            <div class="header">
                <h1 class="title">🏨 HOTELEASE</h1>
                <p class="subtitle">BOOKING CONFIRMATION TICKET</p>
                <div class="confirmed">✅ BOOKING CONFIRMED</div>
            </div>
            
            <div class="section">
                <div class="booking-id">
                    <strong>Booking ID:</strong> ${booking._id}
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">👤 CUSTOMER DETAILS</div>
                <div class="detail"><span class="label">Name:</span><span class="value">${booking.customerName || user?.name || 'N/A'}</span></div>
                <div class="detail"><span class="label">Email:</span><span class="value">${booking.customerEmail || user?.email || 'N/A'}</span></div>
            </div>
            
            <div class="section">
                <div class="section-title">🏨 HOTEL DETAILS</div>
                <div class="detail"><span class="label">Hotel Name:</span><span class="value">${booking.hotelName}</span></div>
                <div class="detail"><span class="label">Room Number:</span><span class="value">${booking.roomNumber}</span></div>
                <div class="detail"><span class="label">Room Type:</span><span class="value">${booking.roomType}</span></div>
            </div>
            
            <div class="section">
                <div class="section-title">📅 BOOKING DETAILS</div>
                <div class="detail"><span class="label">Check-in Date:</span><span class="value">${new Date(booking.checkIn).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
                <div class="detail"><span class="label">Check-out Date:</span><span class="value">${new Date(booking.checkOut).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
                <div class="detail"><span class="label">Number of Guests:</span><span class="value">${booking.guests}</span></div>
                <div class="detail"><span class="label">Special Requests:</span><span class="value">${booking.specialRequests || 'None'}</span></div>
            </div>
            
            <div class="section">
                <div class="section-title">💰 PAYMENT DETAILS</div>
                <div class="detail"><span class="label">Room Rate per Night:</span><span class="value">₹${booking.roomPrice}</span></div>
                <div class="detail"><span class="label">Total Amount:</span><span class="price">₹${booking.totalPrice}</span></div>
            </div>
            
            <div class="qr-section">
                <p><strong>Scan QR Code at Hotel:</strong></p>
                <img src="${qrCodeUrl}" alt="QR Code" style="border: 1px solid #ccc; padding: 10px;">
            </div>
            
            <div class="footer">
                <p><strong>Booking Date:</strong> ${new Date(booking.createdAt).toLocaleDateString('en-IN')}</p>
                <p>Thank you for choosing HotelEase! 🎉</p>
                <p>For support: <strong>support@hotelease.com</strong> | Phone: +91-1234567890</p>
                <p style="margin-top: 15px; font-size: 12px;">Please present this ticket at the hotel reception during check-in.</p>
            </div>
        </div>
    </body>
    </html>
    `;
    
    const blob = new Blob([ticketHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HotelEase-Ticket-${booking._id}.html`;
    a.click();
    URL.revokeObjectURL(url);
    
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(ticketHTML);
      newWindow.document.close();
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {bookings.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-gray-600 text-lg">No bookings found.</p>
            <p className="text-gray-500 mt-2">Start exploring hotels to make your first booking!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map(booking => (
              <div key={booking._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">{booking.hotelName}</h3>
                      <p className="text-gray-600">📍 Hotel Location</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Room</p>
                      <p className="font-medium">{booking.roomType} - {booking.roomNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Check-in</p>
                      <p className="font-medium">{new Date(booking.checkIn).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Check-out</p>
                      <p className="font-medium">{new Date(booking.checkOut).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Guests</p>
                      <p className="font-medium">{booking.guests}</p>
                    </div>
                  </div>
                  
                  {booking.specialRequests && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Special Requests</p>
                      <p className="text-gray-700">{booking.specialRequests}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div>
                      <p className="text-sm text-gray-500">Total Price</p>
                      <p className="text-2xl font-bold text-green-600">₹{booking.totalPrice}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => downloadTicket(booking)}
                          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                        >
                          📄 Download PDF Ticket
                        </button>
                      )}
                      {(booking.status === 'pending' || booking.status === 'confirmed') && (
                        <button
                          onClick={() => cancelBooking(booking._id)}
                          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">
                      Booked on {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;