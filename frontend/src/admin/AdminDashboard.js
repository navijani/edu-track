import React, { useState } from 'react';
import AddUser from './AddUser';
import AddSubject from './AddSubject';
import UsersList from './UsersList'; // 1. Import the new component
import './Admin.css'; 

const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('viewUsers'); // Default to showing the user list

  return (
    <div className="admin-layout">
      {/* Left Sidebar */}
      <nav className="admin-sidebar">
        <div className="sidebar-header">
          <h2>EduTrack Admin</h2>
        </div>
        <ul className="sidebar-menu">
          {/* New Tab for Viewing the Table */}
          <li 
            className={activeTab === 'viewUsers' ? 'active' : ''} 
            onClick={() => setActiveTab('viewUsers')}
          >
            View All Users
          </li>
          
          <li 
            className={activeTab === 'users' ? 'active' : ''} 
            onClick={() => setActiveTab('users')}
          >
            Add New User
          </li>
          
          <li 
            className={activeTab === 'subjects' ? 'active' : ''} 
            onClick={() => setActiveTab('subjects')}
          >
            Manage Subjects
          </li>
        </ul>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </nav>

      {/* Main Content Area */}
      <main className="admin-main-content">
        {/* 2. Conditionally render the correct component based on activeTab */}
        {activeTab === 'viewUsers' && <UsersList />}
        {activeTab === 'users' && <AddUser />}
        {activeTab === 'subjects' && <AddSubject />}
      </main>
    </div>
  );
};

export default AdminDashboard;