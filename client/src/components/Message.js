/**
 * Message Component
 * Display success, error, or info messages
 */

import React from 'react';
import './Message.css';

const Message = ({ type = 'info', message, onClose }) => {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <div className={`message message-${type}`}>
      <span className="message-icon">{icons[type]}</span>
      <span className="message-text">{message}</span>
      {onClose && (
        <button className="message-close" onClick={onClose}>
          ×
        </button>
      )}
    </div>
  );
};

export default Message;
