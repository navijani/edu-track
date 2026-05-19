import React, { useState } from 'react';
import axios from 'axios';
import '../styles/RoleSelection.css';

const LoginCredentials = ({ role, onBack, onSuccess, onContactClick }) => { // Added onContactClick prop
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(''); // Clear previous error
    try {
      const response = await axios.post('https://edu-track-c6ml.onrender.com/api/users/login', {
        id: userId,
        password: password,
        role: role
      });

      if (response.data && response.data.success) {
        if (response.data.token) {
          localStorage.setItem('eduToken', response.data.token);
        }
        onSuccess(response.data);
      } else {
        setError(response.data.message || "Authentication failed. Please check your credentials.");
      }
    } catch (err) {
      setError("Invalid ID or Password for the " + role + " role.");
    } finally {
      setLoading(false);
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
              onChange={(e) => {
                setUserId(e.target.value);
                if (error) setError(''); // Clear error on type
              }}
              required
            />
          </div>

          <div className="input-field-wrapper">
            <label>Security Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(''); // Clear error on type
              }}
              required
            />
          </div>

          {error && <div className="login-error-msg">⚠️ {error}</div>}

          <button type="submit" className="login-primary-btn" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* --- UPDATED FOOTER TO BE CLICKABLE --- */}
        <div className="login-footer">
          <p
            onClick={onContactClick}
            style={{ cursor: 'pointer', textDecoration: 'underline', color: '#64ffda' }}
          >
            Need help? Contact system administrator
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginCredentials;