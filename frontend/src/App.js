import React, { useState } from 'react';
import IntroScreen from './components/IntroScreen';
import RoleSelection from './components/RoleSelection';
import LoginCredentials from './components/LoginCredentials';
import Dashboard from './components/Dashboard';
import AdminDashboard from './admin/AdminDashboard'; 
import TeacherDashboard from './teacher/TeacherDashboard';

import './App.css';

function App() {
  const [screen, setScreen] = useState('intro');
  const [userRole, setUserRole] = useState('');
  
  // NEW: Store the actual user data after a successful login
  const [currentUser, setCurrentUser] = useState(null); 

  const handleAdminAuth = () => {
    const email = prompt("Enter Admin Email:");
    const password = prompt("Enter Admin Password:");

    if (email === "navindujanith2004@gmail.com" && password === "123456") {
      setScreen('admin-dashboard'); 
    } else {
      alert("Unauthorized Access!");
    }
  };

  const handleLogout = () => {
    setScreen('intro');
    setCurrentUser(null); // Clear user data on logout
    setUserRole('');
  };

  return (
    <div className="App">
      {/* Introduction Screen */}
      {screen === 'intro' && <IntroScreen onLogin={() => setScreen('role')} />}
      
      {/* Role Selection Screen */}
      {screen === 'role' && (
        <>
          <div style={{position: 'absolute', top: '10px', right: '10px'}}>
            <button className="admin-btn-small" onClick={handleAdminAuth}>Admin Login</button>
          </div>
          <RoleSelection onSelect={(role) => { 
            setUserRole(role); 
            setScreen('login-entry'); 
          }} />
        </>
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
          onSuccess={(userData) => {
            setCurrentUser(userData); // Save the logged-in user's data
            setScreen('dashboard');   // Move to the dashboard phase
          }} 
        />
      )}

      {/*  DASHBOARD ROUTING  */}
      {screen === 'dashboard' && (
        <>
          {/* If Teacher, show the dedicated Teacher Dashboard */}
          {userRole.toUpperCase() === 'TEACHER' ? (
            <TeacherDashboard user={currentUser} onLogout={handleLogout} />
          ) : (
            /* Otherwise, show the generic Dashboard for Students/Parents */
            <Dashboard role={userRole} user={currentUser} onLogout={handleLogout} />
          )}
        </>
      )}
    </div>
  );
}

export default App;