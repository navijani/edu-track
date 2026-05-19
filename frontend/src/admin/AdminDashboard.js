import React, { useState } from 'react';
import AddUser from './AddUser';
import AddSubject from './AddSubject';
import UsersList from './UsersList';
import ManageAdmins from './ManageAdmins'; // Added ManageAdmins import
import '../styles/Admin.css';

const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('viewUsers');

  return (
    <div className="admin-glass-wrapper">
      {/* Background Effects */}
      <div className="admin-orb admin-orb-1"></div>
      <div className="admin-orb admin-orb-2"></div>

      <div className="admin-layout">
        {/* Sidebar */}
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

            <li
              className={activeTab === 'manageAdmins' ? 'active' : ''}
              onClick={() => setActiveTab('manageAdmins')}
            >
              <span className="menu-icon">🛡️</span> Manage Admins
            </li>
          </ul>

          <div className="sidebar-footer">
            <button className="admin-logout-btn" onClick={onLogout}>
              <span>🚪</span> Logout
            </button>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="admin-main-content">
          <header className="content-header">
            <h1>
              {activeTab === 'viewUsers' ? 'User Management' :
               activeTab === 'users' ? 'Onboard New User' : 
               activeTab === 'manageAdmins' ? 'Manage Administrators' : 'Subject Directory'}
            </h1>
            <div className="admin-status">System Active</div>
          </header>

          <div className="content-body">
            {activeTab === 'viewUsers' && <UsersList />}
            {activeTab === 'users' && <AddUser />}
            {activeTab === 'subjects' && <AddSubject />}
            {activeTab === 'manageAdmins' && <ManageAdmins />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;