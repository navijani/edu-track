import React, { useState } from 'react';
import axios from 'axios';
import '../styles/RoleSelection.css'; // Reusing your premium background styles

const LoginCredentials = ({ role, onBack, onSuccess }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8080/api/users/login', {
        id: userId,
        password: password,
        role: role
      });

      if (response.data && response.data.success) {
        onSuccess(response.data); 
      }
    } catch (error) {
      alert("Invalid ID or Password for the " + role + " role.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-overlay">
      {/* Background Animated Orbs */}
      <div className="glass-orb glass-orb-1"></div>
      <div className="glass-orb glass-orb-2"></div>
      <div className="glass-orb glass-orb-3"></div>

      <div className="login-glass-card">
        <button className="back-arrow" onClick={onBack}>←</button>
        
        <div className="login-header">
          <div className="role-icon-circle">
            {role === 'ADMIN' ? '🛡️' : role === 'TEACHER' ? '👨‍🏫' : role === 'STUDENT' ? '🎓' : '👪'}
          </div>
          <h2>{role} <span>Login</span></h2>
          <p>Access your EduTrack dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-field-wrapper">
            <label>Identification ID</label>
            <input 
              type="text" 
              placeholder="e.g., 240235N" 
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
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

          <button type="submit" className="login-primary-btn" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <p>Need help? Contact system administrator</p>
        </div>
      </div>
    </div>
  );
};

export default LoginCredentials;