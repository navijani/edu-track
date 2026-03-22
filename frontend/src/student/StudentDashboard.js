import React, { useState } from 'react';
import StudentSubjects from './StudentSubjects';
import StudentSubjectContent from './StudentSubjectContent';
import StudentProgress from './StudentProgress';
import DashboardHome from './DashboardHome';
import StudentLiveClasses from './StudentLiveClasses';
import StudentForum from './StudentForum';
import '../styles/Students.css';

const StudentDashboard = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedSubject, setSelectedSubject] = useState(null);

    const NavItem = ({ id, icon, label }) => (
        <li
            className={`s-nav-item ${activeTab === id ? 'active' : ''}`}
            onClick={() => {
                setActiveTab(id);
                setSelectedSubject(null);
            }}
        >
            <span style={{ fontSize: '18px' }}>{icon}</span> 
            {label}
        </li>
    );

    return (
        <div className="s-dashboard-layout">
        <aside className="s-sidebar">
            <div className="s-sidebar-header">
                <h2 className="s-logo-text">EduTrack</h2>
                <p style={{ margin: 0, fontSize: '12px', color: '#7d7aae', fontWeight: '800' }}>
                    STUDENT PORTAL
                </p>
            </div>

            <ul className="s-nav-list">
                <NavItem id="dashboard" icon="📊" label="My Dashboard" />
                <NavItem id="subjects" icon="📚" label="View Contents" />
                <NavItem id="live" icon="🎥" label="Zoom Meetings" />
                <NavItem id="progress" icon="📈" label="My Progress" />
                <NavItem id="messages" icon="💬" label="Messages" />
            </ul>

            <div className="s-sidebar-footer" style={{ padding: '20px' }}>
                <button className="s-btn-logout" onClick={onLogout}>
                    🚪 Logout
                </button>
            </div>
        </aside>

            {/* MAIN CONTENT AREA */}
            <main className="s-main-content">

                {activeTab === 'dashboard' && (
                    <DashboardHome user={user} />
                )}

                {activeTab === 'subjects' && (
                    <div>
                        {selectedSubject ? (
                            <StudentSubjectContent
                                subject={selectedSubject}
                                user={user}
                                onBack={() => setSelectedSubject(null)}
                            />
                        ) : (
                            <StudentSubjects
                                onSelectSubject={(sub) => setSelectedSubject(sub)}
                            />
                        )}
                    </div>
                )}

                {activeTab === 'live' && <StudentLiveClasses user={user} />}

                {activeTab === 'progress' && (
                    <StudentProgress user={user} />
                )}

                {activeTab === 'messages' && <StudentForum user={user} />}

            </main>
        </div>
    );
};

export default StudentDashboard;