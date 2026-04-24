import React, { useState } from 'react';
import AddUser from './AddUser';
import AddSubject from './AddSubject';
import UsersList from './UsersList';
import '../styles/Admin.css'; // Ensure this path is correct

const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('viewUsers');

  return (
    <div className="admin-glass-wrapper">
      {/* Background Orbs for the Glassmorphism effect */}
      <div className="admin-orb admin-orb-1"></div>
      <div className="admin-orb admin-orb-2"></div>

      <div className="admin-layout">
        {/* Sidebar Navigation */}
        <nav className="admin-sidebar">
          <div className="sidebar-header">
            <div className="admin-logo-icon">🛡️</div>
            <h2>EduTrack <span>Admin</span></h2>
          </div>

          <ul className="sidebar-menu">
            <li
              className={activeTab === 'viewUsers' ? 'active' : ''}
              onClick={() => setActiveTab('viewUsers')}
            >
              <span className="menu-icon">👥</span> View All Users
            </li>

            <li
              className={activeTab === 'users' ? 'active' : ''}
              onClick={() => setActiveTab('users')}
            >
              <span className="menu-icon">👤</span> Add New User
            </li>

            <li
              className={activeTab === 'subjects' ? 'active' : ''}
              onClick={() => setActiveTab('subjects')}
            >
              <span className="menu-icon">📚</span> Manage Subjects
            </li>
          </ul>

          <div className="sidebar-footer">
            <button className="admin-logout-btn" onClick={onLogout}>
              <span>🚪</span> Logout
            </button>
          </div>
        </nav>

        {/* Main Content Dashboard Area */}
        <main className="admin-main-content">
          <header className="content-header">
            <div className="header-title-area">
               <h1>{activeTab === 'viewUsers' ? 'User Management' :
                 activeTab === 'users' ? 'Onboard New User' : 'Subject Directory'}</h1>
               <p className="breadcrumb">Dashboard / {activeTab}</p>
            </div>
            <div className="admin-status-badge">
                <span className="status-dot"></span> System Active
            </div>
          </header>

          <div className="content-body">
            {activeTab === 'viewUsers' && <UsersList />}
            {activeTab === 'users' && <AddUser />}
            {activeTab === 'subjects' && <AddSubject />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;