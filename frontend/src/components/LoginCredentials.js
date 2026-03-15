import React, { useState } from 'react';
import axios from 'axios';

const LoginCredentials = ({ role, onBack, onSuccess }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Send credentials to Java Backend
      const response = await axios.post('http://localhost:8080/api/users/login', {
        id: userId,
        password: password,
        role: role
      });

      // Check if login is successful and PASS THE DATA to App.js
      if (response.data && response.data.success) {
        onSuccess(response.data); // <--- THIS IS THE KEY FIX
      }
    } catch (error) {
      alert("Invalid ID or Password for the " + role + " role.");
    }
  };

  return (
    <div className="login-credentials-container">
      <h2>{role} Login</h2>
      <form onSubmit={handleLogin}>
        <input 
          type="text" 
          placeholder="Enter User ID (e.g., 240235N)" 
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required 
        />
        <input 
          type="password" 
          placeholder="Enter Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required 
        />
        <button type="submit">Log In</button>
      </form>
      <button className="back-link" onClick={onBack}>Change Role</button>
    </div>
  );
};

export default LoginCredentials;