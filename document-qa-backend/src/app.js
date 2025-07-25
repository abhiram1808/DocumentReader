// src/app.js
const express = require('express');
const cors = require('cors');
const documentRoutes = require('./routes/documentRoutes'); // Import your routes
const multer = require('multer'); // Import multer to catch its specific errors

const app = express();

// Middleware setup
app.use(cors()); // Enable CORS for all routes to allow frontend connection
app.use(express.json()); // Enable JSON body parsing for incoming requests

// API routes
// All document-related routes will be prefixed with /api
app.use('/api', documentRoutes);

// Basic route for health check or root access
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Document Q&A Backend API is running!' });
});

// Global error handling middleware
// This catches errors thrown by middleware or route handlers, including Multer errors.
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err); // Log the full error for debugging

  // Handle Multer-specific errors (e.g., file size limit, invalid file type)
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `File upload error: ${err.message}` });
  }
  // Handle custom errors from fileHandler (e.g., "Only PDF files are allowed!")
  // These errors might have a custom 'statusCode' property attached.
  if (err.statusCode && err.message) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Generic error response for other unhandled errors
  res.status(500).json({ error: 'An unexpected server error occurred.' });
});

module.exports = app;
