import React, { useState, useEffect } from 'react';
import IntroScreen from './components/IntroScreen';
import RoleSelection from './components/RoleSelection';
import LoginCredentials from './components/LoginCredentials';
import Dashboard from './components/Dashboard';
import AdminDashboard from './admin/AdminDashboard';
import TeacherDashboard from './teacher/TeacherDashboard';
import StudentDashboard from './student/StudentDashboard';
import ParentDashboard from './parent/ParentDashboard';
import AdminLogin from './components/AdminLogin';
import ContactUs from './components/ContactUs';

import './App.css';

function App() {
  // Initialize state from localStorage if available to persist session on refresh
  const [screen, setScreen] = useState('intro');
  const [userRole, setUserRole] = useState(() => localStorage.getItem('eduRole') || '');
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('eduUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Sync session data to localStorage whenever it changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('eduUser', JSON.stringify(currentUser));
      localStorage.setItem('eduRole', userRole);
    } else {
      localStorage.removeItem('eduUser');
      localStorage.removeItem('eduRole');
    }
  }, [currentUser, userRole]);

  // ── ROUTING LOGIC (Back/Forward Support) ──────────────────────────────────
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '');
      if (!hash || hash === 'intro') {
        setScreen('intro');
      } else if (hash === 'role') {
        setScreen('role');
      } else if (hash === 'contact') {
        setScreen('contact');
      } else if (hash.startsWith('login')) {
        // e.g. #/login?role=STUDENT
        const params = new URLSearchParams(hash.split('?')[1]);
        const role = params.get('role');
        if (role) setUserRole(role.toUpperCase());
        setScreen('login-entry');
      } else if (hash.startsWith('dashboard')) {
        // If user is logged in, show dashboard. Otherwise, redirect to intro.
        const savedUser = localStorage.getItem('eduUser');
        if (currentUser || savedUser) {
          setScreen('dashboard');
        } else {
          navigate('intro');
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial sync

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentUser]); // Re-run if currentUser changes (for dashboard access)

  const navigate = (to, params = {}) => {
    let newHash = `#/${to}`;
    if (Object.keys(params).length > 0) {
      const query = new URLSearchParams(params).toString();
      newHash += `?${query}`;
    }
    window.location.hash = newHash;
  };

  const handleAdminAuth = () => {
    setUserRole('ADMIN');
    navigate('login-entry', { role: 'ADMIN' });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserRole('');
    localStorage.removeItem('eduUser');
    localStorage.removeItem('eduRole');
    navigate('intro');
  };

  const handleBackToRole = () => {
    navigate('role');
  };

  return (
    <div className="App">
      {/* Introduction Screen */}
      {screen === 'intro' && <IntroScreen onLogin={() => navigate('role')} />}

      {/* Role Selection Screen */}
      {screen === 'role' && (
        <>
          <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 50 }}>
            <button className="admin-btn-small" onClick={handleAdminAuth}>
              Admin Login
            </button>
          </div>

          <RoleSelection onSelect={(role) => {
            setUserRole(role);
            navigate('login-entry', { role });
          }}
            onContactClick={() => navigate('contact')}
          />

          {/* Contact Administration Button at the bottom of Role Selection */}
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p>If you need some help, contact the administration panel.</p>
            <button className="contact-btn" onClick={() => navigate('contact')}>
              Contact Us
            </button>
          </div>
        </>
      )}

      {/* Contact Us Screen */}
      {screen === 'contact' && (
        <ContactUs onBack={handleBackToRole} />
      )}



      {/* Login Credentials Screen */}
      {screen === 'login-entry' && (
        <LoginCredentials
          role={userRole}
          onBack={() => navigate('role')}
          onContactClick={() => navigate('contact')}
          onSuccess={(userData) => {
            setCurrentUser(userData);
            localStorage.setItem('eduUser', JSON.stringify(userData));
            localStorage.setItem('eduRole', userRole);
            // Directly set the screen instead of navigating via hash to avoid
            // the stale-closure race condition where handleHashChange reads the
            // old currentUser=null before React has processed the state update.
            setScreen('dashboard');
            window.location.hash = '#/dashboard';
          }}
        />
      )}

      {/* --- DASHBOARD ROUTING --- */}
      {screen === 'dashboard' && (
        <>
          {userRole.toUpperCase() === 'TEACHER' ? (
            <TeacherDashboard user={currentUser} onLogout={handleLogout} />
          ) : userRole.toUpperCase() === 'STUDENT' ? (
            <StudentDashboard user={currentUser} onLogout={handleLogout} />
          ) : userRole.toUpperCase() === 'PARENT' ? (
            <ParentDashboard user={currentUser} onLogout={handleLogout} />
          ) : userRole.toUpperCase() === 'ADMIN' ? (
            <AdminDashboard onLogout={handleLogout} />
          ) : (
            <Dashboard role={userRole} user={currentUser} onLogout={handleLogout} />
          )}
        </>
      )}
    </div>
  );
}

export default App;