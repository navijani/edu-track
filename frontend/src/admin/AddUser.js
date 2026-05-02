import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Admin.css';

const AddUser = () => {
  const [user, setUser] = useState({ id: '', name: '', email: '', password: '', role: 'STUDENT', subject: '', childId: '', studentClass: '' });
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resSub = await axios.get('http://localhost:8080/api/subjects');
        setSubjects(resSub.data);
        const resStu = await axios.get('http://localhost:8080/api/teacher/students');
        setStudents(resStu.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8080/api/users/register', user);
      alert("✨ User registered successfully!");
      setUser({ id: '', name: '', email: '', password: '', role: 'STUDENT', subject: '', childId: '', studentClass: '' });
    } catch (err) {
      if (err.response && err.response.status === 409) {
          alert("❌ Registration failed: User ID or Email already exists.");
      } else {
          alert("❌ Registration failed: Please check if the ID or Email is already taken, or ensure the backend is running.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-user-container">
      <div className="form-glass-card">
        <div className="form-header">
          <div className="form-icon">👤</div>
          <h3>Create New Account</h3>
          <p>Fill in the details to onboard a new member to EduTrack</p>
        </div>

        <form onSubmit={handleSaveUser} className="admin-form">
          <div className="input-grid">
            <div className="input-group">
              <label>User ID</label>
              <input
                value={user.id}
                placeholder="e.g. 240235N"
                onChange={(e) => setUser({ ...user, id: e.target.value })}
                required
              />
            </div>

            <div className="input-group">
              <label>Full Name</label>
              <input
                value={user.name}
                placeholder="John Doe"
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                required
              />
            </div>

            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                value={user.email}
                placeholder="name@example.com"
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                required
              />
            </div>

            <div className="input-group">
              <label>Initial Password</label>
              <input
                type="password"
                value={user.password}
                placeholder="••••••••"
                onChange={(e) => setUser({ ...user, password: e.target.value })}
                required
              />
            </div>

            <div className="input-group">
              <label>System Role</label>
              {/* When the role changes, reset all role-specific fields (subject, childId, studentClass) to avoid stale data */}
              <select value={user.role} onChange={(e) => setUser({ ...user, role: e.target.value, subject: '', childId: '', studentClass: '' })}>
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
                <option value="PARENT">Parent</option>
              </select>
            </div>

            {/* Conditional Dropdown for Student: Only renders if the selected role is 'STUDENT' */}
            {user.role === 'STUDENT' && (
              <div className="input-group animated-field">
                <label>Assigned Class</label>
                <select value={user.studentClass} onChange={(e) => setUser({ ...user, studentClass: e.target.value })} required>
                  <option value="">Select Class</option>
                  <option value="Kindergarten">Kindergarten</option>
                  {/* Dynamically generate options for Grade 1 through Grade 12 */}
                  {[...Array(12)].map((_, i) => (
                    <option key={`Grade ${i + 1}`} value={`Grade ${i + 1}`}>Grade {i + 1}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Conditional Dropdown for Teacher */}
            {user.role === 'TEACHER' && (
              <div className="input-group animated-field">
                <label>Assigned Subject</label>
                <select value={user.subject} onChange={(e) => setUser({ ...user, subject: e.target.value })} required>
                  <option value="">Select Subject</option>
                  {subjects.map((sub) => (
                    <option key={sub.code} value={sub.title}>{sub.title}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Conditional Dropdown for Parent */}
            {user.role === 'PARENT' && (
              <div className="input-group animated-field">
                <label>Linked Student</label>
                <select value={user.childId} onChange={(e) => setUser({ ...user, childId: e.target.value })} required>
                  <option value="">Select Child</option>
                  {students.map((stu) => (
                    <option key={stu.id} value={stu.id}>{stu.name} ({stu.id})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Processing...' : 'Register User'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddUser;