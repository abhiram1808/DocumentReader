// src/components/SummarySection.jsx
import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const SummarySection = ({ summary, handleGetSummary, loading }) => {
  return (
    <>
      <h2 className="h5 mb-3 text-dark">Document Summary</h2>
      <button
        onClick={handleGetSummary}
        disabled={loading}
        className={`btn btn-block w-100 mt-2 ${loading ? 'btn-secondary custom-button-disabled' : 'custom-button-info'}`}
      >
        {loading ? 'Generating...' : 'Generate Summary'}
      </button>
      {loading && <LoadingSpinner message="Generating summary..." />}
      {summary && (
        <div className="mt-4 p-3 border rounded custom-summary-box">
          <h3 className="h6 text-dark">Summary:</h3>
          <p className="mb-0 text-break">{summary}</p>
        </div>
      )}
    </>
  );
};

export default SummarySection;
