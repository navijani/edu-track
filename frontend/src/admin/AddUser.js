import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddUser = () => {
  // Added childId to the state
  const [user, setUser] = useState({ id: '', name: '', email: '', password: '', role: 'STUDENT', subject: '', childId: '' });
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]); // State to hold the list of students

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Subjects for Teachers
        const resSub = await axios.get('http://localhost:8080/api/subjects');
        setSubjects(resSub.data);
        
        // Fetch Students for Parents (Reusing the teacher API we made earlier!)
        const resStu = await axios.get('http://localhost:8080/api/teacher/students');
        setStudents(resStu.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  const handleSaveUser = async () => {
    try {
      await axios.post('http://localhost:8080/api/users/register', user);
      alert("User saved successfully to MySQL!");
      // Reset form after saving
      setUser({ id: '', name: '', email: '', password: '', role: 'STUDENT', subject: '', childId: '' });
    } catch (err) {
      alert("Database error: Ensure Java backend is running.");
    }
  };

  return (
    <div className="admin-card">
      <h3>Register New User</h3>
      <input 
        value={user.id} 
        placeholder="User ID (e.g., 240235N)" 
        onChange={(e) => setUser({ ...user, id: e.target.value })} 
      />
      <input 
        value={user.name} 
        placeholder="Full Name" 
        onChange={(e) => setUser({ ...user, name: e.target.value })} 
      />
      <input 
        value={user.email} 
        placeholder="Email" 
        onChange={(e) => setUser({ ...user, email: e.target.value })} 
      />
      <input
        type="password"
        value={user.password}
        placeholder="Assign a Password"
        onChange={(e) => setUser({ ...user, password: e.target.value })}
      />
      
      <select value={user.role} onChange={(e) => setUser({ ...user, role: e.target.value, subject: '', childId: '' })}>
        <option value="STUDENT">Student</option>
        <option value="TEACHER">Teacher</option>
        <option value="PARENT">Parent</option>
      </select>

      {/* Show Subject Dropdown ONLY if role is TEACHER */}
      {user.role === 'TEACHER' && (
        <select value={user.subject} onChange={(e) => setUser({ ...user, subject: e.target.value })}>
          <option value="">Select Assigned Subject</option>
          {subjects.map((sub) => (
            <option key={sub.code} value={sub.title}>
              {sub.title} ({sub.code})
            </option>
          ))}
        </select>
      )}

      {/* Show Student Dropdown ONLY if role is PARENT */}
      {user.role === 'PARENT' && (
        <select value={user.childId} onChange={(e) => setUser({ ...user, childId: e.target.value })}>
          <option value="">Select Child (Student)</option>
          {students.map((stu) => (
            <option key={stu.id} value={stu.id}>
              {stu.name} - ID: {stu.id}
            </option>
          ))}
        </select>
      )}

      <button onClick={handleSaveUser}>Save User</button>
    </div>
  );
};

export default AddUser;