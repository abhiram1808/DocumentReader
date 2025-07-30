// src/routes/documentRoutes.js
const express = require('express');
const documentController = require('../controllers/documentController');
const { upload } = require('../utils/fileHandler'); // Import configured multer upload middleware

const router = express.Router();

// Route for uploading a document.
// Multer handles the file, and express.json() (from app.js) will parse documentId from body.
router.post('/upload', upload.single('document'), documentController.uploadDocument);

// NEW: Route for loading a specific document's context into backend memory.
router.post('/load-context', documentController.loadDocumentContext); // <-- NEW ROUTE

// Routes for AI operations (Q&A, Summary, Key Concepts, Generated Q&A, Flashcards)
// These will now operate on the document currently loaded in backend memory.
router.post('/ask', documentController.askQuestion);
router.post('/summary', documentController.getSummary);
router.post('/key-concepts', documentController.getKeyConcepts);
router.post('/generate-qa', documentController.generateQA);
router.post('/flashcards', documentController.getFlashcards);

module.exports = router;
