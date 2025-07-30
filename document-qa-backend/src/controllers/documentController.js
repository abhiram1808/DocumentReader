// src/controllers/documentController.js
const fs = require('fs').promises;
const path = require('path');
const config = require('../config');
const llmService = require('../services/llmService'); // Import LLM service
const documentModel = require('../models/documentModel'); // Import document model to get currentLoadedDocumentId

/**
 * Handles PDF document upload and processes it to create a knowledge base.
 * Now expects a documentId from the frontend to store data uniquely.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded.' });
    }
    const { documentId } = req.body; // Expect documentId from frontend

    if (!documentId) {
      return res.status(400).json({ error: 'documentId is required for upload.' });
    }

    const filePath = req.file.path;
    console.log(`Loading PDF from: ${filePath} for document ID: ${documentId}`);

    // Process the PDF document (load, split, embed, store in vector DB)
    await llmService.processPdfDocument(documentId, filePath); // Pass documentId

    // After processing, delete the temporary file
    await fs.unlink(filePath);
    console.log(`Deleted temporary file: ${filePath}`);

    res.status(200).json({ message: 'Document processed and knowledge base updated successfully!', documentId: documentId });
  } catch (error) {
    console.error('Error in uploadDocument controller:', error);
    // Ensure the temporary file is deleted even if processing fails
    if (req.file && await fs.access(req.file.path).then(() => true).catch(() => false)) {
      await fs.unlink(req.file.path);
      console.log(`Deleted temporary file after error: ${req.file.path}`);
    }
    res.status(500).json({ error: error.message || 'Failed to process document.' });
  }
};

/**
 * Handles loading a specific document's context into the backend's memory.
 * This makes that document active for subsequent AI operations.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
const loadDocumentContext = async (req, res) => { // <-- NEW FUNCTION
  try {
    const { documentId } = req.body;
    if (!documentId) {
      return res.status(400).json({ error: 'documentId is required to load context.' });
    }

    await llmService.loadDocumentContext(documentId);
    res.status(200).json({ message: `Document context for ID ${documentId} loaded successfully.` });
  } catch (error) {
    console.error('Error in loadDocumentContext controller:', error);
    res.status(500).json({ error: error.message || 'Failed to load document context.' });
  }
};


// Helper to check if a document is loaded before performing AI operations
const checkDocumentLoaded = (res) => {
  if (!documentModel.getCurrentLoadedDocumentId()) {
    res.status(400).json({ error: 'No document knowledge base loaded. Please upload or load a document first.' });
    return false;
  }
  return true;
};

/**
 * Handles asking a question against the loaded document knowledge base.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
const askQuestion = async (req, res) => {
  try {
    if (!checkDocumentLoaded(res)) return; // Check if a document is loaded

    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required.' });
    }

    const answer = await llmService.getAnswerFromDocument(question);
    res.status(200).json({ answer });
  } catch (error) {
    console.error('Error in askQuestion controller:', error);
    res.status(500).json({ error: error.message || 'Failed to get answer.' });
  }
};

/**
 * Handles generating a summary of the loaded document.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
const getSummary = async (req, res) => {
  try {
    if (!checkDocumentLoaded(res)) return; // Check if a document is loaded

    const summary = await llmService.getDocumentSummary();
    res.status(200).json({ summary });
  } catch (error) {
    console.error('Error in getSummary controller:', error);
    res.status(500).json({ error: error.message || 'Failed to generate summary.' });
  }
};

/**
 * Handles extracting key concepts from the loaded document.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
const getKeyConcepts = async (req, res) => {
  try {
    if (!checkDocumentLoaded(res)) return; // Check if a document is loaded

    const concepts = await llmService.getKeyConcepts();
    res.status(200).json({ concepts });
  } catch (error) {
    console.error('Error in getKeyConcepts controller:', error);
    res.status(500).json({ error: error.message || 'Failed to extract key concepts.' });
  }
};

/**
 * Handles generating Q&A pairs from the loaded document.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
const generateQA = async (req, res) => {
  try {
    if (!checkDocumentLoaded(res)) return; // Check if a document is loaded

    const qa_pairs = await llmService.generateImportantQA();
    res.status(200).json({ qa_pairs });
  } catch (error) {
    console.error('Error in generateQA controller:', error);
    res.status(500).json({ error: error.message || 'Failed to generate Q&A pairs.' });
  }
};

/**
 * Handles generating flashcard-style Q&A pairs from the loaded document.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
const getFlashcards = async (req, res) => {
  try {
    if (!checkDocumentLoaded(res)) return; // Check if a document is loaded

    const flashcards = await llmService.generateFlashcards();
    res.status(200).json({ flashcards });
  } catch (error) {
    console.error('Error in getFlashcards controller:', error);
    res.status(500).json({ error: error.message || 'Failed to generate flashcards.' });
  }
};

module.exports = {
  uploadDocument,
  loadDocumentContext, // <-- EXPORT NEW FUNCTION
  askQuestion,
  getSummary,
  getKeyConcepts,
  generateQA,
  getFlashcards,
};
