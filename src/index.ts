import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/database';
import * as errorMiddleware from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import assignmentRoutes from './routes/assignment.routes';

// Load environment variables
dotenv.config();

// Define port
const PORT = process.env.PORT || 9090;

// Initialize express app
const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple health check route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.send('API is running...');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/assignment', assignmentRoutes);

// 404 handler - must be after all valid routes
app.use(errorMiddleware.notFoundHandler);

// Error handling middleware - must be the last middleware
app.use(errorMiddleware.errorHandler);

// Start the server
const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDB();
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`⚡️ Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
};

// Initialize server
startServer();

// For testing purposes
export default app;

