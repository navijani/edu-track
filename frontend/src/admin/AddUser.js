import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddUser = () => {
  const [user, setUser] = useState({ id: '', name: '', email: '', password: '', role: 'STUDENT', subject: '' });
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/subjects');
        setSubjects(res.data);
      } catch (err) {
        console.error("Error fetching subjects:", err);
      }
    };
    fetchSubjects();
  }, []);



  const handleSaveUser = async () => {
    try {
      await axios.post('http://localhost:8080/api/users/register', user);
      alert("User saved successfully to MySQL!");
    } catch (err) {
      alert("Database error: Ensure Java backend is running.");
    }
  };

  return (
    <div className="admin-card">
      <h3>Register New User</h3>
      <input placeholder="User ID (e.g., 240235N)" onChange={(e) => setUser({ ...user, id: e.target.value })} />
      <input placeholder="Full Name" onChange={(e) => setUser({ ...user, name: e.target.value })} />
      <input placeholder="Email" onChange={(e) => setUser({ ...user, email: e.target.value })} />

      <input
        type="password"
        placeholder="Assign a Password"
        onChange={(e) => setUser({ ...user, password: e.target.value })}
      />
      <select onChange={(e) => setUser({ ...user, role: e.target.value })}>
        <option value="STUDENT">Student</option>
        <option value="TEACHER">Teacher</option>
        <option value="PARENT">Parent</option>
      </select>
      {user.role === 'TEACHER' && (
        <select onChange={(e) => setUser({ ...user, subject: e.target.value })}>
          <option value="">Select Assigned Subject</option>
          {subjects.map((sub) => (
            <option key={sub.code} value={sub.title}>
              {sub.title} ({sub.code})
            </option>
          ))}
        </select>
      )}
      <button onClick={handleSaveUser}>Save User</button>
    </div>
  );
};

export default AddUser;