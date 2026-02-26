import React, { useState } from 'react';
import '../admin/Admin.css'; 

// 1. Import your new separate UI components
import TeacherContents from './TeacherContents';
import TeacherAddContent from './TeacherAddContent';
import TeacherStudents from './TeacherStudents';
import TeacherMessages from './TeacherMessages';

const TeacherDashboard = ({ user, onLogout }) => {
  // 2. State to track which tab is currently selected
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="admin-layout">
      {/* Teacher Sidebar */}
      <nav className="admin-sidebar" style={{ backgroundColor: '#2c3e50' }}>
        <div className="sidebar-header">
          <h2>Teacher Panel</h2>
        </div>
        <ul className="sidebar-menu">
          {/* 3. Update the menu to change the activeTab state on click */}
          <li 
            className={activeTab === 'dashboard' ? 'active' : ''} 
            onClick={() => setActiveTab('dashboard')}
          >
            My Dashboard
          </li>
          <li 
            className={activeTab === 'contents' ? 'active' : ''} 
            onClick={() => setActiveTab('contents')}
          >
            View Contents
          </li>
          <li 
            className={activeTab === 'addContents' ? 'active' : ''} 
            onClick={() => setActiveTab('addContents')}
          >
            Add Contents
          </li>
          <li 
            className={activeTab === 'students' ? 'active' : ''} 
            onClick={() => setActiveTab('students')}
          >
            My Students
          </li>
          <li 
            className={activeTab === 'messages' ? 'active' : ''} 
            onClick={() => setActiveTab('messages')}
          >
            Messages
          </li>
        </ul>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </nav>

      {/* Teacher Main Content Area */}
      <main className="admin-main-content">
        
        {/* 4. Conditionally render the correct component based on the active tab */}
        {activeTab === 'dashboard' && (
          <div className="admin-card">
            <h2>Welcome, Teacher {user.name}!</h2>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Assigned Subject:</strong> {user.subject}</p>
            <hr />
            <h3>Recent Activity</h3>
            <p>No new updates for your {user.subject} classes yet.</p>
          </div>
        )}

        {/* Passing the 'user' object so the components know the teacher's subject! */}
        {activeTab === 'contents' && <TeacherContents user={user} />}
        {activeTab === 'addContents' && <TeacherAddContent user={user} />}
        {activeTab === 'students' && <TeacherStudents user={user} />}
        {activeTab === 'messages' && <TeacherMessages user={user} />}

      </main>
    </div>
  );
};

export default TeacherDashboard;