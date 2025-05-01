import React from 'react';
import withAuth from '../withAuth';

const shedOwnerDashboard = () => {
  return (
    <div>
      HIIII
    </div>
  )
}

const AuthenticatedshedOwnerDashboard = withAuth(shedOwnerDashboard);  
export default AuthenticatedshedOwnerDashboard;
