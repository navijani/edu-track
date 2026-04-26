import React, { useState } from 'react';
import '../styles/Teacher.css'; 

import TeacherContents from './TeacherContents';
import TeacherAddContent from './TeacherAddContent';
import TeacherStudents from './TeacherStudents';
import TeacherMessages from './TeacherMessages';
import TeacherZoomSchedule from './TeacherZoomSchedule';
import TeacherDashboardHome from './TeacherDashboardHome';
import TeacherParentsChat from './TeacherParentsChat';

const TeacherDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="teacher-glass-wrapper">
      {/* Background Animated Orbs */}
      <div className="t-orb t-orb-1"></div>
      <div className="t-orb t-orb-2"></div>

      <div className="teacher-layout">
        {/* Sidebar */}
        <nav className="teacher-sidebar">
          <div className="t-sidebar-header">
            <div className="t-logo-icon">🎓</div>
            <h2>EduTrack <span>Teacher</span></h2>
          </div>

          <ul className="t-sidebar-menu">
            <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
              <span className="t-icon">📊</span> My Dashboard
            </li>
            <li className={activeTab === 'contents' ? 'active' : ''} onClick={() => setActiveTab('contents')}>
              <span className="t-icon">📚</span> View Contents
            </li>
            <li className={activeTab === 'addContents' ? 'active' : ''} onClick={() => setActiveTab('addContents')}>
              <span className="t-icon">📝</span> Add Contents
            </li>
            <li className={activeTab === 'students' ? 'active' : ''} onClick={() => setActiveTab('students')}>
              <span className="t-icon">👥</span> My Students
            </li>
            <li className={activeTab === 'messages' ? 'active' : ''} onClick={() => setActiveTab('messages')}>
              <span className="t-icon">💬</span> Messages
            </li>
            <li className={activeTab === 'zoom' ? 'active' : ''} onClick={() => setActiveTab('zoom')}>
              <span className="t-icon">📹</span> Zoom Meetings
            </li>
            <li className={activeTab === 'parentChat' ? 'active' : ''} onClick={() => setActiveTab('parentChat')}>
              <span className="t-icon">🤝</span> Parent Chat
            </li>
          </ul>

          <div className="t-sidebar-footer">
            <button className="t-logout-btn" onClick={onLogout}>
              <span>🚪</span> Logout
            </button>
          </div>
        </nav>

        {/* Main Area */}
        <main className="teacher-main-area">
          <header className="t-content-header">
            <div className="t-welcome">
              <h1>Hello, <span>{user?.name || 'Professor'}</span></h1>
              <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="t-status-tag">Academy Instructor</div>
          </header>

          <div className="t-content-body">
            {activeTab === 'dashboard' && <TeacherDashboardHome user={user} />}
            {activeTab === 'contents' && <TeacherContents user={user} />}
            {activeTab === 'addContents' && <TeacherAddContent user={user} />}
            {activeTab === 'students' && <TeacherStudents user={user} />}
            {activeTab === 'messages' && <TeacherMessages user={user} />}
            {activeTab === 'zoom' && <TeacherZoomSchedule user={user} />}
            {activeTab === 'parentChat' && <TeacherParentsChat user={user} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboard;