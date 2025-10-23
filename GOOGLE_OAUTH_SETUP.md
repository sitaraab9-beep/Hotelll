# Google OAuth Setup Instructions

## 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized origins:
     - `http://localhost:3000` (for development)
     - Your production domain (when deploying)
   - Add authorized redirect URIs:
     - `http://localhost:3000` (for development)

## 2. Update Environment Variables

### Backend (.env)
```
GOOGLE_CLIENT_ID=your_actual_google_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret_here
```

### Frontend (.env)
```
REACT_APP_GOOGLE_CLIENT_ID=your_actual_google_client_id_here
```

## 3. Test the Integration

1. Start your backend server:
   ```bash
   cd backend && npm run dev
   ```

2. Start your frontend server:
   ```bash
   cd frontend && npm start
   ```

3. Go to http://localhost:3000/login
4. Click "Sign in with Google"
5. Complete the Google OAuth flow

## Features Implemented

- ✅ Google OAuth 2.0 integration
- ✅ Automatic user creation for new Google users
- ✅ JWT token generation after Google login
- ✅ Secure token verification on backend
- ✅ Role-based access (Google users default to 'customer' role)
- ✅ Fallback manual Google sign-in button

## Security Notes

- Google tokens are verified server-side using Google's official library
- Users created via Google login get a random password (they can't use regular login)
- All Google users default to 'customer' role for security
- JWT tokens are generated after successful Google verification