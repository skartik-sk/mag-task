# Vercel Deployment Setup

## Backend Environment Variables

You need to set these environment variables in your Vercel project settings:

1. Go to https://vercel.com/singupalli-kartiks-projects/mag-task/settings/environment-variables

2. Add the following variables:

```
MONGODB_URI=MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
NODE_ENV=production
```

## Frontend Environment Variables

For frontend deployment on Vercel, add:

```
VITE_API_URL=https://mag-task.vercel.app/api
```

## Testing

After setting environment variables:

1. Backend Health Check: https://mag-task.vercel.app/health
2. Frontend: Your Vercel frontend URL

## Current Status

- ✅ Backend code is ready and built
- ✅ Frontend is built
- ⚠️ Need to set environment variables in Vercel dashboard
- ⚠️ Backend will work once env vars are set

## Manual Steps Required

1. Go to Vercel dashboard
2. Navigate to your project settings
3. Add environment variables listed above
4. Redeploy (Vercel will auto-redeploy when you save env vars)
