// src/components/QaSection.jsx
import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const QaSection = ({ question, setQuestion, answer, handleAskQuestion, loading }) => {
  return (
    <>
      <h2 className="h5 mb-3 text-dark">Ask a Question</h2>
      <textarea
        className="form-control mb-3"
        placeholder="Type your question about the document here..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        disabled={loading}
        rows="3"
      ></textarea>
      <button
        onClick={handleAskQuestion}
        disabled={loading || !question.trim()}
        className={`btn btn-block w-100 mt-2 ${loading || !question.trim() ? 'btn-secondary custom-button-disabled' : 'custom-button-success'}`}
      >
        {loading ? 'Thinking...' : 'Get Answer'}
      </button>
      {loading && <LoadingSpinner message="Getting answer..." />}
      {answer && (
        <div className="mt-4 p-3 border rounded custom-qa-answer-box">
          <h3 className="h6 text-dark">Answer:</h3>
          <p className="mb-0 text-break">{answer}</p>
        </div>
      )}
    </>
  );
};

export default QaSection;
