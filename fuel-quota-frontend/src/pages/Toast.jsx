import React, { useEffect } from 'react';
import './Toast.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faExclamationCircle, 
  faInfoCircle, 
  faTimesCircle,
  faTimes 
} from '@fortawesome/free-solid-svg-icons';

export const Toast = ({ message, type = 'info', duration = 5000, onClose }) => {
  useEffect(() => {
    if (!onClose) return;
    
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastIcon = () => {
    switch (type) {
      case 'success':
        return <FontAwesomeIcon icon={faCheckCircle} />;
      case 'error':
        return <FontAwesomeIcon icon={faExclamationCircle} />;
      case 'warning':
        return <FontAwesomeIcon icon={faTimesCircle} />;
      case 'info':
      default:
        return <FontAwesomeIcon icon={faInfoCircle} />;
    }
  };

  return (
    <div className={`toast toast-${type}`} role="alert">
      <div className="toast-icon">
        {getToastIcon()}
      </div>
      <div className="toast-content">
        {message}
      </div>
      {onClose && (
        <button className="toast-close" onClick={onClose} aria-label="Close">
          <FontAwesomeIcon icon={faTimes} />
        </button>
      )}
    </div>
  );
};