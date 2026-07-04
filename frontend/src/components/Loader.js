import React from 'react';
import '../styles/Loader.css';

const Loader = ({ text = "Loading...", type = "default" }) => {
  // type can be "default", "inline", "full-screen"
  return (
    <div className={`loader-container ${type}`}>
      <div className="loader-spinner">
        <div className="loader-spinner-inner"></div>
      </div>
      {text && <div className="loader-text">{text}</div>}
    </div>
  );
};

export default Loader;
