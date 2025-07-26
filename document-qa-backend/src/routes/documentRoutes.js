// src/routes/documentRoutes.js
const express = require('express');
const documentController = require('../controllers/documentController');
const { upload } = require('../utils/fileHandler'); // Import configured multer upload middleware

const router = express.Router();

// Route for uploading a document. Uses the 'upload' middleware for single file.
// The 'document' string matches the field name in the FormData from the frontend.
router.post('/upload', upload.single('document'), documentController.uploadDocument);

// Route for asking a question about the document.
router.post('/ask', documentController.askQuestion);

// Route for getting a summary of the document.
router.post('/summary', documentController.getSummary);

// Route for getting key concepts from the document.
router.post('/key-concepts', documentController.getKeyConcepts);

// Route for generating Q&A pairs from the document.
router.post('/generate-qa', documentController.generateQA);

// NEW: Route for generating flashcard-style Q&A pairs from the document.
router.post('/flashcards', documentController.getFlashcards); // <-- NEW ROUTE

module.exports = router;
