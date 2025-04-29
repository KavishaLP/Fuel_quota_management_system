import React from 'react';
import { useNavigate } from 'react-router-dom';
import withAuth from '../withAuth';

const Dashboard = ({ userId }) => {
    console.log("Current user ID:", userId);
    console.log("Stored fffffffffff:", localStorage.getItem('token'))
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem('userData'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    navigate('/user-login');
  };

  return (
    <div className="dashboard-container">
      <h2>Welcome, User ID: {userId}</h2>
      {userData?.name && <p>Name: {userData.name}</p>}
      {userData?.vehicleNumber && <p>Vehicle: {userData.vehicleNumber}</p>}
      
      <button onClick={handleLogout} className="logout-btn">
        Logout
      </button>
    </div>
  );
};

const AuthenticatedDashboard = withAuth(Dashboard);  
export default AuthenticatedDashboard;