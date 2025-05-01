/* eslint-disable no-unused-vars */

import React from 'react';
import withAuth2 from '../withAuth2';

const shedOwnerDashboard = ({ userId }) => {
  return (
    <div>
      { userId }
    </div>
  )
}

const AuthenticatedshedOwnerDashboard = withAuth2(shedOwnerDashboard);  
export default AuthenticatedshedOwnerDashboard;
