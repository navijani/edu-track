import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Admin.css';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // ✨ New Search State
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null); // ✨ Delete Modal State
  const [userToEdit, setUserToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({
    id: '', name: '', email: '', role: '', subject: '', childId: '', studentClass: ''
  });

  const fetchUsers = async () => {
    try {
      const res = await axios.get('https://edu-track-c6ml.onrender.com/api/users/register');
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

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await axios.delete(`https://edu-track-c6ml.onrender.com/api/users/register?id=${userToDelete.id}`);
      fetchUsers();
      if (selectedUser && selectedUser.id === userToDelete.id) setSelectedUser(null);
      setUserToDelete(null);
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  const handleEditClick = (user) => {
    setUserToEdit(user);
    setEditFormData({
      id: user.id,
      name: user.name || '',
      email: user.email || '',
      role: user.role || '',
      subject: user.subject || '',
      childId: user.childId || '',
      studentClass: user.studentClass || ''
    });
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const submitEdit = async () => {
    try {
      await axios.put(`https://edu-track-c6ml.onrender.com/api/users/register`, editFormData);
      fetchUsers();
      setUserToEdit(null);
    } catch (err) {
      console.error("Error updating user:", err);
      alert("Failed to update user. The backend might not support this yet.");
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

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {userToDelete && (
        <div className="admin-modal-overlay">
          <div className="admin-modal delete-modal">
            <div className="modal-header">
              <h3>Delete User</h3>
              <button className="close-modal" onClick={() => setUserToDelete(null)}>×</button>
            </div>
            <p style={{ color: '#8892b0', marginTop: '10px', fontSize: '0.95rem', lineHeight: '1.5' }}>
              Are you sure you want to delete user <strong>{userToDelete.name}</strong> ({userToDelete.id})? This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setUserToDelete(null)}>Cancel</button>
              <button className="danger-btn" onClick={confirmDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT USER MODAL --- */}
      {userToEdit && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Edit User: {userToEdit.id}</h3>
              <button className="close-modal" onClick={() => setUserToEdit(null)}>×</button>
            </div>
            <div className="input-group">
              <label>Name</label>
              <input type="text" name="name" value={editFormData.name} onChange={handleEditChange} />
            </div>
            <div className="input-group">
              <label>Email</label>
              <input type="email" name="email" value={editFormData.email} onChange={handleEditChange} />
            </div>
            <div className="input-group">
              <label>Role</label>
              <select name="role" value={editFormData.role.toLowerCase()} onChange={handleEditChange}>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="parent">Parent</option>
              </select>
            </div>
            {editFormData.role.toLowerCase() === 'teacher' && (
              <div className="input-group">
                <label>Subject</label>
                <input type="text" name="subject" value={editFormData.subject} onChange={handleEditChange} />
              </div>
            )}
            {editFormData.role.toLowerCase() === 'student' && (
              <div className="input-group">
                <label>Class</label>
                <input type="text" name="studentClass" value={editFormData.studentClass} onChange={handleEditChange} />
              </div>
            )}
            {editFormData.role.toLowerCase() === 'parent' && (
              <div className="input-group">
                <label>Child ID</label>
                <input type="text" name="childId" value={editFormData.childId} onChange={handleEditChange} />
              </div>
            )}
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setUserToEdit(null)}>Cancel</button>
              <button className="confirm-btn" onClick={submitEdit}>Save Changes</button>
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
                    <button className="action-btn" style={{ color: '#0ea5e9', marginLeft: '15px' }} onClick={() => handleEditClick(user)}>✏️ Edit</button>
                    <button className="action-btn delete" onClick={() => handleDeleteClick(user)}>🗑️ Delete</button>
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