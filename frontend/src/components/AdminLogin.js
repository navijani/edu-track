import React, { useState } from 'react';
import '../styles/RoleSelection.css';

const AdminLogin = ({ onBack, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === "2004@gmail.com" && password === "123") {
      onSuccess(); 
    } else {
      alert("Unauthorized Access! Incorrect email or password.");
    }
  };

  return (
    <div className="glass-overlay">
      <div className="glass-orb glass-orb-1"></div>
      <div className="glass-orb glass-orb-2"></div>
      <div className="glass-orb glass-orb-3"></div>

      <div className="login-glass-card">
        <button className="back-arrow" onClick={onBack}>←</button>
        
        <div className="login-header">
          <div className="role-icon-circle">🛡️</div>
          <h2>Admin <span>Login</span></h2>
          <p>Access the System Control Panel</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-field-wrapper">
            <label>Administrator Email</label>
            <input 
              type="email" 
              placeholder="admin@edutrack.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="input-field-wrapper">
            <label>Security Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="login-primary-btn">
            Authenticate
          </button>
        </form>

        <div className="login-footer">
          <p>Restricted area. Authorized personnel only.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;