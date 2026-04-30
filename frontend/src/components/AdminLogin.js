import React, { useState } from 'react';
import './AdminLogin.css';

const AdminLogin = ({ onLoginSuccess, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === "2004@gmail.com" && password === "123") {
      setEmail('');
      setPassword('');
      onLoginSuccess();
    } else {
      alert("Unauthorized Access!");
    }
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-content">
        <h2>Admin Login</h2>
        <form onSubmit={handleLogin} className="admin-modal-form">
          <input 
            type="email" 
            placeholder="Enter Admin Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input 
            type="password" 
            placeholder="Enter Admin Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="admin-modal-actions">
            <button type="submit" className="btn-primary">Login</button>
            <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;