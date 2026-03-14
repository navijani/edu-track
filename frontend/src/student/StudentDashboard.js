import React, { useState } from 'react';
import StudentSubjects from './StudentSubjects';
import StudentSubjectContent from './StudentSubjectContent';
import StudentProgress from './StudentProgress';
import DashboardHome from './DashboardHome';
import StudentLiveClasses from './StudentLiveClasses';
import StudentForum from './StudentForum';

// Notice we accept the 'onLogout' prop here!
const StudentDashboard = ({ user, onLogout }) => {
    // State to track which tab is currently selected in the sidebar
    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedSubject, setSelectedSubject] = useState(null);

    // Sidebar Navigation Item Component for clean code
    const NavItem = ({ id, icon, label }) => (
        <li
            onClick={() => {
                setActiveTab(id);
                setSelectedSubject(null);
            }}

            style={{
                padding: '15px 20px',
                cursor: 'pointer',
                backgroundColor: activeTab === id ? '#34495e' : 'transparent',
                borderLeft: activeTab === id ? '4px solid #3498db' : '4px solid transparent',
                color: activeTab === id ? '#ecf0f1' : '#bdc3c7',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontWeight: activeTab === id ? 'bold' : 'normal'
            }}
        >
            <span>{icon}</span> {label}
        </li>
    );

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f6f7', textAlign: 'left' }}>

            {/*  LEFT SIDEBAR  */}
            <div style={{
                width: '250px',
                minWidth: '250px', /* Forces the width to never go below 250px */
                flexShrink: 0,     /* Strictly forbids Flexbox from squishing this element */
                height: '100vh',   /* Forces it to be exactly the height of the browser window */
                position: 'sticky',/* Pins it to the screen so it doesn't move when scrolling */
                top: 0,
                backgroundColor: '#2c3e50',
                color: 'white',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{ padding: '20px', textAlign: 'center', borderBottom: '1px solid #34495e' }}>
                    <h2 style={{ margin: 0, color: '#3498db' }}>EduTrack</h2>
                    <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#95a5a6' }}>Student Portal</p>
                </div>

                <div style={{ padding: '20px', textAlign: 'center' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#3498db', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', margin: '0 auto 10px auto' }}>
                        {user?.name?.charAt(0) || 'S'}
                    </div>
                    <h4 style={{ margin: 0 }}>{user?.name || 'Student Name'}</h4>
                </div>

                <ul style={{ listStyleType: 'none', padding: 0, margin: 0, flexGrow: 1 }}>
                    <NavItem id="dashboard" icon="🏠" label="Dashboard" />
                    <NavItem id="subjects" icon="📚" label="My Subjects" />
                    <NavItem id="live" icon="🎥" label="Live Classes" />
                    <NavItem id="progress" icon="📈" label="My Progress" />
                    <NavItem id="messages" icon="💬" label="Messages" />
                </ul>

                <div style={{ padding: '20px', borderTop: '1px solid #34495e' }}>
                    {/* NEW: Connect this button to your App.js onLogout function */}
                    <button
                        onClick={onLogout}
                        style={{ width: '100%', padding: '10px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        🚪 Logout
                    </button>
                </div>
            </div>

            {/*  MAIN CONTENT AREA  */}
            <div style={{ flexGrow: 1, padding: '30px', overflowY: 'auto' }}>

                {activeTab === 'dashboard' && (
                    <DashboardHome user={user} />
                )}

                {activeTab === 'subjects' && (
                    <div>
                        {/* If a subject is clicked, show the content. Otherwise, show the grid. */}
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
        </div>
    );
};

export default StudentDashboard;