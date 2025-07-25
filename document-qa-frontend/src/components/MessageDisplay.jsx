// src/components/MessageDisplay.jsx
import React from 'react';

const MessageDisplay = ({ message, type = 'info' }) => {
  if (!message) return null;

  let alertClass = 'alert';
  let customClass = '';
  switch (type) {
    case 'success':
      alertClass += ' alert-success';
      customClass = 'custom-alert-success';
      break;
    case 'error':
      alertClass += ' alert-danger'; // Bootstrap uses alert-danger for errors
      customClass = 'custom-alert-error';
      break;
    case 'warning':
      alertClass += ' alert-warning';
      customClass = 'custom-alert-warning';
      break;
    case 'info':
    default:
      alertClass += ' alert-info';
      customClass = 'custom-alert-info';
      break;
  }

  return (
    <div className={`mt-4 ${alertClass} ${customClass}`} role="alert">
      <h4 className="alert-heading text-capitalize">{type}:</h4>
      <p>{message}</p>
    </div>
  );
};

export default MessageDisplay;
