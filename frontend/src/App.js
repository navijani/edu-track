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

  // Unified logout function
  const handleLogout = () => {
    setScreen('intro');
    setCurrentUser(null); 
    setUserRole('');
  };

  // Triggered by the Admin button in the corner
  const handleAdminInitiation = () => {
    setUserRole('ADMIN');
    setScreen('login-entry');
  };

  const handleAdminAuth = () => {
    const email = prompt("Enter Admin Email:");
    const password = prompt("Enter Admin Password:");

    // YOUR CREDENTIALS ARE HERE:
    if (email === "2004@gmail.com" && password === "123") { 
      setScreen('admin-dashboard'); 
    } else {
      alert("Unauthorized Access!");
    }
  };
  
  return (
    <div className="App">
      {/* 1. Introduction Screen */}
      {screen === 'intro' && <IntroScreen onLogin={() => setScreen('role')} />}
      
      {/* 2. Role Selection Screen */}
      {screen === 'role' && (
        <>
          {/* Admin Login Button - Stays in corner per your request */}
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

      {/* 3. Login Credentials Screen (Now handles Admin, Student, Teacher, Parent) */}
      {screen === 'login-entry' && (
        <LoginCredentials 
          role={userRole} 
          onBack={() => setScreen('role')} 
          onSuccess={(userData) => {
            setCurrentUser(userData);
            // Route to Admin Dashboard or General Dashboards
            setScreen(userRole === 'ADMIN' ? 'admin-dashboard' : 'dashboard');
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