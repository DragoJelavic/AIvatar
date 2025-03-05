import express from 'express';
import cors from 'cors';
import { connectDB } from './db';
import passport from 'passport';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import hpp from 'hpp';
import { StatusCodes } from 'http-status-codes';
import morgan from 'morgan';
import { logger } from './config/logger';
import { limiter } from './config/rateLimiter';

const app = express();
const port = process.env.PORT || 4000;

const bootstrapServer = async () => {
  await connectDB();

  // Apply middleware
  app.use(helmet()); // Helmet for security headers
  app.use(hpp()); // Protect against HTTP Parameter Pollution attacks
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser()); // Parse cookies
  app.use(morgan('combined')); // HTTP request logger
  app.use(limiter); // Apply rate limiting to all requests

  app.use(
    session({
      secret: 'your-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 60000 * 60 },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.get('/', (req, res) => {
    res.status(StatusCodes.OK).send('Hello World!');
  });

  app.listen(port, () => {
    logger.info(`🚀 API is ready at http://localhost:${port}`);
  });
};

bootstrapServer();
