const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { sendTaskAssignmentEmail } = require('./services/emailService');

dotenv.config();

// Basic startup checks for required environment variables
const requiredEnvs = ['JWT_SECRET', 'MONGO_URI'];
const missing = requiredEnvs.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}.\nPlease copy .env.example to .env and set them before starting the server.`);
  process.exit(1);
}

const app = express();

// Basic security and parsing
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(mongoSanitize());
app.use(xss());

// Logging in dev
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiter - Higher limit for development/testing
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW_MINUTES || 60) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 10000, // Very high limit for testing
  skip: (req) => {
    // Skip rate limiting for health check or public endpoints, and in development mode
    if (process.env.NODE_ENV === 'development') return true;
    return req.path === '/health';
  },
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});
app.use(limiter);

// Connect DB
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/files', require('./routes/files'));
app.use('/api/users', require('./routes/users'));
app.use('/api/analytics', require('./routes/analytics'));

// Health / root
app.get('/', (req, res) => {
  res.json({ message: 'Task Platform API' });
});

// Central error handler
app.get("/api/debug/test-gmail", async (req, res) => {
  try {
    const result = await sendTaskAssignmentEmail(
      process.env.EMAIL_USER,
      'Test User',
      'Test Task Title',
      'test-123',
      'Manager Name'
    );
    
    if (result) {
      res.json({ success: true, message: '✅ Test email sent successfully!', messageId: result.messageId });
    } else {
      res.status(500).json({ success: false, message: '❌ Email service failed (check logs)' });
    }
  } catch (err) {
    console.error('Test email error:', err);
    res.status(500).json({ success: false, message: '❌ Error: ' + err.message });
  }
});

app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
