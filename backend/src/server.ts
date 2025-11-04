import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorHandler, notFound } from './middleware/error';
import db from './database';
import redisClient from './database/redis';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.routes';
import patientRoutes from './routes/patient.routes';
import appointmentRoutes from './routes/appointment.routes';
import aiRoutes from './routes/ai.routes';
import medicalRecordRoutes from './routes/medicalRecord.routes';
import prescriptionRoutes from './routes/prescription.routes';
import notificationRoutes from './routes/notification.routes';
import adminRoutes from './routes/admin.routes';
import vitalSignsRoutes from './routes/vitalSigns.routes';
import medicationRoutes from './routes/medication.routes';
import analyticsRoutes from './routes/analytics.routes';

class Server {
  public app: Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3001');
    
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());
    
    // CORS configuration
    const corsOptions = {
      origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
      credentials: true,
      optionsSuccessStatus: 200,
    };
    this.app.use(cors(corsOptions));

    // Compression
    this.app.use(compression());

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging
    if (process.env.NODE_ENV === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined'));
    }

    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      });
    });
  }

  private initializeRoutes(): void {
    const API_PREFIX = `/api/${process.env.API_VERSION || 'v1'}`;

    // Routes
    this.app.use(`${API_PREFIX}/auth`, authRoutes);
    this.app.use(`${API_PREFIX}/patients`, patientRoutes);
    this.app.use(`${API_PREFIX}/appointments`, appointmentRoutes);
    this.app.use(`${API_PREFIX}/ai`, aiRoutes);
    this.app.use(`${API_PREFIX}/medical-records`, medicalRecordRoutes);
    this.app.use(`${API_PREFIX}/prescriptions`, prescriptionRoutes);
    this.app.use(`${API_PREFIX}/notifications`, notificationRoutes);
    this.app.use(`${API_PREFIX}/admin`, adminRoutes);
    this.app.use(`${API_PREFIX}/vital-signs`, vitalSignsRoutes);
    this.app.use(`${API_PREFIX}`, medicationRoutes);
    this.app.use(`${API_PREFIX}/analytics`, analyticsRoutes);

    // API info endpoint
    this.app.get(API_PREFIX, (req: Request, res: Response) => {
      res.json({
        name: 'Patient Management System API',
        version: process.env.API_VERSION || 'v1',
        status: 'active',
        endpoints: [
          `${API_PREFIX}/auth`,
          `${API_PREFIX}/patients`,
          `${API_PREFIX}/appointments`,
          `${API_PREFIX}/ai`,
          `${API_PREFIX}/medical-records`,
          `${API_PREFIX}/prescriptions`,
          `${API_PREFIX}/notifications`,
        ],
      });
    });
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFound);

    // Error handler
    this.app.use(errorHandler);
  }

  private async initializeDatabase(): Promise<void> {
    console.log('Connecting to databases...');
    
    // Test PostgreSQL connection
    const dbConnected = await db.testConnection();
    if (!dbConnected) {
      console.error('Failed to connect to PostgreSQL');
      process.exit(1);
    }

    // Connect to Redis
    try {
      await redisClient.connect();
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      // Continue without Redis if needed
    }
  }

  public async start(): Promise<void> {
    try {
      // Initialize database connections
      await this.initializeDatabase();

      // Start server
      this.app.listen(this.port, () => {
        console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   Patient Management System API                          ║
║                                                           ║
║   Server running on port: ${this.port}                          ║
║   Environment: ${process.env.NODE_ENV}                        ║
║   API Version: ${process.env.API_VERSION || 'v1'}                             ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
        `);
      });

      // Graceful shutdown
      this.setupGracefulShutdown();
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);
      
      try {
        // Close database connections
        await db.close();
        await redisClient.disconnect();
        
        console.log('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }
}

// Start server
const server = new Server();
server.start();

export default server.app;
