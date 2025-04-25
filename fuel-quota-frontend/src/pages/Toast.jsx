import React, { useEffect } from "react";
import './Toast.css'; // Import your CSS styles for the toast

const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);
        
        return () => {
            clearTimeout(timer);
        };
    }, [onClose]);

    const getIcon = () => {
        switch(type) {
            case 'success': return '✓';
            case 'error': return '✗';
            case 'info': return 'ℹ';
            default: return '';
        }
    };

    return (
        <div className={`toast toast-${type}`}>
            <span className="toast-icon">{getIcon()}</span>
            <div className="toast-message">{message}</div>
            <button 
                className="toast-close" 
                onClick={onClose} 
                aria-label="Close"
            >
                &times;
            </button>
        </div>
    );
};