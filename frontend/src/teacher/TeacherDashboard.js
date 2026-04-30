import React, { useState } from 'react';
import '../styles/Teacher.css'; // All teacher-specific CSS classes (t-* prefix)

// ── Page-level imports ────────────────────────────────────────────────────────
import TeacherContents      from './TeacherContents';      // Uploaded content list
import TeacherAddContent    from './TeacherAddContent';    // Content upload hub
import TeacherStudents      from './TeacherStudents';      // Class roster + progress
import TeacherMessages      from './TeacherMessages';      // Student messaging
import TeacherZoomSchedule  from './TeacherZoomSchedule';  // Zoom meeting scheduler
import TeacherDashboardHome from './TeacherDashboardHome'; // Overview / quick stats
import TeacherParentsChat   from './TeacherParentsChat';   // Parent chat interface
import UserProfile          from '../components/UserProfile'; // My Profile + Change Password

/**
 * TeacherDashboard – Top-level layout component for the Teacher role.
 *
 * Props:
 *   user     {object}   Logged-in teacher object returned by the login API.
 *                       Contains at minimum: id, name, role, subject.
 *   onLogout {function} Callback invoked when the teacher clicks "Logout".
 *                       Clears the auth state in the parent App component.
 *
 * Layout:
 *   ┌──────────────────────────────────────────────────────────────────┐
 *   │  <nav> sidebar              │  <main> content area               │
 *   │  ─ Logo + "Teacher" label   │  ─ Header: greeting + date         │
 *   │  ─ Navigation <ul> (×8)     │  ─ Active tab component            │
 *   │  ─ Logout button            │                                    │
 *   └──────────────────────────────────────────────────────────────────┘
 *
 * Tab IDs → Components:
 *   'dashboard'   → <TeacherDashboardHome>   (overview / stats)
 *   'contents'    → <TeacherContents>        (list of uploaded content)
 *   'addContents' → <TeacherAddContent>      (upload videos / quizzes / docs)
 *   'students'    → <TeacherStudents>        (student roster + progress view)
 *   'messages'    → <TeacherMessages>        (student message threads)
 *   'zoom'        → <TeacherZoomSchedule>    (schedule / manage Zoom meetings)
 *   'parentChat'  → <TeacherParentsChat>     (parent communication)
 *   'profile'     → <UserProfile>            (profile info + change password)
 */
const TeacherDashboard = ({ user, onLogout }) => {

    // `activeTab` tracks which section is currently displayed in the main area.
    // Defaults to 'dashboard' so the overview is visible on first load.
    const [activeTab, setActiveTab] = useState('dashboard');

    return (
        /*
         * Outer wrapper: provides the animated gradient background
         * and contains the decorative orb pseudo-elements (CSS class).
         */
        <div className="teacher-glass-wrapper">

            {/* Animated background orbs – purely decorative, handled by CSS */}
            <div className="t-orb t-orb-1"></div>
            <div className="t-orb t-orb-2"></div>

            {/* Two-column layout: sidebar on the left, main area on the right */}
            <div className="teacher-layout">

                {/* ── SIDEBAR ─────────────────────────────────────────────────── */}
                <nav className="teacher-sidebar">

                    {/* Logo section */}
                    <div className="t-sidebar-header">
                        <div className="t-logo-icon">🎓</div>
                        <h2>EduTrack <span>Teacher</span></h2>
                    </div>

                    {/*
                      * Navigation list
                      * Each <li> sets `activeTab` on click and gets the 'active'
                      * CSS class when it matches the current tab (highlighted in blue).
                      */}
                    <ul className="t-sidebar-menu">
                        <li className={activeTab === 'dashboard'   ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
                            <span className="t-icon">📊</span> My Dashboard
                        </li>
                        <li className={activeTab === 'contents'    ? 'active' : ''} onClick={() => setActiveTab('contents')}>
                            <span className="t-icon">📚</span> View Contents
                        </li>
                        <li className={activeTab === 'addContents' ? 'active' : ''} onClick={() => setActiveTab('addContents')}>
                            <span className="t-icon">📝</span> Add Contents
                        </li>
                        <li className={activeTab === 'students'    ? 'active' : ''} onClick={() => setActiveTab('students')}>
                            <span className="t-icon">👥</span> My Students
                        </li>
                        <li className={activeTab === 'messages'    ? 'active' : ''} onClick={() => setActiveTab('messages')}>
                            <span className="t-icon">💬</span> Messages
                        </li>
                        <li className={activeTab === 'zoom'        ? 'active' : ''} onClick={() => setActiveTab('zoom')}>
                            <span className="t-icon">📹</span> Zoom Meetings
                        </li>
                        <li className={activeTab === 'parentChat'  ? 'active' : ''} onClick={() => setActiveTab('parentChat')}>
                            <span className="t-icon">🤝</span> Parent Chat
                        </li>
                        {/* Profile tab: opens UserProfile which includes Change Password */}
                        <li className={activeTab === 'profile'     ? 'active' : ''} onClick={() => setActiveTab('profile')}>
                            <span className="t-icon">👤</span> My Profile
                        </li>
                    </ul>

                    {/* Logout button pinned to the bottom of the sidebar */}
                    <div className="t-sidebar-footer">
                        <button className="t-logout-btn" onClick={onLogout}>
                            <span>🚪</span> Logout
                        </button>
                    </div>
                </nav>

                {/* ── MAIN CONTENT AREA ───────────────────────────────────────── */}
                <main className="teacher-main-area">

                    {/* Header bar: personalised greeting and today's date */}
                    <header className="t-content-header">
                        <div className="t-welcome">
                            {/*
                              * Optional chaining (user?.name) prevents a crash if the
                              * user object hasn't loaded yet; falls back to 'Professor'.
                              */}
                            <h1>Hello, <span>{user?.name || 'Professor'}</span></h1>
                            {/* Display today's full date, e.g. "Wednesday, April 30" */}
                            <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                        </div>
                        <div className="t-status-tag">Academy Instructor</div>
                    </header>

                    {/* Content body – conditionally renders the active tab's component */}
                    <div className="t-content-body">
                        {/* Dashboard overview */}
                        {activeTab === 'dashboard'   && <TeacherDashboardHome user={user} />}
                        {/* Uploaded content browser */}
                        {activeTab === 'contents'    && <TeacherContents user={user} />}
                        {/* Content upload form hub */}
                        {activeTab === 'addContents' && <TeacherAddContent user={user} />}
                        {/* Student roster and progress tracker */}
                        {activeTab === 'students'    && <TeacherStudents user={user} />}
                        {/* Student-teacher messaging */}
                        {activeTab === 'messages'    && <TeacherMessages user={user} />}
                        {/* Zoom meeting scheduler */}
                        {activeTab === 'zoom'        && <TeacherZoomSchedule user={user} />}
                        {/* Parent communication chat */}
                        {activeTab === 'parentChat'  && <TeacherParentsChat user={user} />}
                        {/*
                          * Profile page: fetches full profile from the backend and
                          * embeds the Change Password form at the bottom.
                          */}
                        {activeTab === 'profile'     && <UserProfile user={user} />}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default TeacherDashboard;