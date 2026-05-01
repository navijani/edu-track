import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Admin.css';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // ✨ New Search State
  const [selectedUser, setSelectedUser] = useState(null);

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

  // ✨ Search Logic: Filters users based on Name, ID, or Role
  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(term) ||
      user.id.toLowerCase().includes(term) ||
      user.role.toLowerCase().includes(term)
    );
  });

  const handleDelete = async (id) => {
    if (window.confirm(`Are you sure you want to delete user ${id}?`)) {
      try {
        await axios.delete(`http://localhost:8080/api/users/register?id=${id}`);
        fetchUsers();
        if (selectedUser && selectedUser.id === id) setSelectedUser(null);
      } catch (err) {
        console.error("Error deleting user:", err);
      }
    }
  };

  const getRoleBadge = (role) => {
    const roleUpper = role.toUpperCase();
    if (roleUpper === 'TEACHER') return 'badge-purple';
    if (roleUpper === 'STUDENT') return 'badge-blue';
    if (roleUpper === 'PARENT') return 'badge-cyan';
    return 'badge-gray';
  };

  return (
    <div className="users-list-container">

      {/* --- SEARCH BAR SECTION --- */}
      <div className="search-container">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name, ID, or role..."
            className="glass-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="user-count">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {/* --- DETAIL MODAL OVERLAY (Keep as is) --- */}
      {selectedUser && (
        <div className="details-overlay">
          <div className="details-card glass-container">
            <button className="close-btn" onClick={() => setSelectedUser(null)}>×</button>
            <div className="details-header">
              <div className={`role-avatar ${getRoleBadge(selectedUser.role)}`}>
                {selectedUser.name.charAt(0)}
              </div>
              <h4>{selectedUser.name}</h4>
              <span className={`role-tag ${getRoleBadge(selectedUser.role)}`}>{selectedUser.role}</span>
            </div>
            <div className="details-grid">
              <div className="detail-item"><label>User ID</label><span>{selectedUser.id}</span></div>
              <div className="detail-item"><label>Email</label><span>{selectedUser.email}</span></div>
              {selectedUser.role === 'TEACHER' && (
                <div className="detail-item"><label>Subject</label><span>{selectedUser.subject}</span></div>
              )}
              {selectedUser.role === 'STUDENT' && (
                <div className="detail-item"><label>Class</label><span>{selectedUser.studentClass || 'N/A'}</span></div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- TABLE SECTION (Now uses filteredUsers) --- */}
      <div className="table-responsive">
        <table className="glass-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Full Name</th>
              <th>Role</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id} className="table-row">
                  <td className="user-id-cell">{user.id}</td>
                  <td className="user-name-cell">{user.name}</td>
                  <td>
                    <span className={`role-tag ${getRoleBadge(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button className="action-btn view" onClick={() => setSelectedUser(user)}>👁️ View</button>
                    <button className="action-btn delete" onClick={() => handleDelete(user.id)}>🗑️ Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  No users found matching "{searchTerm}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersList;