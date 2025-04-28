// src/components/LoadingIndicator.jsx
import React from 'react';
import '../style/LoadingIndicator.css'; // Import the CSS file

const LoadingIndicator = () => {
  return (
    <div className="loading-container">
      <div className="loading-dots">
        <span className="dot"></span>
        <span className="dot"></span>
        <span className="dot"></span>
      </div>
    </div>
  );
};

export default LoadingIndicator;
