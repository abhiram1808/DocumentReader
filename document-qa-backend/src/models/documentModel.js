// src/models/documentModel.js
const { HNSWLib } = require('@langchain/community/vectorstores/hnswlib');
const config = require('../config');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises; // Use promise-based fs for async operations

// Directory where HNSWLib will persist its data and raw chunks
const hnswPersistPath = path.join(__dirname, '..', '..', config.chromaPersistDir); // Reusing chromaPersistDir config for HNSWLib
const rawChunksFilePath = path.join(hnswPersistPath, 'raw_chunks.json'); // Path for raw document chunks

if (!fs.existsSync(hnswPersistPath)) {
  fs.mkdirSync(hnswPersistPath, { recursive: true });
  console.log(`Created HNSWLib persistence directory: ${hnswPersistPath}`);
}

let currentVectorStore = null; // Singleton instance of the vector store
let currentAllDocumentChunks = []; // Stores all chunks of the currently loaded document

/**
 * Initializes or retrieves the HNSWLib vector store and raw document chunks.
 * @param {object} embeddings - The embeddings model instance (e.g., GoogleGenerativeAIEmbeddings).
 * @returns {Promise<HNSWLib|null>} The HNSWLib instance or null if not found.
 */
const getVectorStore = async (embeddings) => {
  if (currentVectorStore) {
    return currentVectorStore;
  }
  try {
    // Attempt to load existing HNSWLib index
    currentVectorStore = await HNSWLib.load(hnswPersistPath, embeddings);
    console.log('Loaded existing HNSWLib vector store from disk.');

    // --- NEW: Attempt to load raw document chunks ---
    if (fs.existsSync(rawChunksFilePath)) {
      const rawChunksData = await fsPromises.readFile(rawChunksFilePath, 'utf8');
      currentAllDocumentChunks = JSON.parse(rawChunksData);
      console.log(`Re-populated currentAllDocumentChunks with ${currentAllDocumentChunks.length} chunks from raw_chunks.json.`);
    } else {
      currentAllDocumentChunks = [];
      console.log('No raw_chunks.json found to re-populate document chunks.');
    }

    return currentVectorStore;
  } catch (error) {
    console.warn('No existing HNSWLib vector store found or error loading:', error.message);
    currentVectorStore = null;
    currentAllDocumentChunks = []; // Ensure it's clear if loading fails
    return null;
  }
};

/**
 * Creates a new HNSWLib vector store from document chunks and persists it.
 * Also saves the raw document chunks to a separate file.
 * @param {Array} splitDocs - An array of LangChain Document objects (chunks).
 * @param {Array<number[]>} preGeneratedEmbeddings - This parameter is now unused, kept for function signature compatibility.
 * @param {object} embeddings - The embeddings model instance (e.g., GoogleGenerativeAIEmbeddings).
 * @returns {Promise<HNSWLib>} The newly created HNSWLib instance.
 */
const createAndPersistVectorStore = async (splitDocs, preGeneratedEmbeddings, embeddings) => {
  // Create a new HNSWLib instance from documents and embeddings
  currentVectorStore = await HNSWLib.fromDocuments(splitDocs, embeddings);

  // Save the vector store to disk
  await currentVectorStore.save(hnswPersistPath);
  console.log('Created/Updated HNSWLib vector store and persisted to disk.');

  // --- NEW: Save raw document chunks to a JSON file ---
  await fsPromises.writeFile(rawChunksFilePath, JSON.stringify(splitDocs), 'utf8');
  console.log('Saved raw document chunks to raw_chunks.json.');

  // Update the global chunks in memory
  currentAllDocumentChunks = splitDocs;
  return currentVectorStore;
};

/**
 * Gets all document chunks currently loaded in memory.
 * This is used for operations like summarization that need the full document context.
 * @returns {Array} An array of LangChain Document objects.
 */
const getAllDocumentChunks = () => {
  return currentAllDocumentChunks;
};

module.exports = {
  getVectorStore,
  createAndPersistVectorStore,
  getAllDocumentChunks,
};
