import React from 'react';
import '../styles/RoleSelection.css';

const RoleSelection = ({ onSelect, onContactClick }) => (
  /* FIX: Ensure the overlay allows scrolling for small screens */
  <div className="glass-overlay" style={{
    display: 'block',
    overflowY: 'auto',
    height: '100vh',
    padding: '20px 0'
  }}>

    {/* Animated background orbs */}
    <div className="glass-orb glass-orb-1"></div>
    <div className="glass-orb glass-orb-2"></div>
    <div className="glass-orb glass-orb-3"></div>

    {/* FIX: Use margin auto to center the card horizontally and allow it to grow vertically */}
    <div className="glass-container" style={{
      margin: '40px auto',
      position: 'relative',
      minHeight: 'auto'
    }}>
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

      {/* Contact Section at the bottom */}
      <div style={{
        marginTop: '40px',
        textAlign: 'center',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        paddingTop: '20px',
        paddingBottom: '20px'
      }}>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '10px', fontSize: '0.9rem' }}>
          If you need some help, contact the administration panel.
        </p>
        <button
          className="admin-btn-small"
          onClick={onContactClick}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.5)',
            color: 'white',
            padding: '10px 25px',
            borderRadius: '25px',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
          onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
        >
          Contact Support
        </button>
      </div>
    </div>
  </div>
);

export default RoleSelection;