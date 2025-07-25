// src/api/documentApi.js
const API_BASE_URL = 'http://localhost:5000/api'; // Matches backend /api prefix

/**
 * Uploads a PDF document to the backend.
 * @param {File} file - The PDF file to upload.
 * @returns {Promise<object>} Response data from the backend.
 */
const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append('document', file); // Append the file with the name 'document'

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData, // Send the FormData object
  });
  return response.json();
};

/**
 * Sends a question to the backend for RAG-based answering.
 * @param {string} question - The question to ask.
 * @returns {Promise<object>} Response data containing the answer.
 */
const askQuestion = async (question) => {
  const response = await fetch(`${API_BASE_URL}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  return response.json();
};

/**
 * Requests a summary of the uploaded document from the backend.
 * @returns {Promise<object>} Response data containing the summary.
 */
const getSummary = async () => {
  const response = await fetch(`${API_BASE_URL}/summary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  return response.json();
};

/**
 * Requests key concepts from the uploaded document from the backend.
 * @returns {Promise<object>} Response data containing an array of concepts.
 */
const getKeyConcepts = async () => {
  const response = await fetch(`${API_BASE_URL}/key-concepts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  return response.json();
};

/**
 * Requests generated Q&A pairs from the uploaded document from the backend.
 * @returns {Promise<object>} Response data containing an array of Q&A objects.
 */
const generateQA = async () => {
  const response = await fetch(`${API_BASE_URL}/generate-qa`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  return response.json();
};

export {
  uploadDocument,
  askQuestion,
  getSummary,
  getKeyConcepts,
  generateQA,
};
