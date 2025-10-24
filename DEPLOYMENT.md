# Vercel Deployment Guide

## 🚀 Deploy to Vercel

### Option 1: Deploy via GitHub (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to https://vercel.com
   - Sign in with GitHub
   - Click "New Project"
   - Import your repository

3. **Configure Environment Variables:**
   In Vercel dashboard, add these environment variables:
   ```
   MONGODB_URI=mongodb+srv://savita:savita@cluster0.3zz5dai.mongodb.net/hotelease?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=hotelease_super_secret_jwt_key_2024_production_ready
   NODE_ENV=production
   ```

4. **Deploy:**
   - Click "Deploy"
   - Vercel will automatically build and deploy

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

## 🔧 Configuration

- **Frontend:** React app with routing support
- **Backend:** Node.js API with MongoDB
- **Database:** MongoDB Atlas (already configured)
- **Authentication:** JWT with bcrypt

## 🌐 URLs After Deployment

- **Frontend:** https://your-project.vercel.app
- **Backend API:** https://your-project.vercel.app/api
- **Test Endpoint:** https://your-project.vercel.app/api/test

## 🧪 Test Deployment

1. Visit your Vercel URL
2. Try logging in with:
   - Email: user@gmail.com
   - Password: any password
3. Test registration and role-based features

## 🔍 Troubleshooting

- Check Vercel function logs for errors
- Verify environment variables are set
- Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)