# HotelEase Vercel Deployment Guide

## Prerequisites
1. Vercel account (https://vercel.com)
2. MongoDB Atlas account (https://cloud.mongodb.com)
3. Google Cloud Console project for OAuth

## Step 1: Setup MongoDB Atlas
1. Create a MongoDB Atlas cluster
2. Get your connection string
3. Whitelist Vercel IPs (0.0.0.0/0 for simplicity)

## Step 2: Deploy Backend
1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Deploy to Vercel:
   ```bash
   npx vercel
   ```

3. Set environment variables in Vercel dashboard:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string
   - `NODE_ENV`: production

## Step 3: Deploy Frontend
1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Update `.env` with your backend URL:
   ```
   REACT_APP_API_URL=https://your-backend-url.vercel.app
   REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
   ```

3. Deploy to Vercel:
   ```bash
   npx vercel
   ```

## Step 4: Configure Google OAuth
1. Go to Google Cloud Console
2. Add your Vercel frontend URL to authorized origins
3. Add your Vercel frontend URL to authorized redirect URIs

## Alternative: Deploy as Monorepo
Deploy both frontend and backend together:
```bash
npx vercel
```

## Environment Variables Needed

### Backend
- `MONGODB_URI`
- `JWT_SECRET`
- `NODE_ENV`

### Frontend
- `REACT_APP_API_URL`
- `REACT_APP_GOOGLE_CLIENT_ID`

## Post-Deployment
1. Test authentication flow
2. Verify API endpoints work
3. Check CORS settings if needed