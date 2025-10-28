# Vercel Deployment Instructions

## Quick Deploy Steps

1. **Push to GitHub**: Ensure all changes are committed and pushed to your repository

2. **Import to Vercel**:
   - Go to https://vercel.com/savita-pns-projects
   - Click "New Project"
   - Import from GitHub: `https://github.com/Savita-pn/IQ__HE`

3. **Configure Environment Variables**:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hotelease
   JWT_SECRET=your_super_secure_jwt_secret_key_minimum_32_characters
   NODE_ENV=production
   ```

4. **Deploy**: Click "Deploy"

## Project Structure
- Frontend: React app in `/frontend` folder
- Backend: Serverless API in `/api` folder
- Database: MongoDB Atlas

## Environment Variables Required
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: Secure JWT secret key (minimum 32 characters)
- `NODE_ENV`: Set to "production"

## Post-Deployment
- Frontend will be available at: `https://your-project.vercel.app`
- API will be available at: `https://your-project.vercel.app/api`
- Test with: `https://your-project.vercel.app/api/health`

## MongoDB Atlas Setup
1. Create free cluster at mongodb.com/atlas
2. Create database user
3. Whitelist IP: 0.0.0.0/0
4. Get connection string
5. Add to Vercel environment variables