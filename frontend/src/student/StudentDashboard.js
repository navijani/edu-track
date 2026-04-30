import React, { useState } from 'react';
import StudentSubjects from './StudentSubjects';
import StudentSubjectContent from './StudentSubjectContent';
import StudentProgress from './StudentProgress';
import DashboardHome from './DashboardHome';
import StudentLiveClasses from './StudentLiveClasses';
import StudentForum from './StudentForum';
import StudentNotifications from './StudentNotifications';
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
            <main className="s-main-content" style={{ position: 'relative' }}>
                {/* Notification Bell at Top Right */}
                <div style={{ position: 'absolute', top: '20px', right: '30px', zIndex: 100 }}>
                    <StudentNotifications user={user} />
                </div>

                <div style={{ paddingTop: '40px' }}>
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
                </div>

            </main>
        </div>
    );
};

export default StudentDashboard;