// src/config.js
module.exports = {
  // Directory where uploaded PDF files will be temporarily stored
  uploadDir: 'uploads',
  // Directory where ChromaDB will persist its data (relative to project root)
  chromaPersistDir: 'chroma_db',
  // Maximum file size for PDF uploads (e.g., 10MB)
  maxFileSize: 10 * 1024 * 1024,
  // Allowed file types for upload
  allowedFileTypes: ['application/pdf'],
};
