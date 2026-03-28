import React from 'react';
import '../styles/IntroScreen.css';

const IntroScreen = ({ onLogin }) => (
  <div className="intro-overlay">
    
    {/* Animated floating background orbs */}
    <div className="orb orb-1"></div>
    <div className="orb orb-2"></div>
    <div className="orb orb-3"></div>
    
    {/* The Premium Glass Card */}
    <div className="glass-card">
      <div className="content-fade-in">
        
        <div className="icon-wrapper">
          <span className="icon-wrap">🎓</span>
        </div>
        
        <h1 className="logo-title">
          EduTrack
        </h1>
        
        <p className="subtitle">
          Smart Learning System <br/>
          <span className="highlight">Digital Platform for Progress Tracking</span>
        </p>
        
        <button className="btn-glass-login" onClick={onLogin}>
          <span>Continue to Login</span>
          <span className="arrow">→</span>
        </button>
        
      </div>
    </div>
  </div>
);

export default IntroScreen;