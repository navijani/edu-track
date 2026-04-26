import React, { useState, useEffect } from 'react';
import IntroScreen from './components/IntroScreen';
import RoleSelection from './components/RoleSelection';
import LoginCredentials from './components/LoginCredentials';
import Dashboard from './components/Dashboard';
import AdminDashboard from './admin/AdminDashboard'; 
import TeacherDashboard from './teacher/TeacherDashboard';
import StudentDashboard from './student/StudentDashboard';
import ParentDashboard from './parent/ParentDashboard'; 
import AdminLoginPage from './components/AdminLoginPage'; 
import './App.css';

function App() {
  // State to manage which screen is currently visible
  const [screen, setScreen] = useState('intro');
  
  // State to store the selected user role (Admin, Teacher, Student, Parent)
  const [userRole, setUserRole] = useState('');
  
  // State to store the logged-in user's data retrieved from the backend
  const [currentUser, setCurrentUser] = useState(null); 

  /**
   * Handle Browser Back Button logic
   * This ensures that when a user clicks the browser's back button, 
   * the app stays on the correct internal screen instead of exiting.
   */
  useEffect(() => {
    const handlePopState = () => {
      if (screen === 'login-entry') setScreen('role');
      else if (screen === 'role') setScreen('intro');
      else if (screen === 'admin-login-page') setScreen('role');
      else if (screen === 'dashboard' || screen === 'admin-dashboard') {
        if (window.confirm("Are you sure you want to logout?")) {
           handleLogout();
        } else {
           // Prevent the browser from actually going back if user cancels
           window.history.pushState(null, null, window.location.pathname);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [screen]);

  /**
   * Helper function to change screens and update browser history
   * This enables the back button functionality.
   */
  const changeScreen = (newScreen) => {
    window.history.pushState(null, null, window.location.pathname);
    setScreen(newScreen);
  };

  // Navigates to the Admin Login page
  const handleAdminAuth = () => {
    changeScreen('admin-login-page');
  };

  // Resets the application state to initial values upon logout
  const handleLogout = () => {
    setScreen('intro');
    setCurrentUser(null);
    setUserRole('');
  };

  return (
    <div className="App">
      {/* 1. Introduction Screen - Starting point of the app */}
      {screen === 'intro' && (
        <IntroScreen onLogin={() => changeScreen('role')} />
      )}
      
      {/* 2. Role Selection Screen - Allows users to choose their identity */}
      {screen === 'role' && (
        <>
          {/* Admin Login shortcut positioned at the top right */}
          <div style={{position: 'absolute', top: '20px', right: '20px', zIndex: 50}}>
            <button className="admin-btn-small" onClick={handleAdminAuth}>
              Admin Login
            </button>
          </div>
          
          <RoleSelection onSelect={(role) => { 
            setUserRole(role); 
            changeScreen('login-entry'); 
          }} />
        </>
      )}

      {/* 3. Admin Login Page */}
      {screen === 'admin-login-page' && (
        <AdminLoginPage 
          onBack={() => setScreen('role')} 
          onAdminSuccess={() => changeScreen('admin-dashboard')} 
        />
      )}

      {/* 4. Admin Dashboard - Dedicated view for system administrators */}
      {screen === 'admin-dashboard' && (
        <AdminDashboard onLogout={handleLogout} />
      )}

      {/* 5. Regular User Login Screen (Student, Teacher, Parent) */}
      {screen === 'login-entry' && (
        <LoginCredentials 
          role={userRole} 
          onBack={() => setScreen('role')} 
          onSuccess={(userData) => {
            setCurrentUser(userData);
            changeScreen('dashboard'); 
          }} 
        />
      )}

      {/* 6. Main Dashboard Router - Renders specific dashboard based on userRole */}
      {screen === 'dashboard' && (
        <>
          {userRole.toUpperCase() === 'TEACHER' ? (
            <TeacherDashboard user={currentUser} onLogout={handleLogout} />
          ) : userRole.toUpperCase() === 'STUDENT' ? (
            <StudentDashboard user={currentUser} onLogout={handleLogout} />
          ) : userRole.toUpperCase() === 'PARENT' ? (
            <ParentDashboard user={currentUser} onLogout={handleLogout} />
          ) : (
            /* Default fallback dashboard */
            <Dashboard role={userRole} user={currentUser} onLogout={handleLogout} />
          )}
        </>
      )}
    </div>
  );
}

export default App;