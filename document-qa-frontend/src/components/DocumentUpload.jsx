// src/components/DocumentUpload.jsx
import React, { useRef } from 'react';

const DocumentUpload = ({ onFileSelect, onUpload, loading, selectedFile }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    onFileSelect(event.target.files[0]);
  };

  const clearFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="mb-4 p-4 border rounded shadow-sm bg-light">
      <h2 className="h5 mb-3 text-dark">1. Upload Document</h2>
      <div className="mb-3">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="form-control custom-file-input"
          id="pdfUpload"
        />
      </div>
      <button
        onClick={() => { onUpload(); clearFileInput(); }}
        disabled={loading || !selectedFile}
        className={`btn btn-block w-100 mt-3 ${loading || !selectedFile ? 'btn-secondary custom-button-disabled' : 'custom-button-primary'}`}
      >
        {loading && selectedFile ? 'Uploading...' : 'Upload PDF'}
      </button>
    </div>
  );
};

export default DocumentUpload;
