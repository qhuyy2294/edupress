import React from 'react';
import './Message.css';

const Message = ({ type = 'info', message, onClose }) => {
  const icons = {
    success: 'Thành công',
    error: 'Lỗi',
    warning: 'Cảnh báo',
    info: 'info',
  };

  return (
    <div className={`message message-${type}`}>
      <span className="message-icon">{icons[type]}</span>
      <span className="message-text">{message}</span>
      {onClose && (
        <button className="message-close" onClick={onClose}>
          x 
        </button>
      )}
    </div>
  );
};

export default Message;
