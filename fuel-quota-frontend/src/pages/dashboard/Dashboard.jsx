import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import withAuth from '../withAuth';
import './Dashboard.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGasPump, faQrcode, faHistory, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

const Dashboard = ({ userId }) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [quotaInfo, setQuotaInfo] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

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

      } catch (error) {
        console.error("Dashboard data error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    navigate('/user-login');
  };

  const downloadQRCode = () => {
    // API call to generate/download QR code
    window.open(`/api/vehicles/${userData.vehicleId}/qrcode`, '_blank');
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
        {/* Fuel Quota Card */}
        <div className="dashboard-card quota-card">
          <div className="card-header">
            <FontAwesomeIcon icon={faGasPump} className="card-icon" />
            <h3>Weekly Fuel Quota</h3>
          </div>
          <div className="quota-meter">
            <div 
              className="quota-progress"
              style={{ width: `${quotaInfo ? (quotaInfo.used/quotaInfo.total)*100 : 0}%` }}
            ></div>
            <div className="quota-numbers">
              <span className="remaining">
                {quotaInfo ? quotaInfo.total - quotaInfo.used : '--'}L remaining
              </span>
              <span className="total">of {quotaInfo?.total || '--'}L</span>
            </div>
          </div>
          <div className="quota-dates">
            Valid: {quotaInfo?.weekStart || '--'} to {quotaInfo?.weekEnd || '--'}
          </div>
        </div>

        {/* QR Code Card */}
        <div className="dashboard-card qr-card">
          <div className="card-header">
            <FontAwesomeIcon icon={faQrcode} className="card-icon" />
            <h3>Vehicle QR Code</h3>
          </div>
          <div className="qr-container">
            {userData?.qrCode ? (
              <img src={userData.qrCode} alt="Vehicle QR Code" className="qr-image" />
            ) : (
              <p>No QR code generated</p>
            )}
          </div>
          <button onClick={downloadQRCode} className="download-btn">
            Download QR Code
          </button>
        </div>

        {/* Recent Transactions */}
        <div className="dashboard-card transactions-card">
          <div className="card-header">
            <FontAwesomeIcon icon={faHistory} className="card-icon" />
            <h3>Recent Fuel Transactions</h3>
          </div>
          <div className="transactions-list">
            {recentTransactions.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Station</th>
                    <th>Amount (L)</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((txn, index) => (
                    <tr key={index}>
                      <td>{new Date(txn.date).toLocaleDateString()}</td>
                      <td>{txn.stationName}</td>
                      <td>{txn.amount}L</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-transactions">No recent transactions found</p>
            )}
          </div>
          <button 
            onClick={() => navigate('/transactions')} 
            className="view-all-btn"
          >
            View All Transactions
          </button>
        </div>
      </div>
    </div>
  );
};

const AuthenticatedDashboard = withAuth(Dashboard);  
export default AuthenticatedDashboard;