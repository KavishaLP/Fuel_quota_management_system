/* eslint-disable no-unused-vars */

import React, { useState, useEffect } from 'react';
import withAuth from '../withAuth';
import { QRCodeSVG } from 'qrcode.react';
import './Dashboard.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaQrcode, FaDownload, FaTimes, FaCar, FaUser, FaEnvelope, FaPhone, FaSignOutAlt } from 'react-icons/fa';

const Dashboard = ({ userId }) => {
  const [showQRModal, setShowQRModal] = useState(false);
  const [ownerData, setOwnerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch owner data when component mounts or userId changes
    const fetchOwnerData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/userapi/vehicleowners/${userId}`);
        setOwnerData(response.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch owner data');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchOwnerData();
    }
  }, [userId]);

  const handleQRCodeClick = () => {
    if (!ownerData) {
      alert('Owner data not loaded yet');
      return;
    }
    setShowQRModal(true);
  };

  const handleCloseModal = () => {
    setShowQRModal(false);
  };
  
  const handleLogout = () => {
    // Clear any auth tokens/user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    // Navigate to login page
    navigate('/user-login');
  };

  const downloadQRCode = () => {
    const svg = document.getElementById('qr-code');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `qrcode-${ownerData.vehicleNumber}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loader"></div>
      <p>Loading your dashboard...</p>
    </div>
  );
  
  if (error) return (
    <div className="error-container">
      <div className="error-icon">!</div>
      <h2>Oops! Something went wrong</h2>
      <p>{error}</p>
      <button onClick={() => window.location.reload()} className="retry-button">Try Again</button>
    </div>
  );

  return (
    <div className="owner-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Vehicle Owner Dashboard</h1>
          <p className="welcome-text">Welcome back, {ownerData?.firstName || 'User'}</p>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          <FaSignOutAlt className="button-icon" /> Logout
        </button>
      </div>
      
      <div className="dashboard-grid">
        <div className="dashboard-card profile-card">
          <div className="card-header">
            <FaUser className="card-icon" />
            <h2>Personal Information</h2>
          </div>
          {ownerData && (
            <div className="card-content">
              <div className="info-row">
                <span className="info-label">Full Name</span>
                <span className="info-value">{ownerData.firstName} {ownerData.lastName}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Email</span>
                <span className="info-value">{ownerData.email || 'Not provided'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Phone</span>
                <span className="info-value">{ownerData.contactNumber || 'Not provided'}</span>
              </div>
            </div>
          )}
        </div>

        <div className="dashboard-card vehicle-card">
          <div className="card-header">
            <FaCar className="card-icon" />
            <h2>Vehicle Information</h2>
          </div>
          {ownerData && (
            <div className="card-content">
              <div className="info-row">
                <span className="info-label">Vehicle Number</span>
                <span className="info-value highlight">{ownerData.vehicleNumber}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Engine Number</span>
                <span className="info-value">{ownerData.engineNumber}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Vehicle Type</span>
                <span className="info-value">{ownerData.vehicleType || 'Standard'}</span>
              </div>
              <div className="qr-button-container">
                <button className="qr-button" onClick={handleQRCodeClick}>
                  <FaQrcode className="button-icon" /> Generate QR Code
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="dashboard-card quota-card">
          <div className="card-header">
            <div className="card-icon fuel-icon">⛽</div>
            <h2>Fuel Quota Status</h2>
          </div>
          <div className="card-content">
            <div className="fuel-quota-container">
              <div className="fuel-gauge">
                <div className="fuel-level" style={{ width: `${ownerData?.quotaPercentage || 75}%` }}></div>
              </div>
              <div className="quota-text">
                <span>{ownerData?.quotaRemaining || 15} liters</span> remaining of <span>{ownerData?.quotaTotal || 20} liters</span>
              </div>
            </div>
            <div className="last-refuel">
              Last refuel: {ownerData?.lastRefuelDate || 'April 27, 2025'}
            </div>
          </div>
        </div>

        <div className="dashboard-card history-card">
          <div className="card-header">
            <div className="card-icon history-icon">📋</div>
            <h2>Recent Activities</h2>
          </div>
          <div className="card-content">
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-date">April 27, 2025</div>
                <div className="activity-details">Refueled 12.5 liters at Shell Station</div>
              </div>
              <div className="activity-item">
                <div className="activity-date">April 15, 2025</div>
                <div className="activity-details">Quota updated to 20 liters</div>
              </div>
              <div className="activity-item">
                <div className="activity-date">April 10, 2025</div>
                <div className="activity-details">Refueled 7.5 liters at Caltex Station</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && ownerData && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2><FaQrcode className="modal-icon" /> Vehicle QR Code</h2>
              <button className="close-button" onClick={handleCloseModal}><FaTimes /></button>
            </div>
            <div className="modal-body">
              <div className="qr-container">
                <QRCodeSVG
                  id="qr-code"
                  value={ownerData.uniqueToken}
                  size={280}
                  level="H"
                  includeMargin={true}
                  imageSettings={{
                    src: "/logo.png",
                    excavate: true,
                    height: 30,
                    width: 30,
                  }}
                />
                <div className="vehicle-tag">{ownerData.vehicleNumber}</div>
              </div>
              <p className="qr-info">Present this QR code at fuel stations to access your fuel quota</p>
              <button className="download-button" onClick={downloadQRCode}>
                <FaDownload className="button-icon" /> Download QR Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AuthenticatedDashboard = withAuth(Dashboard);  
export default AuthenticatedDashboard;