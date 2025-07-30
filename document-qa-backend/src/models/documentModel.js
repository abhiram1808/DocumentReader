// src/models/documentModel.js
const { HNSWLib } = require('@langchain/community/vectorstores/hnswlib');
const config = require('../config');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;

// Base directory for HNSWLib persistence
const hnswBasePersistPath = path.join(__dirname, '..', '..', config.chromaPersistDir);

// Ensure the base persistence directory exists
if (!fs.existsSync(hnswBasePersistPath)) {
  fs.mkdirSync(hnswBasePersistPath, { recursive: true });
  console.log(`Created HNSWLib base persistence directory: ${hnswBasePersistPath}`);
}

let currentVectorStore = null; // Singleton instance of the currently loaded vector store
let currentAllDocumentChunks = []; // Stores all chunks of the currently loaded document
let currentLoadedDocumentId = null; // Stores the ID of the currently loaded document

/**
 * Gets the path for a specific document's HNSWLib data.
 * @param {string} documentId - The unique ID of the document.
 * @returns {string} The full path to the document's persistence directory.
 */
const getDocumentPersistPath = (documentId) => {
  return path.join(hnswBasePersistPath, documentId);
};

/**
 * Gets the path for a specific document's raw chunks file.
 * @param {string} documentId - The unique ID of the document.
 * @returns {string} The full path to the document's raw chunks JSON file.
 */
const getRawChunksFilePath = (documentId) => {
  return path.join(getDocumentPersistPath(documentId), 'raw_chunks.json');
};

/**
 * Initializes or retrieves the HNSWLib vector store for the *currently loaded* document.
 * This function primarily serves to return the active store for LLM operations.
 * It will attempt to load the last known active document if not already loaded.
 * @param {object} embeddings - The embeddings model instance.
 * @returns {Promise<HNSWLib|null>} The HNSWLib instance or null if not found.
 */
const getVectorStore = async (embeddings) => {
  if (currentVectorStore && currentLoadedDocumentId) {
    return currentVectorStore;
  }
  // If not loaded, try to load the last active document (if concept of last active exists,
  // for now we rely on explicit loadSpecificVectorStore or initial upload)
  console.warn("getVectorStore called but no document is actively loaded. Please ensure a document is uploaded or loaded first.");
  return null;
};

/**
 * Creates a new HNSWLib vector store from document chunks and persists it to a unique path.
 * Also saves the raw document chunks to a separate file within that path.
 * This function will also set the newly created document as the current active document.
 * @param {string} documentId - The unique ID for this document.
 * @param {Array} splitDocs - An array of LangChain Document objects (chunks).
 * @param {object} embeddings - The embeddings model instance.
 * @returns {Promise<HNSWLib>} The newly created HNSWLib instance.
 */
const createAndPersistVectorStore = async (documentId, splitDocs, embeddings) => {
  const docPersistPath = getDocumentPersistPath(documentId);
  const rawChunksFile = getRawChunksFilePath(documentId);

  // Ensure the document-specific directory exists
  if (!fs.existsSync(docPersistPath)) {
    fs.mkdirSync(docPersistPath, { recursive: true });
    console.log(`Created document-specific directory: ${docPersistPath}`);
  }

  // Create a new HNSWLib instance from documents and embeddings
  currentVectorStore = await HNSWLib.fromDocuments(splitDocs, embeddings);

  // Save the vector store to disk
  await currentVectorStore.save(docPersistPath);
  console.log(`Created/Updated HNSWLib vector store for ${documentId} and persisted to disk.`);

  // Save raw document chunks to a JSON file
  await fsPromises.writeFile(rawChunksFile, JSON.stringify(splitDocs), 'utf8');
  console.log(`Saved raw document chunks for ${documentId} to raw_chunks.json.`);

  // Set this document as the currently active one
  currentAllDocumentChunks = splitDocs;
  currentLoadedDocumentId = documentId;
  return currentVectorStore;
};

/**
 * Loads a specific HNSWLib vector store and its associated raw document chunks from disk.
 * This function will set the loaded document as the current active document.
 * @param {string} documentId - The unique ID of the document to load.
 * @param {object} embeddings - The embeddings model instance.
 * @returns {Promise<HNSWLib|null>} The loaded HNSWLib instance or null if not found/error.
 */
const loadSpecificVectorStore = async (documentId, embeddings) => {
  const docPersistPath = getDocumentPersistPath(documentId);
  const rawChunksFile = getRawChunksFilePath(documentId);

  if (currentLoadedDocumentId === documentId && currentVectorStore) {
    console.log(`Document ${documentId} is already loaded.`);
    return currentVectorStore;
  }

  try {
    // Load existing HNSWLib index
    const loadedVectorStore = await HNSWLib.load(docPersistPath, embeddings);
    console.log(`Loaded HNSWLib vector store for document: ${documentId}`);

    // Load raw document chunks
    if (fs.existsSync(rawChunksFile)) {
      const rawChunksData = await fsPromises.readFile(rawChunksFile, 'utf8');
      currentAllDocumentChunks = JSON.parse(rawChunksData);
      console.log(`Re-populated currentAllDocumentChunks with ${currentAllDocumentChunks.length} chunks for document: ${documentId}.`);
    } else {
      currentAllDocumentChunks = [];
      console.warn(`No raw_chunks.json found for document: ${documentId}. Cannot populate full document text.`);
    }

    currentVectorStore = loadedVectorStore;
    currentLoadedDocumentId = documentId;
    return currentVectorStore;
  } catch (error) {
    console.error(`Error loading vector store for document ${documentId}:`, error.message);
    currentVectorStore = null;
    currentAllDocumentChunks = [];
    currentLoadedDocumentId = null;
    throw new Error(`Failed to load document ${documentId}: ${error.message}`);
  }
};

/**
 * Gets all document chunks currently loaded in memory (for the active document).
 * @returns {Array} An array of LangChain Document objects.
 */
const getAllDocumentChunks = () => {
  return currentAllDocumentChunks;
};

/**
 * Gets the ID of the currently loaded document.
 * @returns {string|null} The ID of the currently loaded document, or null if none.
 */
const getCurrentLoadedDocumentId = () => {
  return currentLoadedDocumentId;
};


module.exports = {
  getVectorStore,
  createAndPersistVectorStore,
  loadSpecificVectorStore, // Export the new function
  getAllDocumentChunks,
  getCurrentLoadedDocumentId, // Export the new function
};
