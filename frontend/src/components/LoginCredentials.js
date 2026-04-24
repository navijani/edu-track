import React, { useState } from 'react';
import axios from 'axios';
import '../styles/RoleSelection.css'; 

const LoginCredentials = ({ role, onBack, onSuccess }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // POSTing to the central /login endpoint
      const response = await axios.post('http://localhost:8080/api/users/login', {
        id: userId,
        password: password,
        role: role
      });

      if (response.data && response.data.success) {
        onSuccess(response.data); 
      }
    } catch (error) {
      // Show the actual error message from Java (e.g., "Invalid Admin Credentials")
      const msg = error.response?.data?.message || "Invalid Login Attempt";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-overlay">
      <div className="login-glass-card">
        <button className="back-arrow" onClick={onBack}>←</button>
        <div className="login-header">
          <div className="role-icon-circle">
            {role === 'ADMIN' ? '🛡️' : role === 'TEACHER' ? '👨‍🏫' : role === 'STUDENT' ? '🎓' : '👪'}
          </div>
          <h2>{role} <span>Login</span></h2>
        </div>
        <form onSubmit={handleLogin} className="login-form">
          <div className="input-field-wrapper">
            <label>Identification ID</label>
            <input type="text" value={userId} onChange={(e)=>setUserId(e.target.value)} required />
          </div>
          <div className="input-field-wrapper">
            <label>Password</label>
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="login-primary-btn" disabled={loading}>
            {loading ? 'Processing...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginCredentials;