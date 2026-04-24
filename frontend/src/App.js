import React, { useState } from 'react';
import IntroScreen from './components/IntroScreen';
import RoleSelection from './components/RoleSelection';
import LoginCredentials from './components/LoginCredentials';
import Dashboard from './components/Dashboard';
import AdminDashboard from './admin/AdminDashboard'; 
import TeacherDashboard from './teacher/TeacherDashboard';
import StudentDashboard from './student/StudentDashboard';
import ParentDashboard from './parent/ParentDashboard';

import './App.css';

function App() {
  const [screen, setScreen] = useState('intro');
  const [userRole, setUserRole] = useState('');
  const [currentUser, setCurrentUser] = useState(null); 

  const handleLogout = () => {
    setScreen('intro');
    setCurrentUser(null); 
    setUserRole('');
  };

  // This handles clicking the 🛡️ button in the corner
  const handleAdminInitiation = () => {
    setUserRole('ADMIN');
    setScreen('login-entry');
  };

  return (
    <div className="App">
      {/* 1. Introduction Screen */}
      {screen === 'intro' && <IntroScreen onLogin={() => setScreen('role')} />}
      
      {/* 2. Role Selection Screen */}
      {screen === 'role' && (
        <>
          <div style={{position: 'absolute', top: '20px', right: '20px', zIndex: 50}}>
            <button className="admin-btn-small" onClick={handleAdminInitiation}>
              🛡️ Admin Login
            </button>
          </div>
          
          <RoleSelection onSelect={(role) => { 
            setUserRole(role); 
            setScreen('login-entry'); 
          }} />
        </>
      )}

      {/* 3. Login Credentials Screen (Full Page for all roles) */}
      {screen === 'login-entry' && (
        <LoginCredentials 
          role={userRole} 
          onBack={() => setScreen('role')} 
          onSuccess={(userData) => {
            setCurrentUser(userData);
            // Unified routing based on role
            if (userRole === 'ADMIN') {
              setScreen('admin-dashboard');
            } else {
              setScreen('dashboard');
            }
          }} 
        />
      )}

      {/* 4. Admin Dashboard */}
      {screen === 'admin-dashboard' && (
        <AdminDashboard user={currentUser} onLogout={handleLogout} />
      )}

      {/* 5. User Dashboards Routing */}
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