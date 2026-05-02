import React from 'react';
import '../styles/RoleSelection.css';

const RoleSelection = ({ onSelect, onContactClick }) => ( // Added onContactClick prop
  <div className="glass-overlay">

    {/* Animated background orbs */}
    <div className="glass-orb glass-orb-1"></div>
    <div className="glass-orb glass-orb-2"></div>
    <div className="glass-orb glass-orb-3"></div>

    <div className="glass-container">
      <h2 className="glass-title">Welcome to EduTrack</h2>
      <p className="glass-subtitle">Select your account type to continue</p>

      <div className="glass-grid">

        <button className="glass-btn" onClick={() => onSelect('STUDENT')}>
          <span className="glass-icon">👨‍🎓</span>
          <h3>Student</h3>
          <p>Access courses and track progress</p>
        </button>

        <button className="glass-btn" onClick={() => onSelect('TEACHER')}>
          <span className="glass-icon">👨‍🏫</span>
          <h3>Teacher</h3>
          <p>Manage classes and assignments</p>
        </button>

        <button className="glass-btn" onClick={() => onSelect('PARENT')}>
          <span className="glass-icon">👪</span>
          <h3>Parent</h3>
          <p>View academic updates</p>
        </button>

      </div>

      {/* --- ADDED CONTACT SECTION --- */}
      <div className="glass-footer-contact" style={{ marginTop: '40px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '10px' }}>If you need some help, contact the administration panel.</p>
        <button
          className="admin-btn-small"
          onClick={onContactClick}
          style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid white', color: 'white', padding: '8px 20px', borderRadius: '20px', cursor: 'pointer' }}
        >
          Contact Us
        </button>
      </div>
    </div>
  </div>
);

export default RoleSelection;