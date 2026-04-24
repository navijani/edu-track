import React from 'react'
import '../styles/RoleSelection.css'; // We will create this beautiful CSS next

const RoleSelection = ({ onSelect }) => (
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
    </div>
  </div>
);

export default RoleSelection;