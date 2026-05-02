import React, { useState } from 'react';
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
  const [screen, setScreen] = useState('intro');
  const [userRole, setUserRole] = useState('');

  // Store the actual user data after a successful login
  const [currentUser, setCurrentUser] = useState(null);

  const handleAdminAuth = () => {
    setScreen('admin-login');
  };

  const handleLogout = () => {
    setScreen('intro');
    setCurrentUser(null);
    setUserRole('');
  };

  // Function to go back to the role selection from contact page
  const handleBackToRole = () => {
    setScreen('role');
  };

  return (
    <div className="App">
      {/* Introduction Screen */}
      {screen === 'intro' && <IntroScreen onLogin={() => setScreen('role')} />}

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
            setScreen('login-entry');
          }}
            onContactClick={() => setScreen('contact')}
          />

          {/* Contact Administration Button at the bottom of Role Selection */}
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p>If you need some help, contact the administration panel.</p>
            <button className="contact-btn" onClick={() => setScreen('contact')}>
              Contact Us
            </button>
          </div>
        </>
      )}

      {/* Contact Us Screen */}
      {screen === 'contact' && (
        <ContactUs onBack={handleBackToRole} />
      )}

      {/* Admin Login Screen */}
      {screen === 'admin-login' && (
        <AdminLogin
          onBack={() => setScreen('role')}
          onSuccess={() => setScreen('admin-dashboard')}
        />
      )}

      {/* Admin Dashboard */}
      {screen === 'admin-dashboard' && (
        <AdminDashboard onLogout={handleLogout} />
      )}

      {/* Login Credentials Screen */}
      {screen === 'login-entry' && (
        <LoginCredentials
          role={userRole}
          onBack={() => setScreen('role')}
          onContactClick={() => setScreen('contact')}
          onSuccess={(userData) => {
            setCurrentUser(userData);
            setScreen('dashboard');
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
          ) : (
            <Dashboard role={userRole} user={currentUser} onLogout={handleLogout} />
          )}
        </>
      )}
    </div>
  );
}

export default App;