# HotelEase Deployment Guide

## Week 4 - Complete Deployment Setup

### Prerequisites
- MongoDB Atlas account (for production database)
- Vercel account (for frontend deployment)
- Render/Railway account (for backend deployment)

## Backend Deployment (Render/Railway)

### Option 1: Render Deployment

1. **Create Render Account**: Sign up at [render.com](https://render.com)

2. **Connect GitHub Repository**:
   - Connect your GitHub account
   - Select the HotelEase repository

3. **Create Web Service**:
   - Choose "Web Service"
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`

4. **Environment Variables**:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hotelease
   JWT_SECRET=your_super_secure_jwt_secret_key_here
   PORT=10000
   ```

5. **Deploy**: Click "Create Web Service"

### Option 2: Railway Deployment

1. **Create Railway Account**: Sign up at [railway.app](https://railway.app)

2. **Deploy from GitHub**:
   - Click "Deploy from GitHub repo"
   - Select your repository
   - Choose the backend folder

3. **Environment Variables**:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hotelease
   JWT_SECRET=your_super_secure_jwt_secret_key_here
   ```

4. **Deploy**: Railway will automatically deploy

## Frontend Deployment (Vercel)

### Setup Steps

1. **Create Vercel Account**: Sign up at [vercel.com](https://vercel.com)

2. **Import Project**:
   - Click "New Project"
   - Import from GitHub
   - Select HotelEase repository

3. **Configure Build Settings**:
   - Framework Preset: Create React App
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`

4. **Environment Variables**:
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com
   REACT_APP_ENV=production
   ```

5. **Deploy**: Click "Deploy"

## Database Setup (MongoDB Atlas)

### Configuration Steps

1. **Create MongoDB Atlas Account**: Sign up at [mongodb.com/atlas](https://mongodb.com/atlas)

2. **Create Cluster**:
   - Choose free tier (M0)
   - Select region closest to your users
   - Create cluster

3. **Database Access**:
   - Create database user
   - Set username and password
   - Grant read/write access

4. **Network Access**:
   - Add IP address: `0.0.0.0/0` (allow from anywhere)
   - Or add specific IPs for better security

5. **Get Connection String**:
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password

## Environment Variables Setup

### Backend (.env)
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hotelease?retryWrites=true&w=majority
JWT_SECRET=your_super_secure_jwt_secret_key_minimum_32_characters
PORT=10000
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

### Frontend (.env)
```env
REACT_APP_API_URL=https://your-backend-url.onrender.com
REACT_APP_ENV=production
```

## Post-Deployment Checklist

### Backend Verification
- [ ] API endpoints are accessible
- [ ] Database connection is working
- [ ] Authentication is functioning
- [ ] CORS is properly configured
- [ ] All routes return expected responses

### Frontend Verification
- [ ] Application loads without errors
- [ ] API calls are working
- [ ] Authentication flow works
- [ ] All pages are accessible
- [ ] Responsive design works on mobile

### Testing Checklist
- [ ] User registration works
- [ ] User login works
- [ ] Hotel browsing works
- [ ] Room booking works
- [ ] Admin dashboard loads
- [ ] Analytics data displays correctly
- [ ] Error handling works properly

## Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Ensure backend CORS_ORIGIN matches frontend domain
   - Check Vercel domain in backend CORS settings

2. **Database Connection Issues**:
   - Verify MongoDB Atlas connection string
   - Check network access settings
   - Ensure database user has proper permissions

3. **Build Failures**:
   - Check Node.js version compatibility
   - Verify all dependencies are listed in package.json
   - Check for TypeScript errors

4. **API Not Found (404)**:
   - Verify backend deployment URL
   - Check REACT_APP_API_URL in frontend
   - Ensure API routes are properly defined

### Performance Optimization

1. **Frontend**:
   - Enable Vercel's automatic optimizations
   - Use lazy loading for components
   - Optimize images and assets

2. **Backend**:
   - Enable compression middleware
   - Implement proper caching headers
   - Use database indexing

## Monitoring and Maintenance

### Health Checks
- Set up uptime monitoring (UptimeRobot, Pingdom)
- Monitor API response times
- Track error rates

### Backup Strategy
- MongoDB Atlas automatic backups
- Regular database exports
- Code repository backups

### Security Considerations
- Use strong JWT secrets
- Implement rate limiting
- Regular security updates
- Monitor for vulnerabilities

## Scaling Considerations

### When to Scale
- High user traffic
- Slow response times
- Database performance issues

### Scaling Options
- Upgrade Render/Railway plans
- Use CDN for static assets
- Implement database sharding
- Add caching layers (Redis)

## Support and Resources

- [Render Documentation](https://render.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)