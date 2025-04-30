/* eslint-disable no-unused-vars */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import withAuth from '../withAuth';
import './Dashboard.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGasPump, faQrcode, faHistory, faSignOutAlt, faDownload } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const Dashboard = ({ userId }) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [quotaInfo, setQuotaInfo] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);

  useEffect(() => {
    // Fetch user data and quota information
    const fetchData = async () => {
      try {
        // Get from localStorage first
        const storedData = JSON.parse(localStorage.getItem('userData'));
        setUserData(storedData);

        // Fetch current quota
        const quotaResponse = await fetch(`/api/quotas?vehicleId=${storedData.vehicleId}`);
        const quotaData = await quotaResponse.json();
        setQuotaInfo(quotaData);

        // Fetch recent transactions
        const transactionsResponse = await fetch(`/api/transactions?vehicleId=${storedData.vehicleId}&limit=5`);
        const transactionsData = await transactionsResponse.json();
        setRecentTransactions(transactionsData);

        // Fetch QR code if we have a vehicle ID
        if (storedData.vehicleId) {
          fetchQrCode(storedData.vehicleId);
        }

      } catch (error) {
        console.error("Dashboard data error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const fetchQrCode = async (vehicleId) => {
    setQrLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/userapi/vehicles/${vehicleId}/qrcode`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setQrCode(response.data.qrCode);
      }
    } catch (error) {
      console.error("Error fetching QR code:", error);
    } finally {
      setQrLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    navigate('/user-login');
  };

  const downloadQRCode = () => {
    if (!qrCode) return;

    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `vehicle-qr-${userData?.vehicleNumber || 'code'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const regenerateQRCode = () => {
    if (userData?.vehicleId) {
      fetchQrCode(userData.vehicleId);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="owner-dashboard">
      <header className="dashboard-header">
        <div className="user-info">
          <h2>Welcome, {userData?.name || 'Vehicle Owner'}</h2>
          <p className="vehicle-info">
            <span className="label">Vehicle:</span> 
            {userData?.vehicleNumber || 'N/A'} ({userData?.vehicleType || 'N/A'})
          </p>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          <FontAwesomeIcon icon={faSignOutAlt} /> Logout
        </button>
      </header>

      <div className="dashboard-content">
        {/* QR Code Card */}
        <div className="dashboard-card qr-card">
          <div className="card-header">
            <FontAwesomeIcon icon={faQrcode} className="card-icon" />
            <h3>Vehicle QR Code</h3>
          </div>
          <div className="qr-container">
            {qrLoading ? (
              <div className="qr-loading">
                <div className="spinner small"></div>
                <p>Generating QR code...</p>
              </div>
            ) : qrCode ? (
              <img src={qrCode} alt="Vehicle QR Code" className="qr-image" />
            ) : (
              <p>No QR code available. Click regenerate to create one.</p>
            )}
          </div>
          <div className="qr-actions">
            <button 
              onClick={downloadQRCode} 
              className="action-btn download-btn"
              disabled={!qrCode || qrLoading}
            >
              <FontAwesomeIcon icon={faDownload} /> Download QR Code
            </button>
            <button 
              onClick={regenerateQRCode} 
              className="action-btn regenerate-btn"
              disabled={qrLoading}
            >
              <FontAwesomeIcon icon={faQrcode} /> Regenerate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AuthenticatedDashboard = withAuth(Dashboard);  
export default AuthenticatedDashboard;