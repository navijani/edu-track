import React from 'react';


const RoleSelection = ({ onSelect }) => (
  <div className="role-container">
    <h2>Select Your Role</h2>
    <div className="role-grid">
      <button onClick={() => onSelect('STUDENT')}>Student</button>
      <button onClick={() => onSelect('TEACHER')}>Teacher</button>
      <button onClick={() => onSelect('PARENT')}>Parent</button>
    </div>
  </div>
);

export default RoleSelection;