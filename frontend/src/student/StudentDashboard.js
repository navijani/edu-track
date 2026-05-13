import React, { useState, useEffect } from 'react';

// ── Page-level imports ────────────────────────────────────────────────────────
import StudentSubjects      from './StudentSubjects';       // Subject card grid
import StudentSubjectContent from './StudentSubjectContent'; // Per-subject content viewer
import StudentProgress      from './StudentProgress';       // Progress charts & stats
import DashboardHome        from './DashboardHome';         // Home/overview tab
import StudentLiveClasses   from './StudentLiveClasses';    // Zoom meeting list
import StudentForum         from './StudentForum';          // Peer messaging/forum
import StudentNotifications from './StudentNotifications';  // Notification bell (top-right)
import UserProfile          from '../components/UserProfile'; // My Profile + Change Password
import '../styles/Students.css'; // All student-specific CSS classes (s-* and up-* prefixes)

/**
 * StudentDashboard – Top-level layout component for the Student role.
 *
 * Props:
 *   user     {object}   The logged-in student object returned by the login API.
 *                       Contains at minimum: id, name, role, studentClass.
 *   onLogout {function} Callback invoked when the student clicks "Logout".
 *                       Typically clears the auth state in the parent App component.
 *
 * Layout:
 *   ┌─────────────────────────────────────────────────────────────┐
 *   │  <aside> sidebar (fixed, glass)  │  <main> content area     │
 *   │  ─ Logo / portal label           │  ─ Notification bell     │
 *   │  ─ Navigation list (NavItem ×6)  │  ─ Active tab component  │
 *   │  ─ Logout button                 │                          │
 *   └─────────────────────────────────────────────────────────────┘
 *
 * Tab IDs and their corresponding components:
 *   'dashboard'  → <DashboardHome>          (overview / quick stats)
 *   'subjects'   → <StudentSubjects> or     (subject grid or content drill-down)
 *                  <StudentSubjectContent>
 *   'live'       → <StudentLiveClasses>     (upcoming / live Zoom meetings)
 *   'progress'   → <StudentProgress>        (completion charts and scores)
 *   'messages'   → <StudentForum>           (forum / peer messaging)
 *   'profile'    → <UserProfile>            (profile info + change password)
 */
const StudentDashboard = ({ user, onLogout }) => {

    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedSubject, setSelectedSubject] = useState(null);

    // ── SYNC TABS WITH URL HASH (Back/Forward Button Support) ──────────────────
    useEffect(() => {
        /**
         * Parses the current window.location.hash to set the initial component state.
         * Expected hash formats:
         *   #/dashboard
         *   #/subjects
         *   #/subjects/details?name=Mathematics
         */
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#/', '');
            if (!hash) {
                setActiveTab('dashboard');
                setSelectedSubject(null);
                return;
            }

            // Split into path and query (if any)
            // e.g. "subjects/details?name=Math" -> ["subjects", "details?name=Math"]
            const parts = hash.split('/');
            const tab = parts[0];
            
            setActiveTab(tab);

            // If we are in the subjects tab and have a sub-path for details
            if (tab === 'subjects' && parts[1] && parts[1].startsWith('details')) {
                const params = new URLSearchParams(parts[1].split('?')[1]);
                const subjectName = params.get('name');
                if (subjectName) {
                    // We only have the name in the URL, but the components expect a subject object.
                    // For now, we'll restore the state if possible or keep it as a partial object.
                    setSelectedSubject({ name: decodeURIComponent(subjectName) });
                }
            } else {
                setSelectedSubject(null);
            }
        };

        // Listen for browser navigation (back/forward)
        window.addEventListener('hashchange', handleHashChange);
        
        // Run once on mount to handle direct links
        handleHashChange();

        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    /**
     * Updates the URL hash to match the current component state.
     */
    const updateHash = (tab, subject = null) => {
        let newHash = `#/${tab}`;
        if (subject && tab === 'subjects') {
            newHash += `/details?name=${encodeURIComponent(subject.name)}`;
        }
        window.location.hash = newHash;
    };

    // Helper to change tab AND update URL
    const changeTab = (id) => {
        setActiveTab(id);
        setSelectedSubject(null);
        updateHash(id);
    };

    // Helper to select subject AND update URL
    const selectSubject = (sub) => {
        setSelectedSubject(sub);
        updateHash('subjects', sub);
    };

    // Helper to go back from subject AND update URL
    const clearSubject = () => {
        setSelectedSubject(null);
        updateHash('subjects');
    };

    /**
     * NavItem – reusable sidebar navigation list item.
     *
     * Applies the 'active' CSS class when its `id` matches `activeTab`, giving
     * it the purple gradient highlight defined in Students.css (.s-nav-item.active).
     *
     * Clicking also resets `selectedSubject` to null so navigating away from a
     * subject content view returns to the subject grid correctly.
     *
     * @param {string} id     Tab ID string (must match one of the activeTab values)
     * @param {string} icon   Emoji displayed before the label text
     * @param {string} label  Human-readable tab name shown in the sidebar
     */
    const NavItem = ({ id, icon, label }) => (
        <li
            className={`s-nav-item ${activeTab === id ? 'active' : ''}`}
            onClick={() => changeTab(id)}
        >
            <span style={{ fontSize: '18px' }}>{icon}</span> 
            {label}
        </li>
    );

    return (
        <div className="s-dashboard-layout">

            {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
            <aside className="s-sidebar">

                {/* Logo and portal label */}
                <div className="s-sidebar-header">
                    <h2 className="s-logo-text">EduTrack</h2>
                    <p style={{ margin: 0, fontSize: '12px', color: '#7d7aae', fontWeight: '800' }}>
                        STUDENT PORTAL
                    </p>
                </div>

                {/* Navigation list – one NavItem per tab */}
                <ul className="s-nav-list">
                    <NavItem id="dashboard" icon="📊" label="My Dashboard" />
                    <NavItem id="subjects"  icon="📚" label="View Contents" />
                    <NavItem id="live"      icon="🎥" label="Zoom Meetings" />
                    <NavItem id="progress"  icon="📈" label="My Progress" />
                    <NavItem id="messages"  icon="💬" label="Messages" />
                    {/* Profile tab contains both profile info and Change Password */}
                    <NavItem id="profile"   icon="👤" label="My Profile" />
                </ul>

                {/* Logout button pinned to the bottom of the sidebar */}
                <div className="s-sidebar-footer">
                    <button className="s-btn-logout" onClick={onLogout}>
                        🚪 Logout
                    </button>
                </div>
            </aside>

            {/* ── MAIN CONTENT AREA ───────────────────────────────────────────── */}
            <main className="s-main-content" style={{ position: 'relative' }}>

                {/*
                  * Notification bell – floated to the top-right corner of the main area.
                  * `position: absolute` keeps it in the corner regardless of scroll.
                  */}
                <div style={{ position: 'absolute', top: '20px', right: '30px', zIndex: 100 }}>
                    <StudentNotifications user={user} />
                </div>

                {/* Top padding to clear the notification bell */}
                <div style={{ paddingTop: '40px' }}>

                    {/* ── Tab: Dashboard (default) ── */}
                    {activeTab === 'dashboard' && (
                        <DashboardHome user={user} />
                    )}

                    {/* ── Tab: Subjects ── */}
                    {activeTab === 'subjects' && (
                        <div>
                            {selectedSubject ? (
                                /*
                                 * A subject has been selected from the grid.
                                 * Show the content viewer for that subject.
                                 * onBack resets selectedSubject → returns to grid.
                                 */
                                <StudentSubjectContent
                                    subject={selectedSubject}
                                    user={user}
                                    onBack={clearSubject}
                                />
                            ) : (
                                /*
                                 * No subject selected yet – show the subject card grid.
                                 * onSelectSubject stores the chosen subject object
                                 * and triggers the content viewer render above.
                                 */
                                <StudentSubjects
                                    onSelectSubject={selectSubject}
                                />
                            )}
                        </div>
                    )}

                    {/* ── Tab: Live Zoom Meetings ── */}
                    {activeTab === 'live' && <StudentLiveClasses user={user} />}

                    {/* ── Tab: My Progress ── */}
                    {activeTab === 'progress' && (
                        <StudentProgress user={user} />
                    )}

                    {/* ── Tab: Messages / Forum ── */}
                    {activeTab === 'messages' && <StudentForum user={user} />}

                    {/*
                      * ── Tab: My Profile ──
                      * Renders UserProfile which fetches the full profile from the backend
                      * (GET /api/users/profile?userId=...) and also embeds <ChangePassword>
                      * so the student can update their password without a separate tab.
                      */}
                    {activeTab === 'profile' && <UserProfile user={user} />}

                </div>

            </main>
        </div>
    );
};

export default StudentDashboard;