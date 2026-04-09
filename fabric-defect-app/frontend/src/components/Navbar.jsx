import React from 'react';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <span className="navbar-icon" aria-hidden="true">🧵</span>
          <span className="navbar-title">FabricAI</span>
          <span className="navbar-badge">Detection System</span>
        </div>
        <div className="navbar-status">
          <span className="status-dot" aria-hidden="true"></span>
          <span className="status-label">AI Model Active</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
