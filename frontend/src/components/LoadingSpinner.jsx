import React from 'react';

const LoadingSpinner = ({ fullPage = false }) => {
  if (fullPage) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }
  return (
    <div className="loading-overlay">
      <div className="spinner" />
    </div>
  );
};

export default LoadingSpinner;
