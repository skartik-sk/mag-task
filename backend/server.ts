import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import userRoutes from './routes/users.js';
import teamRoutes from './routes/team.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 7001;

// Connect to MongoDB (only if MONGODB_URI is set)
if (process.env.MONGODB_URI) {
  connectDB();
} else {
  console.warn('⚠️  MONGODB_URI not set - skipping database connection');
}

// CORS configuration for Vercel and production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'https://magnet-brains.vercel.app',
  'https://magnet-brains-*.vercel.app', // Vercel preview deployments
];

const corsOptions = {
  origin: (origin: any, callback: any) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list or matches pattern
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        const pattern = allowed.replace('*', '.*');
        return new RegExp(pattern).test(origin);
      }
      return allowed === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for now, restrict later if needed
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Task Manager API is running' });
});

// Error handler
app.use(errorHandler);

// Only start server if not in Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 CORS enabled for all origins`);
  });
}

export default app;
