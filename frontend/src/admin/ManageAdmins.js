import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Admin.css';

const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:8080' 
  : 'https://edu-track-c6ml.onrender.com';

const ManageAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [newAdmin, setNewAdmin] = useState({ email: '', password: '', role: 'ADMIN' });
  const [adminToDelete, setAdminToDelete] = useState(null);
  
  // In a real app, this would come from a global state/context
  // We'll extract it from localStorage if available
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('eduUser');
    return saved ? JSON.parse(saved) : { email: 'unknown@example.com' };
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/admins`);
      if (response.data && response.data.success) {
        setAdmins(response.data.data);
      } else {
        setError('Failed to load admins');
      }
    } catch (err) {
      console.error(err);
      setError('Server error while loading admins');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/api/admins`, {
        email: newAdmin.email,
        password: newAdmin.password,
        role: newAdmin.role,
        createdBy: currentUser.email || currentUser.id || 'SYSTEM'
      });
      
      if (response.data && response.data.success) {
        alert('Admin created successfully!');
        setShowAddModal(false);
        setNewAdmin({ email: '', password: '', role: 'ADMIN' });
        fetchAdmins();
      } else {
        alert(response.data.message || 'Failed to create admin');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating admin. The email might already exist.');
    }
  };

  const confirmDelete = (email) => {
    setAdminToDelete(email);
    setShowDeleteModal(true);
  };

  const handleDeleteAdmin = async () => {
    if (!adminToDelete) return;
    
    try {
      const currentEmail = currentUser.email || currentUser.id;
      const response = await axios.delete(`${API_BASE_URL}/api/admins?email=${encodeURIComponent(adminToDelete)}&currentUser=${encodeURIComponent(currentEmail)}`);
      
      if (response.data && response.data.success) {
        alert('Admin removed successfully');
        setShowDeleteModal(false);
        setAdminToDelete(null);
        fetchAdmins();
      } else {
        alert(response.data.message || 'Failed to delete admin');
      }
    } catch (err) {
      console.error(err);
      // Show backend message if available
      const msg = err.response?.data?.message || 'Error deleting admin';
      alert(msg);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="manage-admins-container">
      <div className="manage-admins-header">
        <h2>Administrator Accounts</h2>
        <button className="add-admin-btn" onClick={() => setShowAddModal(true)}>
          <span>+</span> Add Admin
        </button>
      </div>

      {error && <div className="admin-error-banner">{error}</div>}

      <div className="admin-table-wrapper">
        {loading ? (
          <div className="admin-loading-state">
            <div className="spinner"></div>
            <p>Loading administrators...</p>
          </div>
        ) : admins.length === 0 ? (
          <div className="admin-empty-state">
            <p>No admins found in the system.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Admin ID</th>
                <th>Email / User ID</th>
                <th>Role Status</th>
                <th>Created Date</th>
                <th>Added By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id}>
                  <td>#{admin.id}</td>
                  <td>{admin.email}</td>
                  <td>
                    <span className={`role-badge ${admin.role === 'MAIN_ADMIN' ? 'main-admin' : 'standard-admin'}`}>
                      {admin.role === 'MAIN_ADMIN' ? '🛡️ MAIN ADMIN' : 'ADMIN'}
                    </span>
                  </td>
                  <td>{admin.createdAt ? admin.createdAt.substring(0, 10) : 'N/A'}</td>
                  <td>{admin.createdBy || 'SYSTEM'}</td>
                  <td>
                    {admin.role !== 'MAIN_ADMIN' && admin.email !== (currentUser.email || currentUser.id) ? (
                      <button 
                        className="delete-admin-btn" 
                        onClick={() => confirmDelete(admin.email)}
                        title="Remove Admin"
                      >
                        🗑️
                      </button>
                    ) : (
                      <button className="delete-admin-btn disabled" disabled title="Cannot delete this account">
                        🔒
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="modal-header">
              <h3>Create New Admin</h3>
              <button className="close-modal" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddAdmin}>
              <div className="input-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                  placeholder="admin@edutrack.com"
                  required 
                />
              </div>
              <div className="input-group">
                <label>Temporary Password</label>
                <input 
                  type="password" 
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                  placeholder="••••••••"
                  required 
                />
              </div>
              <div className="input-group">
                <label>Admin Role</label>
                <select 
                  value={newAdmin.role}
                  onChange={(e) => setNewAdmin({...newAdmin, role: e.target.value})}
                >
                  <option value="ADMIN">Standard Admin</option>
                  <option value="MAIN_ADMIN">Main Admin</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="confirm-btn">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal delete-modal">
            <div className="modal-header">
              <h3>Confirm Deactivation</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to remove the administrator <strong>{adminToDelete}</strong>?</p>
              <p className="warning-text">This action will revoke their access to the system.</p>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="danger-btn" onClick={handleDeleteAdmin}>Yes, Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAdmins;
