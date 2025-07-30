import React from 'react';

const DocumentHistory = ({ documents, currentActiveDocumentId, onLoadDocument }) => {
  if (!documents || documents.length === 0) {
    return <p className="text-muted text-center">No documents uploaded yet.</p>;
  }

  return (
    <ul className="list-group list-group-flush">
      {documents.map((doc) => (
        <li
          key={doc.id}
          // Apply 'active' class if this document is the currently active one
          className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
            doc.id === currentActiveDocumentId ? 'document-item active' : ''
          }`}
          onClick={() => onLoadDocument(doc.id)}
          style={{ cursor: 'pointer' }}
        >
          <span className="flex-grow-1 me-2 text-truncate">{doc.fileName}</span>
          {doc.uploadTimestamp && (
            <small className="text-muted text-nowrap">
              {new Date(doc.uploadTimestamp.toDate()).toLocaleDateString()}
            </small>
          )}
        </li>
      ))}
    </ul>
  );
};

export default DocumentHistory;
