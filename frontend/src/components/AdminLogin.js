import React from 'react';

const AdminLogin = ({ onAdminClick }) => (
  <div className="admin-login-corner">
    {/* This calls the function that will set the role to ADMIN in your main App file */}
    <button onClick={() => onAdminClick('ADMIN')} className="admin-btn-small">
      🛡️ Admin Login
    </button>
  </div>
);

export default AdminLogin;