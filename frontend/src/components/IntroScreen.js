import React from 'react';


const IntroScreen = ({ onLogin }) => (
  <div className="intro-container">
    <h1>EduTrack</h1>
    <p>Smart Learning System - Digital Platform for Progress Tracking</p> 
    <button className="btn-primary" onClick={onLogin}>Login</button>
  </div>
);

export default IntroScreen;