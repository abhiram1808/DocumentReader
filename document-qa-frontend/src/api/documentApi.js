// src/api/documentApi.js
const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Uploads a PDF document to the backend for processing.
 * @param {File} file - The PDF file to upload.
 * @returns {Promise<object>} - The response data from the backend.
 */
export const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append('document', file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to upload document.');
  }

  return response.json();
};

/**
 * Sends a question to the backend and retrieves an answer.
 * @param {string} question - The question to ask.
 * @returns {Promise<object>} - The response data containing the answer.
 */
export const askQuestion = async (question) => {
  const response = await fetch(`${API_BASE_URL}/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to get answer.');
  }

  return response.json();
};

/**
 * Requests a summary of the uploaded document from the backend.
 * @returns {Promise<object>} - The response data containing the summary.
 */
export const getSummary = async () => {
  const response = await fetch(`${API_BASE_URL}/summary`, {
    method: 'POST', // Use POST as defined in backend routes
    headers: {
      'Content-Type': 'application/json',
    },
    // No body needed for summary request
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Summary generation failed.');
  }

  return response.json();
};

/**
 * Requests key concepts from the uploaded document from the backend.
 * @returns {Promise<object>} - The response data containing the key concepts.
 */
export const getKeyConcepts = async () => {
  const response = await fetch(`${API_BASE_URL}/key-concepts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Key concept extraction failed.');
  }

  return response.json();
};

/**
 * Requests generated Q&A pairs from the uploaded document from the backend.
 * @returns {Promise<object>} - The response data containing the Q&A pairs.
 */
export const generateQA = async () => {
  const response = await fetch(`${API_BASE_URL}/generate-qa`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Q&A generation failed.');
  }

  return response.json();
};

/**
 * Requests flashcard-style Q&A pairs from the uploaded document from the backend.
 * @returns {Promise<object>} - The response data containing the flashcards.
 */
export const generateFlashcards = async () => { // <-- NEW FUNCTION
  const response = await fetch(`${API_BASE_URL}/flashcards`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Flashcard generation failed.');
  }

  return response.json();
};
