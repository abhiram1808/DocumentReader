// src/components/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center p-4">
      {/* Bootstrap spinner with custom color applied via custom-spinner class */}
      <div className="spinner-border custom-spinner" role="status" style={{ width: '3rem', height: '3rem' }}>
        <span className="visually-hidden">{message}</span>
      </div>
      <p className="mt-3 text-muted">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
