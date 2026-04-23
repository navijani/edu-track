import React, { useState } from 'react';

const AdminLoginPage = ({ onAdminSuccess, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (email === "sameera2004@gmail.com" && password === "123456") {
      onAdminSuccess();
    } else {
      alert("වැරදි ඇඩ්මින් දත්ත! කරුණාකර නැවත උත්සාහ කරන්න.");
    }
  };

  return (
    <div className="glass-overlay">
      <div className="glass-container content-fade-in">
        <h2 className="glass-title">Admin Portal</h2>
        <p className="glass-subtitle">Enter credentials to access dashboard</p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
          <input 
            type="email" 
            placeholder="Admin Email" 
            className="glass-btn"
            style={{ background: 'rgba(255,255,255,0.1)', color: 'white', textAlign: 'left', paddingLeft: '20px' }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="glass-btn"
            style={{ background: 'rgba(255,255,255,0.1)', color: 'white', textAlign: 'left', paddingLeft: '20px' }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
          <button type="submit" className="glass-btn" style={{ background: '#4a90e2', fontWeight: 'bold' }}>
            Login as Admin
          </button>
        </form>
        
        <button onClick={onBack} style={{ marginTop: '20px', background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', textDecoration: 'underline' }}>
          Back to Selection
        </button>
      </div>
    </div>
  );
};

export default AdminLoginPage;