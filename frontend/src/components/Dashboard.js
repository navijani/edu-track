import React from 'react';


const Dashboard = ({ role, onLogout }) => {
  return (
    <div className="dashboard-container">
      <header>
        <h2>{role} Dashboard</h2>
        <button onClick={onLogout}>Logout</button>
      </header>

      {role === 'TEACHER' && (
        <div className="features">
          <button>Upload Learning Modules</button> [cite: 58]
          <button>Monitor Student Activity</button> [cite: 61]
          <button>Identify Weak Students</button> [cite: 64]
        </div>
      )}

      {role === 'STUDENT' && (
        <div className="features">
          <button>Access Lessons</button> [cite: 66]
          <button>Attempt Quizzes</button> [cite: 72]
          <button>Track My Progress</button> [cite: 48]
        </div>
      )}

      {role === 'PARENT' && (
        <div className="features">
          <button>View Progress Reports</button> [cite: 76]
          <button>Check Learning Consistency</button> [cite: 78]
        </div>
      )}
    </div>
  );
};

export default Dashboard;