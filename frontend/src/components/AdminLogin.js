import React from 'react';

const AdminLogin = ({ onAdminClick }) => (
  <div className="admin-login-corner">
    <button onClick={onAdminClick} className="admin-btn-small">
      Admin Login
    </button>
  </div>
);

export default AdminLogin;