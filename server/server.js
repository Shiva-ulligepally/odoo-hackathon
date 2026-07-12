const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load configurations
dotenv.config();

const connectDB = require('./config/db');
const globalErrorHandler = require('./middleware/errorHandler');
const apiLimiter = require('./middleware/rateLimiter');
const initCronJobs = require('./jobs/cronJobs');
const { isConfigured: isCloudinaryConfigured } = require('./config/cloudinary');
const mongoose = require('mongoose');

// Route files
const authRoutes = require('./routes/auth.routes');
const organizationRoutes = require('./routes/organization.routes');
const departmentRoutes = require('./routes/department.routes');
const employeeRoutes = require('./routes/employee.routes');
const carbonRoutes = require('./routes/carbon.routes');
const policyRoutes = require('./routes/policy.routes');
const reportRoutes = require('./routes/report.routes');
const uploadRoutes = require('./routes/upload.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

// Connect to Database
connectDB();

const app = express();

// Enable CORS
app.use(cors());

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiter to all API endpoints
app.use('/api', apiLimiter);

// Serve static uploaded files (Fallback local storage)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/carbon', carbonRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health Endpoint
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Running' : 'Disconnected';
  res.status(200).json({
    success: true,
    message: 'EcoSphere AI Server Healthy',
    data: {
      server: 'Healthy',
      version: '1.0.0',
      database: dbStatus,
      cloudinary: isCloudinaryConfigured ? 'Connected' : 'Ready (Mock Fallback Active)',
      ai: 'Ready'
    },
    meta: null,
    timestamp: new Date().toISOString()
  });
});

// Serve API documentation
app.get('/docs', (req, res) => {
  res.sendFile(path.join(__dirname, 'docs/swagger.json'));
});

// Wildcard Page Not Found handler
app.use('*', (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    data: {},
    meta: null,
    timestamp: new Date().toISOString()
  });
});

// Central Error Handler Middleware
app.use(globalErrorHandler);

// Start Cron Jobs
initCronJobs();

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`EcoSphere AI Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
