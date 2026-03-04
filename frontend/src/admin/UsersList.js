import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null); // For viewing details

  // 1. Fetch all users from Java Backend
  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/users/register');
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. Delete a user
  const handleDelete = async (id) => {
    if (window.confirm(`Are you sure you want to delete user ${id}?`)) {
      try {
        await axios.delete(`http://localhost:8080/api/users/register?id=${id}`);
        alert("User deleted!");
        fetchUsers(); // Refresh the table automatically
        if (selectedUser && selectedUser.id === id) setSelectedUser(null);
      } catch (err) {
        console.error("Error deleting user:", err);
      }
    }
  };

  return (
    <div className="admin-card">
      <h3>All Registered Users</h3>
      
      {/* Detail View Section */}
      {selectedUser && (
        <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '20px', backgroundColor: '#f9f9f9' }}>
          <h4>User Details</h4>
          <p><strong>ID:</strong> {selectedUser.id}</p>
          <p><strong>Name:</strong> {selectedUser.name}</p>
          <p><strong>Email:</strong> {selectedUser.email}</p>
          <p><strong>Role:</strong> {selectedUser.role}</p>
          {selectedUser.role === 'TEACHER' && <p><strong>Subject:</strong> {selectedUser.subject}</p>}
          <button onClick={() => setSelectedUser(null)}>Close Details</button>
        </div>
      )}

      {/* Users Table */}
      <table border="1" width="100%" cellPadding="10" style={{ borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.role}</td>
              <td>
                <button onClick={() => setSelectedUser(user)} style={{ marginRight: '10px' }}>View</button>
                <button onClick={() => handleDelete(user.id)} style={{ color: 'red' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersList;