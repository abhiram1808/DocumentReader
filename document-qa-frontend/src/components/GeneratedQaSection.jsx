// src/components/GeneratedQaSection.jsx
import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const GeneratedQaSection = ({ generatedQA, handleGenerateQA, loading }) => {
  return (
    <>
      <h2 className="h5 mb-3 text-dark">Generated Q&A</h2>
      <button
        onClick={handleGenerateQA}
        disabled={loading}
        className={`btn btn-block w-100 mt-2 ${loading ? 'btn-secondary custom-button-disabled' : 'custom-button-info'}`}
      >
        {loading ? 'Generating...' : 'Generate Q&A Pairs'}
      </button>
      {loading && <LoadingSpinner message="Generating Q&A..." />}
      {generatedQA.length > 0 && (
        <div className="mt-4 p-3 border rounded custom-qa-answer-box">
          <h3 className="h6 text-dark">Q&A Pairs:</h3>
          {generatedQA.map((qa, index) => (
            <div key={index} className="mb-3 pb-2 border-bottom">
              <p className="font-weight-bold mb-1">Q: {qa.question}</p>
              <p className="mb-0 text-break">A: {qa.answer}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default GeneratedQaSection;
