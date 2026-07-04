import React from 'react';
import '../styles/Loader.css';

const Loader = ({ text = "Loading...", type = "default" }) => {
  return (
    <div className={`loader-container ${type}`}>
      <div className="loader-spinner"></div>
      {text && <div className="loader-text">{text}</div>}
    </div>
  );
};

export default Loader;
