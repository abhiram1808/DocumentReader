// src/components/KeyConceptsSection.jsx
import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const KeyConceptsSection = ({ keyConcepts, handleGetKeyConcepts, loading }) => {
  return (
    <>
      <h2 className="h5 mb-3 text-dark">Key Concepts</h2>
      <button
        onClick={handleGetKeyConcepts}
        disabled={loading}
        className={`btn btn-block w-100 mt-2 ${loading ? 'btn-secondary custom-button-disabled' : 'custom-button-info'}`}
      >
        {loading ? 'Extracting...' : 'Extract Key Concepts'}
      </button>
      {loading && <LoadingSpinner message="Extracting concepts..." />}
      {keyConcepts.length > 0 && (
        <div className="mt-4 p-3 border rounded custom-concepts-box">
          <h3 className="h6 text-dark">Concepts:</h3>
          <ul className="list-unstyled mb-0"> {/* Using list-unstyled for custom styling */}
            {keyConcepts.map((concept, index) => (
              <li key={index}>&bull; {concept}</li> 
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default KeyConceptsSection;
