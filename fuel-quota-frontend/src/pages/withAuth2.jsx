import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './withAuth.css';

const withAuth2 = (WrappedComponent) => {
  const AuthComponent = (props) => {
    const [authState, setAuthState] = useState({
      isAuthenticated: false,
      isLoading: true,
      userId: null,
      error: null
    });
    const navigate = useNavigate();

    useEffect(() => {
      const verifyToken = async () => {
        const token = localStorage.getItem('shedToken');
        
        // Immediate checks
        if (!token) {
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            userId: null,
            error: 'No authentication token found'
          });
          return;
        }

        try {
          const response = await axios.get('http://localhost:5000/api/verify-token', {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (response.data.success) {
            setAuthState({
              isAuthenticated: true,
              isLoading: false,
              userId: response.data.userId,
              error: null
            });
          } else {
            throw new Error(response.data.message || 'Invalid token');
          }
        } catch (error) {
          console.error('Authentication error:', error);
          localStorage.removeItem('token');
          
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            userId: null,
            error: error.response?.data?.message || 
                  error.message || 
                  'Authentication failed'
          });

          // Auto-redirect on specific errors
          if (error.response?.data?.code === 'TOKEN_EXPIRED') {
            navigate('/shed-owner-login', { state: { from: 'expired' } });
          }
        }
      };

      verifyToken();
    }, [navigate]);

    // Render states
    if (authState.isLoading) {
      return (
        <div className="auth-loading-state">
          <div className="spinner"></div>
          <p>Verifying session...</p>
        </div>
      );
    }

    if (!authState.isAuthenticated) {
      return (
        <div className="auth-error-state">
          <h3>Access Restricted</h3>
          <p>{authState.error || 'You need to log in to view this page'}</p>
          <button 
            onClick={() => navigate('/shed-owner-login')}
            className="auth-login-button"
          >
            Go to Loginnnnnnn
          </button>
        </div>
      );
    }

    return <WrappedComponent {...props} userId={authState.userId} />;
  };

  // Set display name for debugging
  AuthComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  
  return AuthComponent;
};

export default withAuth2;