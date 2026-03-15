import React, { useState } from 'react';
import '../admin/Admin.css';

import TeacherContents from './TeacherContents';
import TeacherAddContent from './TeacherAddContent';
import TeacherStudents from './TeacherStudents';
import TeacherMessages from './TeacherMessages';
// 1. Import the new Zoom component
import TeacherZoomSchedule from './TeacherZoomSchedule';
import TeacherDashboardHome from './TeacherDashboardHome';
import TeacherParentsChat from './TeacherParentsChat';

const TeacherDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="admin-layout">
      {/* Teacher Sidebar */}
      <nav className="admin-sidebar" style={{ backgroundColor: '#2c3e50' }}>
        <div className="sidebar-header">
          <h2>Teacher Panel</h2>
        </div>
        <ul className="sidebar-menu">
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
          {/* 2. Add the new Zoom tab to the sidebar */}
          <li
            className={activeTab === 'zoom' ? 'active' : ''}
            onClick={() => setActiveTab('zoom')}
          >
            Zoom Meetings
          </li>
          <li
            className={activeTab === 'parentChat' ? 'active' : ''}
            onClick={() => setActiveTab('parentChat')}
          >
            Chat with Parents
          </li>
        </ul>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </nav>

      {/* Teacher Main Content Area */}
      <main className="admin-main-content">

        {activeTab === 'dashboard' && (
          <TeacherDashboardHome user={user} />
        )}

        {activeTab === 'contents' && <TeacherContents user={user} />}
        {activeTab === 'addContents' && <TeacherAddContent user={user} />}
        {activeTab === 'students' && <TeacherStudents user={user} />}
        {activeTab === 'messages' && <TeacherMessages user={user} />}
        {activeTab === 'zoom' && <TeacherZoomSchedule user={user} />}
        {activeTab === 'parentChat' && <TeacherParentsChat user={user} />}

      </main>
    </div>
  );
};

export default TeacherDashboard;